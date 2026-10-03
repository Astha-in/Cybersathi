from app.agents.state import CyberSathiState
from app.services.openrouter_service import openrouter_service


class AIReasoningAgent:
    def analyze(self, state: CyberSathiState) -> CyberSathiState:
        text = state.get("input_text", "")
        indicators = state.get("indicators", [])
        risk_score = state.get("risk_score", 0)
        risk_level = state.get("risk_level", "low")
        rag_context = state.get(
            "rag_context",
            "No additional cybersecurity knowledge was retrieved.",
        )

        try:
            ai_analysis = openrouter_service.analyze_threat(
                text=text,
                indicators=indicators,
                risk_score=risk_score,
                risk_level=risk_level,
                rag_context=rag_context,
            )

            state["ai_analysis"] = ai_analysis
            state["final_response"] = ai_analysis

        except Exception as exc:
            state["ai_analysis"] = ""
            state["final_response"] = (
                "AI reasoning was unavailable. "
                "The deterministic security analysis "
                "is still available."
            )
            state["error"] = str(exc)

        return state


ai_reasoning_agent = AIReasoningAgent()