<div align="center">

# ⚡ Shaik Faisel — Portfolio v2

### Electronics Engineer × Software Developer

A premium, futuristic, single-page developer portfolio with a custom
**animated PCB (circuit board) background**, a **rule-based AI assistant
named KYRO**, and a real working **contact form backed by Flask + Gmail SMTP**.

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=for-the-badge&logo=flask&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

</div>

---

## 📖 Overview

This is my personal developer portfolio — built from scratch with Flask,
vanilla JavaScript, and hand-written CSS (no framework, no template).
It's designed to feel like something out of Apple / Linear / Vercel /
Stripe, but themed around electronics: a canvas engine draws live copper
traces, component pads, and travelling energy pulses across the entire
page, reacting to the cursor in real time.

## ✨ Features

- 🖤 **Glassmorphic, dark UI** — pure black background, electric-purple
  accents, soft glow, blurred glass panels throughout.
- 🔌 **Animated PCB background** — a custom `<canvas>` engine (no
  external libraries) draws motherboard-style copper traces, component
  pads, IC-chip outlines, and glowing energy pulses that travel the
  board continuously at 60fps, with mouse-reactive highlighting.
- 🤖 **KYRO — AI portfolio assistant** — a floating glass chat widget
  (bottom-right) that answers questions about my background, skills,
  projects, education, and contact info, and can navigate the page for
  you. Fully rule-based — no external API calls, no API key required.
- 🗂️ **Expandable project cards** — each project includes a
  Problem → Solution → My Contribution breakdown plus key metrics,
  hidden behind a smooth "View details" toggle.
- ✉️ **Real working contact form** — submissions are sent server-side
  via Flask + Gmail SMTP straight to my inbox (no third-party form
  service, no exposed API keys in the frontend).
- 📱 **Fully responsive** — from large desktop monitors down to small
  phones.
- ⚡ **Performance-minded** — optimized images, `requestAnimationFrame`
  animation loop, throttled resize/scroll listeners, lazy-loaded
  project images.

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, Flask, smtplib (Gmail SMTP) |
| Frontend | HTML5, CSS3 (custom design system, no framework), Vanilla JavaScript |
| Background engine | HTML5 Canvas API |
| Icons / Fonts | Remix Icon, Google Fonts (Inter) |
| Config | python-dotenv (`.env`) |

## 📁 Project Structure

```
Portfolio-v2/
├── app.py                     # Flask app + /send-message email route
├── requirements.txt
├── .env.example                # Copy to .env and fill in your own values
├── static/
│   ├── css/                    # variables, styles, navbar, hero, about,
│   │                            # skills, project, awards, contact, footer, kyro
│   ├── js/
│   │   ├── engine/
│   │   │   ├── background.js   # PCB canvas engine
│   │   │   ├── mouse.js        # shared cursor tracker
│   │   │   └── typing.js       # hero typing effect
│   │   ├── kyro.js              # KYRO assistant logic
│   │   └── main.js              # nav, scroll-reveal, form handling, etc.
│   ├── images/                  # profile photo
│   └── project-images/          # project screenshots
├── templates/
│   └── index.html
└── README.md
```

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Shaikfaisel/Portfolio-v2.git
cd Portfolio-v2
```

### 2. Create a virtual environment (recommended)

```bash
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure the contact form (optional but recommended)

The contact form sends real emails via Gmail SMTP. Copy `.env.example`
to `.env` and fill in your details:

```
EMAIL_USER=your.gmail.address@gmail.com
EMAIL_PASS=your16characterapppassword
```

`EMAIL_PASS` must be a Gmail **App Password**, not your normal Gmail
password — generate one at
[myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
(requires 2-Step Verification to be enabled on the account).

> ⚠️ Never commit your real `.env` file — it's already listed in
> `.gitignore`.

### 5. Run it

```bash
python app.py
```

Then open **http://127.0.0.1:5000** in your browser.

## 🗂️ Featured Projects

### 🧠 Early Stage Neurological Disorder Detection (BCI)
AI-powered Brain Computer Interface using EEG signal processing and
Machine Learning to detect early markers of neurological disorders.
Winner — **Best Major Project Award**, Karnataka State Council for
Science & Technology (KSCST).
[View repo →](https://github.com/Shaikfaisel/BCI-Epilepsy-Monitoring-System)

### 🗳️ Smart Online Voting System
Secure online voting platform integrating facial recognition, a Flask
backend, and a MySQL database for authenticated, transparent elections.
[View repo →](https://github.com/Shaikfaisel/Online_Voting_System)

## 📬 Contact

- **Email:** shaikfaisel129@gmail.com
- **GitHub:** [@Shaikfaisel](https://github.com/Shaikfaisel)
- **LinkedIn:** [shaik-faisel565-linkedi](https://www.linkedin.com/in/shaik-faisel565-linkedi/)

## 📄 License

This project is open for reference and learning purposes. Please don't
republish the content (resume, photos, project write-ups) as your own —
feel free to fork the code/design as a starting point for your own
portfolio.

---

<div align="center">

Built with Flask & ❤️ by **Shaik Faisel**

</div>
