
import { useState } from "react";
import "./Login.css";

function Login({ onLogin }) {
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!loginName.trim() || !password) {
      setError("Please enter your login name and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://localhost:7201/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            loginName: loginName.trim(),
            password,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Invalid login credentials.");
      }

      if (!data.accessToken) {
        throw new Error("The server did not return an access token.");
      }

      // Pass the token and user details to the parent component.
    onLogin({
  accessToken: data.accessToken,
  employee: data.employee,
  loginName: loginName.trim(),
  password: password,
});
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <div className="login-logo">EMS</div>
          <h1>Employee Management</h1>
          <p>Sign in to access your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <label htmlFor="loginName">Login Name</label>
          <input
            id="loginName"
            name="loginName"
            type="text"
            autoComplete="username"
            value={loginName}
            onChange={(event) => setLoginName(event.target.value)}
            placeholder="Enter your login name"
            required
            autoFocus
          />

          <label htmlFor="loginPassword">Password</label>
          <div className="password-wrapper">
            <input
              id="loginPassword"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
            />

            <button
              type="button"
              className="show-password-button"
              onClick={() => setShowPassword((previous) => !previous)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="login-footer">
          Secure Employee Management System
        </p>
      </section>
    </main>
  );
}

export default Login;
