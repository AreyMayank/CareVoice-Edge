from typing import Tuple, Optional
import requests
from app.core.config import settings
from app.core.logging import log

def send_telegram_alert(message: str) -> Tuple[bool, Optional[str]]:
    if not settings.TELEGRAM_BOT_TOKEN or not settings.TELEGRAM_CHAT_ID:
        log.info(f"[Dry Run] Telegram alert: {message}")
        return True, None
    try:
        url = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage"
        resp = requests.post(url, json={"chat_id": settings.TELEGRAM_CHAT_ID, "text": message}, timeout=5)
        if resp.status_code == 200:
            log.info("Telegram notification sent successfully.")
            return True, None
        else:
            log.error(f"Failed to send Telegram notification: {resp.text}")
            return False, resp.text
    except Exception as e:
        log.error(f"Telegram dispatch error: {e}")
        return False, str(e)
