"""Application configuration management for RFP Intelligence Extractor."""

import os
from pathlib import Path
from typing import Literal, Optional
from dotenv import load_dotenv
from pydantic import BaseModel, Field

# Load environment variables from .env if present
load_dotenv()


class Settings(BaseModel):
    """Application settings with environment variable fallbacks."""

    # Provider & Model Settings
    llm_provider: Literal["mock", "groq", "openai", "gemini", "anthropic"] = Field(
        default="mock"
    )
    groq_api_key: Optional[str] = Field(default=None)
    groq_model: str = Field(default="openai/gpt-oss-120b")

    openai_api_key: Optional[str] = Field(default=None)
    openai_model: str = Field(default="gpt-4o-mini")
    openai_base_url: Optional[str] = Field(default=None)

    gemini_api_key: Optional[str] = Field(default=None)
    gemini_model: str = Field(default="gemini-1.5-flash")

    anthropic_api_key: Optional[str] = Field(default=None)
    anthropic_model: str = Field(default="claude-3-5-sonnet-20241022")

    # LLM Inference Parameters
    max_tokens: int = Field(default=4096)
    temperature: float = Field(default=0.0)

    # Runtime Modes
    demo_mode: bool = Field(default=False)
    debug: bool = Field(default=False)
    log_level: str = Field(default="INFO")

    # Directories
    project_root: Path = Field(default_factory=lambda: Path(__file__).resolve().parent.parent)
    data_dir: Path = Field(default_factory=lambda: Path(__file__).resolve().parent.parent / "data")
    input_dir: Path = Field(default_factory=lambda: Path(__file__).resolve().parent.parent / "data" / "input")
    output_dir: Path = Field(default_factory=lambda: Path(__file__).resolve().parent.parent / "data" / "output")
    reference_dir: Path = Field(default_factory=lambda: Path(__file__).resolve().parent.parent / "data" / "reference")

    @classmethod
    def load(cls, demo_mode: bool = False, debug: bool = False) -> "Settings":
        """Load settings dynamically from environment with CLI overrides."""
        provider_env = os.getenv("LLM_PROVIDER", "mock").lower()
        if demo_mode:
            provider_env = "mock"

        # Check API keys
        groq_key = os.getenv("GROQ_API_KEY")
        openai_key = os.getenv("OPENAI_API_KEY")
        gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        anthropic_key = os.getenv("ANTHROPIC_API_KEY")

        # Auto-switch to real provider if key is provided and provider wasn't explicitly mock
        if provider_env == "mock" and not demo_mode:
            if groq_key:
                provider_env = "groq"
            elif openai_key:
                provider_env = "openai"
            elif gemini_key:
                provider_env = "gemini"
            elif anthropic_key:
                provider_env = "anthropic"

        return cls(
            llm_provider=provider_env,  # type: ignore
            groq_api_key=groq_key,
            groq_model=os.getenv("GROQ_MODEL", "openai/gpt-oss-120b"),
            openai_api_key=openai_key,
            openai_model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            openai_base_url=os.getenv("OPENAI_BASE_URL"),
            gemini_api_key=gemini_key,
            gemini_model=os.getenv("GEMINI_MODEL", "gemini-1.5-flash"),
            anthropic_api_key=anthropic_key,
            anthropic_model=os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022"),
            max_tokens=int(os.getenv("MAX_TOKENS", "4096")),
            temperature=float(os.getenv("TEMPERATURE", "0.0")),
            demo_mode=demo_mode or provider_env == "mock",
            debug=debug or os.getenv("DEBUG", "false").lower() in ("true", "1", "yes"),
            log_level=os.getenv("LOG_LEVEL", "INFO"),
        )


settings = Settings.load()
