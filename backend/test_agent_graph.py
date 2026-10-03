from app.agents.graph import cybersathi_graph
from app.core.database import SessionLocal


def main():
    db = SessionLocal()

    try:
        initial_state = {
            "input_text": (
                "URGENT: Your account will be suspended. "
                "Click https://example.com/verify and "
                "verify your password immediately."
            ),
            "db": db,
        }

        print("Testing CyberSathi LangGraph...")
        print()

        result = cybersathi_graph.invoke(initial_state)

        print("LangGraph executed successfully.")
        print()

        print(f"Input type: {result.get('input_type')}")
        print(f"Threat type: {result.get('threat_type')}")
        print(f"Risk score: {result.get('risk_score')}")
        print(f"Risk level: {result.get('risk_level')}")

        print()

        print("URL results:")

        for url_result in result.get("url_results", []):
            print(f"- URL: {url_result['url']}")
            print(f"  Risk score: {url_result['risk_score']}")
            print(f"  Risk level: {url_result['risk_level']}")

        print()

        print("RAG Knowledge:")

        knowledge = result.get("retrieved_knowledge", [])

        if not knowledge:
            print("- No knowledge retrieved.")
        else:
            for item in knowledge:
                print(
                    f"- Similarity: {item['similarity']}"
                )
                print(
                    f"  Content: "
                    f"{item['content'][:150]}..."
                )

        print()

        print("AI Analysis:")
        print("-" * 60)
        print(
    result.get(
        "final_response",
        "No final response generated."
    )
)
        print("-" * 60)

        print()

        print("All indicators:")

        for indicator in result.get("indicators", []):
            print(
                f"- {indicator['type']} "
                f"({indicator['severity']})"
            )

    finally:
        db.close()


if __name__ == "__main__":
    main()