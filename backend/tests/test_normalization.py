"""Unit tests for text and date normalizers."""

from src.processing.normalizer import normalize_date_string, normalize_text


def test_normalize_oracle_dates():
    """Verify Oracle style dates convert accurately with time preserved."""
    assert normalize_date_string("27-JUN-2024 14:00:00") == "June 27, 2024 2:00 PM"
    assert normalize_date_string("26-MAY-2024 08:00:00") == "May 26, 2024 8:00 AM"


def test_normalize_preserves_timezones_and_explicit_times():
    """Verify timezones (CST, EDT) and explicit times are strictly preserved."""
    assert normalize_date_string("July 9, 2024 at 2:00 PM CST") == "July 9, 2024 at 2:00 PM CST"
    assert normalize_date_string("07/09/2024 03:00 PM EDT") == "07/09/2024 03:00 PM EDT"
    assert normalize_date_string("06/10/2024 at 2:00 PM EDT") == "06/10/2024 at 2:00 PM EDT"


def test_normalize_date_null_handling():
    """Verify null and empty dates normalize to 'Not Specified'."""
    assert normalize_date_string(None) == "Not Specified"
    assert normalize_date_string("") == "Not Specified"
    assert normalize_date_string("Not Specified") == "Not Specified"


def test_normalize_text_cleaning():
    """Verify removal of mojibake, zero-width chars, and excess spaces."""
    raw = "  Dell  Latitude\u200b 5550 – Laptop\n\n\n\nWith Copilot  "
    cleaned = normalize_text(raw)
    assert cleaned == "Dell Latitude 5550 - Laptop\n\nWith Copilot"
    assert "\u200b" not in cleaned
