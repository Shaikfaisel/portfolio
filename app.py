"""
Flask app for the portfolio.

Contact-form emails are sent from the backend via the Resend
HTTP API (https://resend.com) instead of raw SMTP.

Why: most free-tier hosts (Render included, since Sept 2025)
block outbound SMTP ports (25/465/587) to stop free accounts
being used for spam. Resend's API runs over normal HTTPS
(port 443), which isn't blocked, so this works on Render's
free tier without upgrading.

Setup:
1. Sign up at https://resend.com using shaikfaisel129@gmail.com
   (the same address messages should land in).
2. Dashboard -> API Keys -> Create API Key -> copy it.
3. Locally: put it in a `.env` file next to this script:
       RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   On Render: Dashboard -> your service -> Environment ->
   Add Environment Variable -> key RESEND_API_KEY.
4. Without a verified custom domain, Resend only allows
   sending FROM its shared onboarding@resend.dev address TO
   the email you signed up with -- which is exactly this
   contact form's use case, so no domain setup is required.

Until RESEND_API_KEY is set, /send-message responds with a
clear "not configured yet" error instead of crashing, so the
rest of the site keeps working.
"""

import os

import requests
from flask import Flask, jsonify, render_template, request

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # python-dotenv is optional -- RESEND_API_KEY can also be
    # set as a real environment variable instead of a .env file.
    pass

app = Flask(__name__)

# Where contact-form messages are delivered.
RECEIVER_EMAIL = "shaikfaisel129@gmail.com"

RESEND_API_URL = "https://api.resend.com/emails"
RESEND_FROM = "Portfolio Contact <onboarding@resend.dev>"


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/send-message", methods=["POST"])
def send_message():

    data = request.get_json(silent=True) or request.form

    name = (data.get("from_name") or "").strip()
    email = (data.get("reply_to") or "").strip()
    subject = (data.get("subject") or "").strip()
    message = (data.get("message") or "").strip()

    if not all([name, email, subject, message]):
        return jsonify(success=False, error="Please fill in every field."), 400

    if "@" not in email or "." not in email.split("@")[-1]:
        return jsonify(success=False, error="Please enter a valid email address."), 400

    api_key = os.environ.get("RESEND_API_KEY")

    if not api_key:
        app.logger.warning("RESEND_API_KEY not set -- contact form cannot send mail yet.")
        return jsonify(
            success=False,
            error="The contact form isn't fully set up yet -- please email me directly for now."
        ), 503

    body = (
        f"New message from your portfolio contact form\n\n"
        f"Name: {name}\n"
        f"Email: {email}\n"
        f"Subject: {subject}\n\n"
        f"{message}"
    )

    try:
        resp = requests.post(
            RESEND_API_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "from": RESEND_FROM,
                "to": [RECEIVER_EMAIL],
                "reply_to": email,
                "subject": f"Portfolio contact: {subject}",
                "text": body,
            },
            timeout=10,
        )
    except requests.RequestException as exc:
        app.logger.error("Resend request failed: %s", exc)
        return jsonify(
            success=False,
            error="Couldn't send your message right now -- please try again shortly or email me directly."
        ), 500

    if resp.status_code >= 400:
        app.logger.error("Resend API error %s: %s", resp.status_code, resp.text)
        return jsonify(
            success=False,
            error="Couldn't send your message right now -- please try again shortly or email me directly."
        ), 500

    return jsonify(success=True)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )
