"""
Flask app for the portfolio.

Contact-form emails are sent from the backend via Gmail SMTP.
To make it actually deliver mail, create a file named `.env`
next to this file (it is NOT included, and should never be
committed) containing:

    EMAIL_USER=your.gmail.address@gmail.com
    EMAIL_PASS=your16characterapppassword

EMAIL_PASS must be a Gmail "App Password", not your normal
Gmail password (Google Account -> Security -> 2-Step
Verification -> App passwords). Regular passwords are
rejected by Gmail's SMTP server.

Until EMAIL_USER / EMAIL_PASS are set, /send-message will
respond with a clear "not configured yet" error instead of
crashing, so the rest of the site keeps working.
"""

import os
import smtplib
from email.mime.text import MIMEText

from flask import Flask, jsonify, render_template, request

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # python-dotenv is optional -- if it isn't installed,
    # EMAIL_USER / EMAIL_PASS can still be set as real
    # environment variables instead of a .env file.
    pass

app = Flask(__name__)

# Where contact-form messages are delivered.
RECEIVER_EMAIL = "shaikfaisel129@gmail.com"


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

    sender = os.environ.get("EMAIL_USER")
    app_password = os.environ.get("EMAIL_PASS")

    if not sender or not app_password:
        app.logger.warning("EMAIL_USER / EMAIL_PASS not set -- contact form cannot send mail yet.")
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

    msg = MIMEText(body)
    msg["Subject"] = f"Portfolio contact: {subject}"
    msg["From"] = sender
    msg["To"] = RECEIVER_EMAIL
    msg["Reply-To"] = email

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10) as server:
            server.login(sender, app_password)
            server.sendmail(sender, [RECEIVER_EMAIL], msg.as_string())
    except Exception as exc:
        app.logger.error("Failed to send contact-form email: %s", exc)
        return jsonify(
            success=False,
            error="Couldn't send your message right now -- please try again shortly or email me directly."
        ), 500

    return jsonify(success=True)


if __name__ == "__main__":
    app.run(debug=True)
