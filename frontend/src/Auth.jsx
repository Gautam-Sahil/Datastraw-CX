import { useState } from "react";
import { User, Lock, Mail, ArrowLeft, Loader2, ShieldCheck, Eye, EyeOff, Sparkles } from "lucide-react";
import "./auth.css";

const API_BASE = 'http://localhost:5000/api';

export default function Auth({ onLoginSuccess }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loginRole, setLoginRole] = useState("user");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  function changeView() {
    setIsAnimating(true);
    setIsRegisterMode(!isRegisterMode);
    setError("");
    setSuccessMsg("");
    setLoading(false);
    setTimeout(() => setIsAnimating(false), 900);
  }

  function handleSelectRole(role) {
    setLoginRole(role);
    setError("");
    setSuccessMsg("");
    setLoading(false);
    if (role === "admin") {
      setLoginEmail("sahil@admin.com");
      setLoginPassword("admin123");
    } else {
      if (loginEmail.toLowerCase() === "sahil@admin.com") {
        setLoginEmail("");
        setLoginPassword("");
      }
    }
  }

  function fillDemoAdmin() {
    setLoginRole("admin");
    setLoginEmail("sahil@admin.com");
    setLoginPassword("admin123");
    setError("");
    setSuccessMsg("");
    setLoading(false);
  }

  async function handleLogin(e) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid credentials");
        setLoading(false);
        return;
      }

      onLoginSuccess(data.token);
    } catch (err) {
      setError(err.message || "Connection error. Please try again.");
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      setLoginEmail(regEmail);
      setRegName("");
      setRegPassword("");
      setLoading(false);
      setSuccessMsg("Account created successfully! Please log in.");
      setIsAnimating(true);
      setIsRegisterMode(false);
      setTimeout(() => setIsAnimating(false), 900);

    } catch (err) {
      setError(err.message || "Connection error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="auth-parent">
      <div className={`auth-container ${isRegisterMode ? "active" : ""} ${isAnimating ? "animating" : ""}`}>
        
        <div className="form-box login">
          <form onSubmit={handleLogin}>
            <div className="back-inline-link">
              <ArrowLeft style={{ width: '14px', height: '14px' }} />
              Datastraw CX Portal
            </div>

            <h1>Welcome Back</h1>
            <p className="text-slate-500" style={{marginTop: '4px', marginBottom: '12px'}}>
              Sign in to access CX workspace
            </p>

            <div className="role-switcher">
              <button type="button" onClick={() => handleSelectRole("user")} className={`role-pill ${loginRole === "user" ? "active" : ""}`}>
                <Sparkles style={{ width: '14px', height: '14px', color: '#059669' }} /> Visitor
              </button>
              <button type="button" onClick={() => handleSelectRole("admin")} className={`role-pill ${loginRole === "admin" ? "active" : ""}`}>
                <ShieldCheck style={{ width: '14px', height: '14px', color: '#059669' }} /> Agent Admin
              </button>
            </div>

            {error && !isRegisterMode && <div className="auth-error">{error}</div>}
            {successMsg && !isRegisterMode && <div className="auth-success">{successMsg}</div>}

            <div className="input-box">
              <Mail className="field-icon" style={{ width: '16px', height: '16px' }} />
              <input type="email" placeholder="Email Address" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
            </div>

            <div className="input-box">
              <Lock className="field-icon" style={{ width: '16px', height: '16px' }} />
              <input type={showLoginPassword ? "text" : "password"} placeholder="Password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
              <button type="button" onClick={() => setShowLoginPassword((prev) => !prev)} className="eye-btn">
                {showLoginPassword ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
              </button>
            </div>

            <div className="forgot-link">
              <span style={{color: '#94a3b8'}}>Testing the assignment?</span>
              <button type="button" onClick={fillDemoAdmin}>
                <ShieldCheck style={{ width: '13px', height: '13px' }} /> Auto-Fill Demo
              </button>
            </div>

            <button type="submit" disabled={loading} className="auth-btn">
              {loading ? <><Loader2 style={{ width: '16px', height: '16px' }} className="animate-spin" /><span>Signing in...</span></> : <span>{loginRole === "admin" ? "Sign In as Admin" : "Sign In"}</span>}
            </button>
          </form>
        </div>

        <div className="form-box register">
          <form onSubmit={handleRegister}>
            <div className="back-inline-link">
              <ArrowLeft style={{ width: '14px', height: '14px' }} />
              Datastraw CX Portal
            </div>

            <h1>Create Account</h1>
            <p className="text-slate-500" style={{marginTop: '4px', marginBottom: '16px'}}>
              Join to access the AI Reply Assistant
            </p>

            {error && isRegisterMode && <div className="auth-error">{error}</div>}

            <div className="input-box">
              <User className="field-icon" style={{ width: '16px', height: '16px' }} />
              <input type="text" placeholder="Full Name" required value={regName} onChange={(e) => setRegName(e.target.value)} />
            </div>

            <div className="input-box">
              <Mail className="field-icon" style={{ width: '16px', height: '16px' }} />
              <input type="email" placeholder="Email Address" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
            </div>

            <div className="input-box">
              <Lock className="field-icon" style={{ width: '16px', height: '16px' }} />
              <input type={showRegPassword ? "text" : "password"} placeholder="Password (min 6 chars)" required minLength={6} value={regPassword} onChange={(e) => setRegPassword(e.target.value)} />
              <button type="button" onClick={() => setShowRegPassword((prev) => !prev)} className="eye-btn">
                {showRegPassword ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
              </button>
            </div>

            <button type="submit" disabled={loading} className="auth-btn mt-2" style={{marginTop: '8px'}}>
              {loading ? <><Loader2 style={{ width: '16px', height: '16px' }} className="animate-spin" /><span>Creating Account...</span></> : <span>Create Account</span>}
            </button>
          </form>
        </div>

        <div className="toggle-box">
          <div className="toggle-panel toggle-left">
            <h1>Hello, Welcome!</h1>
            <p>New to the Datastraw CX Engine? Create an account to access the AI workspace.</p>
            <button type="button" className="auth-btn" onClick={changeView}>Register</button>
          </div>
          <div className="toggle-panel toggle-right">
            <h1>Welcome Back!</h1>
            <p>Already have an agent account? Sign in to view customer sessions and policies.</p>
            <button type="button" className="auth-btn" onClick={changeView}>Login</button>
          </div>
        </div>

      </div>
    </div>
  );
}