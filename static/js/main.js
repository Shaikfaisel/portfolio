/* ===========================================
   MAIN.JS
   Navbar, mobile menu, smooth scroll, scroll-
   reveal, active-link tracking, back-to-top,
   project card expand/collapse, subtle hero
   parallax, and contact-form validation + send.
=========================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ===========================
       Mobile Menu
    =========================== */

    const menuBtn = document.querySelector(".menu-btn");
    const navMenu = document.querySelector(".nav-menu");

    if (menuBtn && navMenu) {

        menuBtn.addEventListener("click", () => {
            navMenu.classList.toggle("active");
        });

        document.querySelectorAll(".nav-menu a").forEach(link => {
            link.addEventListener("click", () => {
                navMenu.classList.remove("active");
            });
        });

    }

    /* ===========================
       Navbar Scroll State
    =========================== */

    const navbar = document.querySelector(".navbar");

    function updateNavbar() {
        if (!navbar) return;
        navbar.classList.toggle("scrolled", window.scrollY > 40);
    }

    window.addEventListener("scroll", updateNavbar, { passive: true });
    updateNavbar();

    /* ===========================
       Active Nav Link Tracking
    =========================== */

    const navLinks = Array.from(document.querySelectorAll(".nav-menu a"));
    const sections = navLinks
        .map(link => document.querySelector(link.getAttribute("href")))
        .filter(Boolean);

    if (sections.length) {

        const navObserver = new IntersectionObserver((entries) => {

            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                navLinks.forEach(link => link.classList.remove("active"));

                const match = navLinks.find(
                    link => link.getAttribute("href") === `#${entry.target.id}`
                );

                if (match) match.classList.add("active");
            });

        }, { threshold: 0.4, rootMargin: "-40% 0px -40% 0px" });

        sections.forEach(section => navObserver.observe(section));

    }

    /* ===========================
       Smooth Scroll
    =========================== */

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {

        anchor.addEventListener("click", function (e) {

            const targetId = this.getAttribute("href");
            if (targetId.length < 2) return;

            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });

        });

    });

    /* ===========================
       Scroll-Reveal
    =========================== */

    const revealObserver = new IntersectionObserver((entries) => {

        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
                revealObserver.unobserve(entry.target);
            }
        });

    }, { threshold: 0.12 });

    document.querySelectorAll("section").forEach(section => {
        section.classList.add("hidden");
        revealObserver.observe(section);
    });

    /* ===========================
       Project Card Expand / Collapse
    =========================== */

    document.querySelectorAll(".project-detail-toggle").forEach(btn => {

        btn.addEventListener("click", () => {

            const card = btn.closest(".project-card");
            if (!card) return;

            const isOpen = card.classList.toggle("open");
            btn.setAttribute("aria-expanded", isOpen ? "true" : "false");

            const label = btn.querySelector(".toggle-label");
            if (label) {
                label.textContent = isOpen ? "Hide details" : "View details";
            }

        });

    });

    /* ===========================
       Subtle Hero Parallax (desktop only)
    =========================== */

    const profileCard = document.querySelector(".profile-card");
    const heroSection = document.querySelector(".hero");

    if (profileCard && heroSection && window.matchMedia("(min-width: 1001px)").matches
        && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {

        let raf = null;

        heroSection.addEventListener("mousemove", (e) => {

            if (raf) return;

            raf = requestAnimationFrame(() => {

                const rect = heroSection.getBoundingClientRect();
                const relX = (e.clientX - rect.left) / rect.width - 0.5;
                const relY = (e.clientY - rect.top) / rect.height - 0.5;

                profileCard.style.transform =
                    `rotateY(${relX * 6}deg) rotateX(${relY * -6}deg)`;

                raf = null;

            });

        });

        heroSection.addEventListener("mouseleave", () => {
            profileCard.style.transform = "rotateY(0) rotateX(0)";
        });

    }

    /* ===========================
       Contact Form: validation + send
    =========================== */

    const form = document.getElementById("contact-form");
    const status = document.getElementById("form-status");

    if (form && status) {

        function setError(field, hasError) {
            field.classList.toggle("field-error", hasError);
        }

        function isValidEmail(value) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        }

        function validate() {

            let valid = true;

            ["from_name", "subject", "message"].forEach(name => {
                const field = form.elements[name];
                const empty = !field.value.trim();
                setError(field, empty);
                if (empty) valid = false;
            });

            const emailField = form.elements["reply_to"];
            const emailOk = isValidEmail(emailField.value.trim());
            setError(emailField, !emailOk);
            if (!emailOk) valid = false;

            return valid;
        }

        form.querySelectorAll("input, textarea").forEach(field => {
            field.addEventListener("input", () => setError(field, false));
        });

        form.addEventListener("submit", function (e) {

            e.preventDefault();

            if (!validate()) {
                status.textContent = "Please fill in all fields with a valid email.";
                status.style.color = "#f87171";
                return;
            }

            const submitBtn = form.querySelector("button[type='submit']");

            status.textContent = "Sending...";
            status.style.color = "#B794F6";
            if (submitBtn) submitBtn.disabled = true;

            const payload = {
                from_name: form.elements["from_name"].value.trim(),
                reply_to: form.elements["reply_to"].value.trim(),
                subject: form.elements["subject"].value.trim(),
                message: form.elements["message"].value.trim()
            };

            fetch("/send-message", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
                .then(res => res.json().then(data => ({ ok: res.ok, data })))
                .then(({ ok, data }) => {

                    if (!ok || !data.success) {
                        throw new Error(data && data.error ? data.error : "Send failed");
                    }

                    status.textContent = "Message sent. I'll get back to you soon.";
                    status.style.color = "#4ade80";
                    form.reset();

                })
                .catch((err) => {
                    status.textContent = err.message === "Send failed"
                        ? "Something went wrong. Please email me directly."
                        : err.message;
                    status.style.color = "#f87171";
                    console.error(err);
                })
                .finally(() => {
                    if (submitBtn) submitBtn.disabled = false;
                });

        });

    }

});

/* ===========================
   BACK TO TOP
=========================== */

document.addEventListener("DOMContentLoaded", () => {

    const topBtn = document.getElementById("backToTop");
    if (!topBtn) return;

    window.addEventListener("scroll", () => {
        topBtn.classList.toggle("show", window.scrollY > 500);
    }, { passive: true });

    topBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

});
