import re

from app.agents.state import CyberSathiState
from app.services.url_analyzer import url_analyzer


class URLAnalysisAgent:
    """Analyze URLs found inside CyberSathi input."""

    def analyze(
        self,
        state: CyberSathiState,
    ) -> CyberSathiState:
        text = state.get(
            "input_text",
            "",
        )

        urls = re.findall(
            r"https?://[^\s]+",
            text,
        )

        url_results = []

        for url in urls:
            result = url_analyzer.analyze(url)
            url_results.append(result)

        state["url_results"] = url_results

        # Add URL indicators to the existing
        # threat indicators.
        indicators = state.get(
            "indicators",
            [],
        )

        for result in url_results:
            indicators.extend(
                result.get(
                    "indicators",
                    [],
                )
            )

        state["indicators"] = indicators

        return state


url_analysis_agent = URLAnalysisAgent()