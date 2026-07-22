/* ===========================================
   TYPING.JS
   Cycles roles into #typing-text
=========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const el = document.getElementById("typing-text");
    if (!el) return;

    const roles = [
        "Python Developer",
        "AI / ML Engineer",
        "Full Stack Developer",
        "Electronics & Communication Engineer"
    ];

    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function tick() {
        const current = roles[roleIndex];

        if (!deleting) {
            charIndex++;
            el.textContent = current.slice(0, charIndex);
            if (charIndex === current.length) {
                deleting = true;
                setTimeout(tick, 1400);
                return;
            }
        } else {
            charIndex--;
            el.textContent = current.slice(0, charIndex);
            if (charIndex === 0) {
                deleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
            }
        }

        setTimeout(tick, deleting ? 40 : 80);
    }

    tick();

});
