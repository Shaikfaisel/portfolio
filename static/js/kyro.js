/* ===========================================
   KYRO.JS
   Floating portfolio assistant.
   Rule-based (keyword) responses only — no
   external API calls. Can also navigate the
   page (scroll to sections, open resume/links).
=========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const kyro = document.getElementById("kyro");
    if (!kyro) return;

    const launcher = kyro.querySelector(".kyro-launcher");
    const closeBtn = kyro.querySelector(".kyro-close");
    const messagesEl = document.getElementById("kyro-messages");
    const quickRepliesEl = document.getElementById("kyro-quick-replies");
    const form = document.getElementById("kyro-form");
    const input = document.getElementById("kyro-input");

    const NAME = "Shaik";

    /* ---------------- Knowledge base ---------------- */

    const topics = {

        about: {
            label: "About Me",
            reply: `I'm ${NAME}'s assistant. He's an Electronics & Communication Engineering graduate who works across Python development, AI/ML, embedded systems, VLSI/PCB design and full-stack web development — basically the hardware-to-software full stack.`,
            action: () => scrollToSection("about")
        },

        skills: {
            label: "Skills",
            reply: "His stack spans Programming (Python, C, C++, JavaScript), AI/ML (TensorFlow, OpenCV, Machine Learning), Web Development (Flask, HTML5, CSS3), Databases (MySQL, SQLite, Firebase), Embedded Systems (Arduino, 8051, Embedded C, IoT) and tooling (Git, GitHub, Linux). Scrolling you to the Skills section now.",
            action: () => scrollToSection("skills")
        },

        projects: {
            label: "Projects",
            reply: "Two highlights: an AI-powered Brain Computer Interface for early neurological-disorder detection (award-winning), and a Smart Online Voting System with facial recognition. Taking you to the Projects section.",
            action: () => scrollToSection("projects")
        },

        education: {
            label: "Education",
            reply: "He holds a B.E. in Electronics & Communication Engineering (2025 graduate), and received the Best Major Project Award from the Karnataka State Council for Science & Technology (KSCST).",
            action: () => scrollToSection("about")
        },

        resume: {
            label: "Resume",
            reply: "Opening his resume in a new tab now.",
            action: () => window.open("/static/resume.pdf", "_blank")
        },

        contact: {
            label: "Contact",
            reply: "You can reach him through the Contact form, or via GitHub / LinkedIn below. Scrolling you there now.",
            action: () => scrollToSection("contact")
        },

        github: {
            label: "GitHub",
            reply: "Opening his GitHub profile.",
            action: () => window.open("https://github.com/Shaikfaisel", "_blank")
        },

        linkedin: {
            label: "LinkedIn",
            reply: "Opening his LinkedIn profile.",
            action: () => window.open("https://www.linkedin.com/in/shaik-faisel565-linkedi/", "_blank")
        }

    };

    const keywordMap = [
        { keys: ["about", "who", "yourself", "faisel"], topic: "about" },
        { keys: ["skill", "tech", "stack", "language", "tool"], topic: "skills" },
        { keys: ["project", "work", "built", "portfolio"], topic: "projects" },
        { keys: ["education", "degree", "college", "study", "award", "graduate"], topic: "education" },
        { keys: ["resume", "cv"], topic: "resume" },
        { keys: ["contact", "email", "reach", "hire", "phone"], topic: "contact" },
        { keys: ["github", "git"], topic: "github" },
        { keys: ["linkedin"], topic: "linkedin" }
    ];

    const fallback = "I can tell you about his About, Skills, Projects, Education, Resume or Contact info — try one of the quick options below, or type a keyword like \"skills\" or \"projects\".";

    /* ---------------- Helpers ---------------- */

    function scrollToSection(id) {
        const el = document.getElementById(id);
        if (el) {
            closeWindow();
            setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
        }
    }

    function addMessage(text, who) {
        const bubble = document.createElement("div");
        bubble.className = `kyro-msg ${who}`;
        bubble.textContent = text;
        messagesEl.appendChild(bubble);
        messagesEl.scrollTop = messagesEl.scrollHeight;
        return bubble;
    }

    function showTyping() {
        const typing = document.createElement("div");
        typing.className = "kyro-typing";
        typing.innerHTML = "<span></span><span></span><span></span>";
        messagesEl.appendChild(typing);
        messagesEl.scrollTop = messagesEl.scrollHeight;
        return typing;
    }

    function respond(topicKey) {
        const topic = topics[topicKey];
        const typing = showTyping();

        setTimeout(() => {
            typing.remove();
            addMessage(topic ? topic.reply : fallback, "bot");
            if (topic && topic.action) topic.action();
        }, 500 + Math.random() * 400);
    }

    function matchTopic(text) {
        const lower = text.toLowerCase();
        for (const entry of keywordMap) {
            if (entry.keys.some(k => lower.includes(k))) return entry.topic;
        }
        return null;
    }

    function renderQuickReplies() {
        quickRepliesEl.innerHTML = "";
        Object.keys(topics).slice(0, 6).forEach(key => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.textContent = topics[key].label;
            btn.addEventListener("click", () => {
                addMessage(topics[key].label, "user");
                respond(key);
            });
            quickRepliesEl.appendChild(btn);
        });
    }

    function openWindow() {
        kyro.classList.add("open");
        if (!messagesEl.dataset.greeted) {
            messagesEl.dataset.greeted = "1";
            const typing = showTyping();
            setTimeout(() => {
                typing.remove();
                addMessage(`Hi 👋 I'm KYRO, ${NAME}'s portfolio assistant. Ask me about his skills, projects, education or how to reach him.`, "bot");
            }, 600);
        }
        setTimeout(() => input && input.focus(), 350);
    }

    function closeWindow() {
        kyro.classList.remove("open");
    }

    /* ---------------- Events ---------------- */

    launcher.addEventListener("click", () => {
        kyro.classList.contains("open") ? closeWindow() : openWindow();
    });

    closeBtn.addEventListener("click", closeWindow);

    document.addEventListener("click", (e) => {
        if (kyro.classList.contains("open") && !kyro.contains(e.target)) {
            closeWindow();
        }
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        addMessage(text, "user");
        input.value = "";

        const topicKey = matchTopic(text);
        respond(topicKey);
    });

    renderQuickReplies();

});
