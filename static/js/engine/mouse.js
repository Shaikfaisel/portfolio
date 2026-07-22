/* ===========================================
   MOUSE.JS
   Shared, throttled cursor tracker.
   Consumed by engine/background.js to drive
   the PCB glow / trace-highlight interaction.
=========================================== */

window.PCBMouse = (function () {

    const state = {
        x: null,
        y: null,
        active: false,
        radius: 190
    };

    let ticking = false;

    function onMove(e) {

        const point = e.touches ? e.touches[0] : e;

        if (!point) return;

        if (!ticking) {

            ticking = true;

            requestAnimationFrame(() => {

                state.x = point.clientX;
                state.y = point.clientY;
                state.active = true;

                ticking = false;

            });

        }

    }

    function onLeave() {
        state.active = false;
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave, { passive: true });
    window.addEventListener("touchend", onLeave, { passive: true });
    window.addEventListener("blur", onLeave);

    return state;

})();
