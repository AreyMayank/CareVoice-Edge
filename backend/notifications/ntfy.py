from typing import Tuple, Optional
import requests
from app.core.config import settings
from app.core.logging import log

def send_ntfy_alert(message: str, title: str = "CareVoice Alert") -> Tuple[bool, Optional[str]]:
    topic = settings.NTFY_TOPIC or "carevoice_alerts"
    try:
        url = f"https://ntfy.sh/{topic}"
        resp = requests.post(url, data=message.encode("utf-8"), headers={"Title": title, "Priority": "high"}, timeout=5)
        if resp.status_code == 200:
            log.info(f"ntfy notification published to topic '{topic}'.")
            return True, None
        else:
            log.warning(f"ntfy response error: {resp.text}")
            return False, resp.text
    except Exception as e:
        log.error(f"ntfy dispatch error: {e}")
        return False, str(e)
