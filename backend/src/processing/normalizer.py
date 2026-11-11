"""Data normalization utilities for dates, times, and procurement text."""

import re
from typing import Optional


def normalize_text(text: Optional[str]) -> str:
    """Clean extra spaces, newlines, mojibake, and special unicode control characters."""
    if not text:
        return "Not Specified"
    cleaned = text
    # Clean mojibake dashes / quotes
    cleaned = cleaned.replace("â€“", "-").replace("â€”", "-").replace("–", "-").replace("—", "-").replace("\ufffd", "-")
    cleaned = cleaned.replace("â€™", "'").replace("â€œ", '"').replace("â€\x9d", '"')
    cleaned = re.sub(r"[\u200b\u200e\u200f\ufeff]", "", cleaned)
    cleaned = re.sub(r"[ \t]+", " ", cleaned)
    cleaned = re.sub(r"\n\s*\n+", "\n\n", cleaned)
    cleaned = cleaned.strip()
    return cleaned if cleaned else "Not Specified"


def normalize_date_string(date_str: Optional[str]) -> str:
    """Normalize date strings while preserving crucial procurement details (time, timezone).

    Example inputs:
      - 'July 9, 2024 at 2:00 PM CST' -> 'July 9, 2024 at 2:00 PM CST'
      - '27-JUN-2024 14:00:00' -> 'June 27, 2024 2:00 PM'
      - '07/09/2024 03:00 PM EDT' -> '07/09/2024 03:00 PM EDT'
    """
    if not date_str or date_str.lower() in ("not specified", "none", "null"):
        return "Not Specified"

    cleaned = date_str.strip()

    # Pattern: 27-JUN-2024 14:00:00 or 26-MAY-2024 08:00:00
    m_oracle = re.match(r"^(\d{1,2})-([A-Za-z]{3})-(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?", cleaned)
    if m_oracle:
        day, mon, yr, hr, mn, sc = m_oracle.groups()
        month_map = {
            "jan": "January", "feb": "February", "mar": "March", "apr": "April",
            "may": "May", "jun": "June", "jul": "July", "aug": "August",
            "sep": "September", "oct": "October", "nov": "November", "dec": "December"
        }
        full_mon = month_map.get(mon.lower(), mon)
        time_part = ""
        if hr is not None and mn is not None:
            hour_int = int(hr)
            ampm = "AM" if hour_int < 12 else "PM"
            display_hr = hour_int if (hour_int in (0, 12)) else (hour_int % 12)
            if display_hr == 0:
                display_hr = 12
            time_part = f" {display_hr}:{mn} {ampm}"
        return f"{full_mon} {int(day)}, {yr}{time_part}"

    # Return as-is if already human-readable with timezone or explicit time
    return cleaned
