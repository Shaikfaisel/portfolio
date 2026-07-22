/* ===========================================
   BACKGROUND.JS
   Full-page animated PCB (printed circuit board)
   canvas: copper traces, component pads, IC chips,
   travelling energy pulses, mouse-reactive glow.

   Design goals:
   - No particles / floating dots / random circles.
   - 60fps: single RAF loop, DPR-aware canvas,
     throttled resize, minimal per-frame allocation,
     shadowBlur used sparingly (pulses only).
   - Respects prefers-reduced-motion.
=========================================== */

(function () {

    const canvas = document.getElementById("bg-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });

    const styles = getComputedStyle(document.documentElement);
    const traceColor   = (styles.getPropertyValue("--pcb-trace")      || "rgba(109,74,255,.16)").trim();
    const traceDim      = (styles.getPropertyValue("--pcb-trace-dim") || "rgba(109,74,255,.07)").trim();
    const padColor       = (styles.getPropertyValue("--pcb-pad")      || "rgba(139,92,246,.5)").trim();
    const pulseColor    = (styles.getPropertyValue("--pcb-pulse")     || "#B794F6").trim();
    const pulseCore      = (styles.getPropertyValue("--pcb-pulse-core") || "#EDE4FF").trim();

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isSmall = window.innerWidth < 720;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0;

    let grid = [];       // { x1,y1,x2,y2, orientation }
    let pads = [];        // { x, y, r, pulse }
    let chips = [];       // { x, y, w, h }
    let pulses = [];      // { path:[{x,y}], t, speed, segIndex }

    const CELL = isSmall ? 150 : 118;

    /* ---------------- BUILD LAYOUT ---------------- */

    function buildLayout() {

        grid = [];
        pads = [];
        chips = [];
        pulses = [];

        const cols = Math.ceil(w / CELL) + 2;
        const rows = Math.ceil(h / CELL) + 2;

        // Node grid points, with small random jitter removed on
        // purpose (Manhattan-only routing reads as a real PCB).
        const nodes = [];
        for (let r = 0; r < rows; r++) {
            nodes.push([]);
            for (let c = 0; c < cols; c++) {
                nodes[r].push({
                    x: c * CELL - CELL,
                    y: r * CELL - CELL,
                    used: false
                });
            }
        }

        // Route horizontal + vertical copper traces between
        // random neighbouring nodes (skips some to feel organic).
        const density = isSmall ? 0.34 : 0.44;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {

                const a = nodes[r][c];

                if (c < cols - 1 && Math.random() < density) {
                    const b = nodes[r][c + 1];
                    grid.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
                }

                if (r < rows - 1 && Math.random() < density * 0.8) {
                    const b = nodes[r + 1][c];
                    grid.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
                }

            }
        }

        // Component pads at a subset of trace endpoints.
        const padCandidates = new Set();
        grid.forEach(seg => {
            if (Math.random() < 0.16) padCandidates.add(`${seg.x1},${seg.y1}`);
            if (Math.random() < 0.16) padCandidates.add(`${seg.x2},${seg.y2}`);
        });
        padCandidates.forEach(key => {
            const [x, y] = key.split(",").map(Number);
            pads.push({ x, y, r: 2.6 + Math.random() * 2 });
        });

        // A handful of IC-chip rectangles for scale/authenticity.
        const chipCount = isSmall ? 2 : 5;
        for (let i = 0; i < chipCount; i++) {
            const cw = 46 + Math.random() * 40;
            const ch = 26 + Math.random() * 22;
            chips.push({
                x: Math.random() * w,
                y: Math.random() * h,
                w: cw,
                h: ch
            });
        }

        // Energy pulses: each follows a short chain of connected
        // segments picked by walking the grid randomly.
        const pulseCount = reduceMotion ? 0 : (isSmall ? 10 : 22);
        const byStart = {};
        grid.forEach(seg => {
            const k1 = `${seg.x1},${seg.y1}`;
            (byStart[k1] = byStart[k1] || []).push(seg);
            const k2 = `${seg.x2},${seg.y2}`;
            (byStart[k2] = byStart[k2] || []).push({ x1: seg.x2, y1: seg.y2, x2: seg.x1, y2: seg.y1 });
        });

        const keys = Object.keys(byStart);

        for (let i = 0; i < pulseCount && keys.length; i++) {

            let cur = keys[(Math.random() * keys.length) | 0];
            const path = [];
            let steps = 3 + ((Math.random() * 5) | 0);

            while (steps-- > 0) {
                const options = byStart[cur];
                if (!options || !options.length) break;
                const seg = options[(Math.random() * options.length) | 0];
                path.push(seg);
                cur = `${seg.x2},${seg.y2}`;
            }

            if (path.length) {
                pulses.push({
                    path,
                    seg: 0,
                    t: Math.random(),
                    speed: 0.006 + Math.random() * 0.01
                });
            }

        }

    }

    /* ---------------- RESIZE (throttled) ---------------- */

    let resizeTimer = null;

    function resize() {

        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = window.innerWidth;
        h = window.innerHeight;

        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        buildLayout();

    }

    function onResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 160);
    }

    window.addEventListener("resize", onResize);

    /* ---------------- DRAW ---------------- */

    const mouse = window.PCBMouse || { x: null, y: null, active: false, radius: 190 };

    function drawTraces() {

        ctx.lineWidth = 1;

        for (let i = 0; i < grid.length; i++) {

            const s = grid[i];
            let color = traceDim;

            if (mouse.active) {
                const mx = (s.x1 + s.x2) / 2;
                const my = (s.y1 + s.y2) / 2;
                const dx = mx - mouse.x;
                const dy = my - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < mouse.radius) {
                    color = traceColor;
                }
            }

            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.moveTo(s.x1, s.y1);
            ctx.lineTo(s.x2, s.y2);
            ctx.stroke();

        }

    }

    function drawPads() {

        for (let i = 0; i < pads.length; i++) {

            const p = pads[i];
            let glow = false;

            if (mouse.active) {
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                if (dx * dx + dy * dy < mouse.radius * mouse.radius) glow = true;
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = glow ? pulseColor : padColor;

            if (glow) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = pulseColor;
            }

            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r + 2.4, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(139,92,246,.18)";
            ctx.lineWidth = 1;
            ctx.stroke();

        }

    }

    function drawChips() {

        ctx.lineWidth = 1;

        for (let i = 0; i < chips.length; i++) {

            const c = chips[i];

            ctx.strokeStyle = "rgba(139,92,246,.14)";
            ctx.strokeRect(c.x, c.y, c.w, c.h);

            const pinCount = 4;
            for (let p = 1; p <= pinCount; p++) {
                const px = c.x + (c.w / (pinCount + 1)) * p;
                ctx.beginPath();
                ctx.moveTo(px, c.y);
                ctx.lineTo(px, c.y - 6);
                ctx.moveTo(px, c.y + c.h);
                ctx.lineTo(px, c.y + c.h + 6);
                ctx.stroke();
            }

        }

    }

    function drawPulses() {

        for (let i = 0; i < pulses.length; i++) {

            const pulse = pulses[i];
            const seg = pulse.path[pulse.seg];
            if (!seg) continue;

            const x = seg.x1 + (seg.x2 - seg.x1) * pulse.t;
            const y = seg.y1 + (seg.y2 - seg.y1) * pulse.t;

            ctx.beginPath();
            ctx.arc(x, y, 2.2, 0, Math.PI * 2);
            ctx.fillStyle = pulseCore;
            ctx.shadowBlur = 14;
            ctx.shadowColor = pulseColor;
            ctx.fill();
            ctx.shadowBlur = 0;

            pulse.t += pulse.speed;

            if (pulse.t >= 1) {
                pulse.t = 0;
                pulse.seg = (pulse.seg + 1) % pulse.path.length;
            }

        }

    }

    function frame() {

        ctx.clearRect(0, 0, w, h);

        drawTraces();
        drawChips();
        drawPads();
        if (!reduceMotion) drawPulses();

        requestAnimationFrame(frame);

    }

    resize();
    requestAnimationFrame(frame);

})();
