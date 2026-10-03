from app.agents.state import CyberSathiState


class InputRouter:
    """Determine which analysis path should handle the input."""

    def route(
        self,
        state: CyberSathiState,
    ) -> CyberSathiState:
        text = state.get(
            "input_text",
            "",
        ).strip()

        if not text:
            state["input_type"] = "text"
            return state

        lowered = text.lower()

        if (
            lowered.startswith("http://")
            or lowered.startswith("https://")
        ):
            state["input_type"] = "url"

        else:
            state["input_type"] = "text"

        return state


input_router = InputRouter()