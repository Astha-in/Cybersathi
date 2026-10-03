import ipaddress
import re
from urllib.parse import urlparse


# Private / loopback / link-local CIDR ranges to block (SSRF prevention)
_BLOCKED_NETWORKS = [
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("169.254.0.0/16"),  # link-local
    ipaddress.ip_network("::1/128"),           # IPv6 loopback
    ipaddress.ip_network("fc00::/7"),          # IPv6 ULA
    ipaddress.ip_network("fe80::/10"),         # IPv6 link-local
    ipaddress.ip_network("100.64.0.0/10"),     # shared address space
    ipaddress.ip_network("0.0.0.0/8"),
    ipaddress.ip_network("240.0.0.0/4"),       # reserved
]


def _is_private_ip(hostname: str) -> bool:
    """Return True if the hostname resolves to a private/loopback address."""
    try:
        addr = ipaddress.ip_address(hostname)
        for network in _BLOCKED_NETWORKS:
            try:
                if addr in network:
                    return True
            except TypeError:
                pass
        return False
    except ValueError:
        # Not a bare IP — check for localhost variants
        lower = hostname.lower()
        if lower in {"localhost", "local", "broadcasthost"}:
            return True
        # Block .local / .internal / .localhost TLDs
        if lower.endswith((".local", ".internal", ".localhost", ".intranet")):
            return True
        return False


class URLAnalyzer:
    """Deterministic URL security analyzer with SSRF prevention."""

    SUSPICIOUS_KEYWORDS = [
        "login",
        "verify",
        "verification",
        "secure",
        "account",
        "update",
        "confirm",
        "password",
        "signin",
        "bank",
        "wallet",
        "payment",
    ]

    SHORTENERS = {
        "bit.ly",
        "tinyurl.com",
        "t.co",
        "is.gd",
        "cutt.ly",
        "shorturl.at",
    }

    def analyze(self, url: str) -> dict:
        indicators = []
        score = 0

        # Reject excessively long URLs before any parsing (DoS protection)
        if len(url) > 2000:
            return {
                "url": url[:100] + "...",
                "is_valid": False,
                "risk_score": 100,
                "risk_level": "critical",
                "indicators": [
                    {
                        "type": "url_too_long",
                        "description": "The URL exceeds the maximum allowed length.",
                        "severity": "critical",
                    }
                ],
            }

        parsed = urlparse(url)

        # Only allow HTTP / HTTPS — reject javascript:, data:, file:, ftp:, etc.
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            return {
                "url": url,
                "is_valid": False,
                "risk_score": 100,
                "risk_level": "critical",
                "indicators": [
                    {
                        "type": "invalid_url",
                        "description": "The supplied value is not a valid HTTP/HTTPS URL.",
                        "severity": "critical",
                    }
                ],
            }

        hostname = parsed.hostname or ""
        hostname_lower = hostname.lower()

        # ── SSRF — block private / loopback IP addresses ──────────────────────
        if _is_private_ip(hostname):
            return {
                "url": url,
                "is_valid": False,
                "risk_score": 100,
                "risk_level": "critical",
                "indicators": [
                    {
                        "type": "ssrf_blocked",
                        "description": (
                            "The URL targets a private, loopback, or internal network "
                            "address which is not permitted for security analysis."
                        ),
                        "severity": "critical",
                    }
                ],
            }

        # ── 1. HTTP instead of HTTPS ──────────────────────────────────────────
        if parsed.scheme == "http":
            indicators.append(
                {
                    "type": "insecure_protocol",
                    "description": "The URL uses HTTP instead of HTTPS.",
                    "severity": "medium",
                }
            )
            score += 15

        # ── 2. IP address instead of domain ───────────────────────────────────
        try:
            ipaddress.ip_address(hostname)
            indicators.append(
                {
                    "type": "ip_address_host",
                    "description": "The URL uses an IP address instead of a domain name.",
                    "severity": "high",
                }
            )
            score += 25
        except ValueError:
            pass

        # ── 3. URL shortener ──────────────────────────────────────────────────
        if hostname_lower in self.SHORTENERS:
            indicators.append(
                {
                    "type": "url_shortener",
                    "description": (
                        "The URL uses a URL-shortening service that hides "
                        "the final destination."
                    ),
                    "severity": "medium",
                }
            )
            score += 20

        # ── 4. Suspicious keywords in domain ──────────────────────────────────
        found_keywords = [
            keyword
            for keyword in self.SUSPICIOUS_KEYWORDS
            if keyword in hostname_lower
        ]

        if found_keywords:
            indicators.append(
                {
                    "type": "suspicious_keywords",
                    "description": (
                        "The domain contains security-sensitive keywords: "
                        + ", ".join(found_keywords)
                    ),
                    "severity": "medium",
                }
            )
            score += 15

        # ── 5. Excessive subdomains ────────────────────────────────────────────
        subdomain_count = len(hostname_lower.split("."))

        if subdomain_count >= 5:
            indicators.append(
                {
                    "type": "excessive_subdomains",
                    "description": (
                        "The hostname contains an unusually large number "
                        "of subdomain levels."
                    ),
                    "severity": "medium",
                }
            )
            score += 15

        # ── 6. Suspicious @ symbol ────────────────────────────────────────────
        if "@" in url:
            indicators.append(
                {
                    "type": "at_symbol",
                    "description": (
                        "The URL contains an @ symbol that can obscure "
                        "the actual destination."
                    ),
                    "severity": "high",
                }
            )
            score += 25

        # ── 7. Very long URL ──────────────────────────────────────────────────
        if len(url) > 200:
            indicators.append(
                {
                    "type": "long_url",
                    "description": (
                        "The URL is unusually long and may contain "
                        "obfuscated parameters."
                    ),
                    "severity": "low",
                }
            )
            score += 5

        score = min(score, 100)

        if score >= 75:
            risk_level = "critical"
        elif score >= 50:
            risk_level = "high"
        elif score >= 25:
            risk_level = "medium"
        else:
            risk_level = "low"

        return {
            "url": url,
            "is_valid": True,
            "risk_score": score,
            "risk_level": risk_level,
            "indicators": indicators,
        }


url_analyzer = URLAnalyzer()