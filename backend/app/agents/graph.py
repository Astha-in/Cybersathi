from langgraph.graph import END, START, StateGraph

from app.agents.router import input_router
from app.agents.state import CyberSathiState
from app.agents.threat_agent import threat_analysis_agent
from app.agents.url_agent import url_analysis_agent
from app.agents.risk_agent import risk_analysis_agent
from app.agents.rag_agent import rag_knowledge_agent
from app.agents.ai_agent import ai_reasoning_agent


def route_input(state: CyberSathiState) -> CyberSathiState:
    return input_router.route(state)


def analyze_threat(state: CyberSathiState) -> CyberSathiState:
    return threat_analysis_agent.analyze(state)


def analyze_urls(state: CyberSathiState) -> CyberSathiState:
    return url_analysis_agent.analyze(state)


def analyze_risk(state: CyberSathiState) -> CyberSathiState:
    return risk_analysis_agent.analyze(state)


def retrieve_knowledge(state: CyberSathiState) -> CyberSathiState:
    return rag_knowledge_agent.retrieve(state)


def analyze_with_ai(state: CyberSathiState) -> CyberSathiState:
    return ai_reasoning_agent.analyze(state)


def build_cybersathi_graph():
    graph = StateGraph(CyberSathiState)

    graph.add_node("input_router", route_input)
    graph.add_node("threat_analysis", analyze_threat)
    graph.add_node("url_analysis", analyze_urls)
    graph.add_node("risk_analysis", analyze_risk)
    graph.add_node("rag_retrieval", retrieve_knowledge)
    graph.add_node("ai_reasoning", analyze_with_ai)

    graph.add_edge(START, "input_router")
    graph.add_edge("input_router", "threat_analysis")
    graph.add_edge("threat_analysis", "url_analysis")
    graph.add_edge("url_analysis", "risk_analysis")
    graph.add_edge("risk_analysis", "rag_retrieval")
    graph.add_edge("rag_retrieval", "ai_reasoning")
    graph.add_edge("ai_reasoning", END)

    return graph.compile()


cybersathi_graph = build_cybersathi_graph()