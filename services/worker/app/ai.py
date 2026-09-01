from __future__ import annotations

"""Optional AI abstraction.

The ingestion pipeline deliberately does not require AI. Rules, explicit metadata and deterministic
normalization run first. An operator can attach a local/OpenAI-compatible model later for only the
uncertain items. This prevents a million-row import from creating a million paid API calls.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
import httpx
from app.models import ContentItem


@dataclass
class EnrichmentResult:
    item: ContentItem
    rationale: str = ""


class AiProvider(ABC):
    @abstractmethod
    def enrich_batch(self, items: list[ContentItem]) -> list[EnrichmentResult]: ...


class DisabledAiProvider(AiProvider):
    def enrich_batch(self, items: list[ContentItem]) -> list[EnrichmentResult]:
        return [EnrichmentResult(item=x, rationale="AI disabled; deterministic pipeline only") for x in items]


class OpenAICompatibleProvider(AiProvider):
    """Example hook for Ollama/LM Studio/OpenAI-compatible servers.

    This provider is intentionally not auto-enabled. Configure a local model and adapt the structured
    response schema before production use.
    """

    def __init__(self, base_url: str, model: str, api_key: str = ""):
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.api_key = api_key

    def enrich_batch(self, items: list[ContentItem]) -> list[EnrichmentResult]:
        # Safety-first starter behavior: return deterministic items unchanged until the operator
        # supplies a reviewed prompt/schema. The HTTP client exists here to make the extension point clear.
        _ = httpx.Client(base_url=self.base_url, headers={"Authorization": f"Bearer {self.api_key}"} if self.api_key else {})
        return [EnrichmentResult(item=x, rationale=f"AI hook configured for {self.model}; no automatic mutation in starter") for x in items]
