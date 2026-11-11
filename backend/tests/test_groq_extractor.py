"""Unit tests for Groq LLM Extractor and configuration."""

from unittest.mock import MagicMock, patch
import pytest
from src.config import Settings
from src.extraction.llm_extractor import GroqLLMExtractor, MockLLMExtractor, get_llm_extractor


def test_groq_settings_loading():
    """Verify settings parses Groq parameters properly."""
    settings = Settings(
        llm_provider="groq",
        groq_api_key="test_key_123",
        groq_model="openai/gpt-oss-120b",
    )
    assert settings.llm_provider == "groq"
    assert settings.groq_api_key == "test_key_123"
    assert settings.groq_model == "openai/gpt-oss-120b"


def test_get_llm_extractor_groq_missing_key():
    """Verify fallback to mock extractor if GROQ_API_KEY is absent."""
    settings = Settings(llm_provider="groq", groq_api_key=None)
    extractor = get_llm_extractor(settings)
    assert isinstance(extractor, MockLLMExtractor)


def test_get_llm_extractor_groq_with_key():
    """Verify GroqLLMExtractor creation when key is provided."""
    settings = Settings(llm_provider="groq", groq_api_key="gsk_test")
    with patch("groq.Groq") as mock_groq:
        extractor = get_llm_extractor(settings)
        assert isinstance(extractor, GroqLLMExtractor)
        assert extractor.model == "openai/gpt-oss-120b"


def test_groq_extractor_extract_mocked():
    """Test extract method parses valid JSON responses from Groq."""
    settings = Settings(llm_provider="groq", groq_api_key="gsk_test")
    extractor = GroqLLMExtractor(settings)

    mock_chat_completion = MagicMock()
    mock_choice = MagicMock()
    mock_choice.message.content = '{"bid_number": "RFP-999", "title": "Test Groq Extraction"}'
    mock_chat_completion.choices = [mock_choice]

    extractor.client = MagicMock()
    extractor.client.chat.completions.create.return_value = mock_chat_completion

    result = extractor.extract(
        doc_name="test.pdf",
        doc_type="pdf",
        doc_role="main_rfp",
        text="Sample RFP document",
    )

    assert result["bid_number"] == "RFP-999"
    assert result["title"] == "Test Groq Extraction"
