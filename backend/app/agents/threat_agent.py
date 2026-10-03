from app.agents.state import CyberSathiState
from app.services.threat_detector import threat_detector


class ThreatAnalysisAgent:
    """Run deterministic threat analysis inside LangGraph."""

    def analyze(
        self,
        state: CyberSathiState,
    ) -> CyberSathiState:
        text = state.get(
            "input_text",
            "",
        )

        result = threat_detector.analyze(
            text
        )

        state["indicators"] = result[
            "indicators"
        ]

        state["risk_score"] = result[
            "risk_score"
        ]

        state["risk_level"] = result[
            "risk_level"
        ]

        state["threat_type"] = result[
            "threat_type"
        ]

        return state


threat_analysis_agent = ThreatAnalysisAgent()