import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginForm from "../components/auth/LoginForm";

function Login() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  function handleLoginSuccess(_name: string) {
    navigate("/dashboard");
  }

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="visual-overlay"></div>

        <div className="visual-content">
          <div className="brand-symbol">
            CS
          </div>

          <p className="visual-label">
            CYBERSATHI AI
          </p>

          <h1>
            Your intelligent
            <br />
            <span>cyber defense layer.</span>
          </h1>

          <p className="visual-description">
            Detect phishing, suspicious URLs and
            digital threats using deterministic
            security analysis, RAG and AI-powered
            reasoning.
          </p>

          <div className="security-points">
            <div>
              <span>01</span>
              <p>Threat Detection</p>
            </div>

            <div>
              <span>02</span>
              <p>AI Reasoning</p>
            </div>

            <div>
              <span>03</span>
              <p>Knowledge Retrieval</p>
            </div>
          </div>
        </div>

        <div className="visual-footer">
          <span>●</span>
          AI SECURITY ENGINE ONLINE
        </div>
      </section>

      <section className="login-panel">
        <div className="login-panel-inner">
          <div className="mobile-brand">
            <div className="brand-symbol">
              CS
            </div>

            <strong>CyberSathi</strong>
          </div>

          <div className="login-heading">
            <p className="eyebrow">
              SECURE ACCESS
            </p>

            <h2>Welcome back.</h2>

            <p>
              Sign in to your CyberSathi security
              workspace.
            </p>
          </div>

          <LoginForm
            onLoginSuccess={
              handleLoginSuccess
            }
          />

          <p className="login-footer">
            CyberSathi AI · Secure cybersecurity
            intelligence
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;