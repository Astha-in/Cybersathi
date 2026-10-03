from typing import Any


class RiskEngine:
    """Combines threat signals into a final risk assessment."""

    SEVERITY_WEIGHTS = {
        "critical": 35,
        "high": 25,
        "medium": 15,
        "low": 5,
    }

    def calculate_score(
        self,
        indicators: list[dict[str, Any]],
    ) -> int:
        if not indicators:
            return 0

        # Give each unique indicator a score
        score = 0
        seen_types = set()

        for indicator in indicators:
            indicator_type = indicator.get("type")
            severity = indicator.get("severity", "low")

            # Avoid counting the exact same indicator twice
            if indicator_type in seen_types:
                continue

            seen_types.add(indicator_type)

            score += self.SEVERITY_WEIGHTS.get(
                severity,
                0,
            )

        return min(score, 100)

    def get_risk_level(self, score: int) -> str:
        if score >= 75:
            return "critical"
        elif score >= 50:
            return "high"
        elif score >= 25:
            return "medium"
        else:
            return "low"


risk_engine = RiskEngine()