from app.agents.state import CyberSathiState
from app.services.risk_engine import risk_engine


class RiskAnalysisAgent:
    def analyze(self, state: CyberSathiState) -> CyberSathiState:
        indicators = state.get("indicators", [])

        risk_score = risk_engine.calculate_score(indicators)
        risk_level = risk_engine.get_risk_level(risk_score)

        state["risk_score"] = risk_score
        state["risk_level"] = risk_level

        return state


risk_analysis_agent = RiskAnalysisAgent()