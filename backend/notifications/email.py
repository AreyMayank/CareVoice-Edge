import smtplib
from email.mime.text import MIMEText
from typing import Tuple, Optional
from app.core.config import settings
from app.core.logging import log

def send_email_alert(subject: str, body: str) -> Tuple[bool, Optional[str]]:
    if not settings.SMTP_SERVER or not settings.ALERT_EMAIL:
        log.info(f"[Dry Run] Email alert: Subject='{subject}' Body='{body}'")
        return True, None
    try:
        msg = MIMEText(body)
        msg['Subject'] = subject
        msg['From'] = settings.SMTP_USER or "alerts@carevoice.local"
        msg['To'] = settings.ALERT_EMAIL

        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
            if settings.SMTP_PASSWORD:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
        log.info("Email alert dispatched successfully.")
        return True, None
    except Exception as e:
        log.error(f"Email dispatch error: {e}")
        return False, str(e)
