from typing import Any


class ThreatDetector:
    """Rule-based cybersecurity threat detector."""

    def analyze(self, text: str) -> dict[str, Any]:
        text_lower = text.lower()

        indicators = []

        # 1. Urgency / pressure detection
        urgency_words = [
            "click here",
            "verify your account",
            "account blocked",
            "account suspended",
            "urgent",
            "immediately",
        ]

        if any(word in text_lower for word in urgency_words):
            indicators.append(
                {
                    "type": "urgency_or_pressure",
                    "description": (
                        "The message uses urgent or threatening "
                        "language to pressure the user."
                    ),
                    "severity": "high",
                }
            )

        # 2. Credential-related detection
        credential_words = [
            "password",
            "login",
            "username",
            "otp",
            "verification code",
        ]

        if any(word in text_lower for word in credential_words):
            indicators.append(
                {
                    "type": "credential_request",
                    "description": (
                        "The message contains language related "
                        "to account credentials or verification."
                    ),
                    "severity": "high",
                }
            )

        # 3. URL detection
        if "http://" in text_lower or "https://" in text_lower:
            indicators.append(
                {
                    "type": "external_link",
                    "description": (
                        "The message contains an external URL "
                        "that may require further investigation."
                    ),
                    "severity": "medium",
                }
            )

        # 4. Calculate risk score
        risk_score = 0

        for indicator in indicators:
            severity = indicator["severity"]

            if severity == "critical":
                risk_score += 35
            elif severity == "high":
                risk_score += 25
            elif severity == "medium":
                risk_score += 15
            else:
                risk_score += 5

        risk_score = min(risk_score, 100)

        # 5. Determine risk level
        if risk_score >= 75:
            risk_level = "critical"
        elif risk_score >= 50:
            risk_level = "high"
        elif risk_score >= 25:
            risk_level = "medium"
        else:
            risk_level = "low"

        # 6. Determine threat type and recommendation
        if indicators:
            threat_type = "potential_phishing"

            explanation = (
                "The message contains one or more indicators "
                "that may be associated with phishing or "
                "social-engineering activity."
            )

            recommended_action = (
                "Do not click suspicious links or share "
                "credentials. Verify the request through "
                "an official source."
            )

        else:
            threat_type = "no_obvious_threat"

            explanation = (
                "No obvious phishing indicators were detected "
                "by the current rule-based checks."
            )

            recommended_action = (
                "Continue to verify unexpected requests "
                "through trusted sources."
            )

        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "threat_type": threat_type,
            "indicators": indicators,
            "explanation": explanation,
            "recommended_action": recommended_action,
        }


threat_detector = ThreatDetector()