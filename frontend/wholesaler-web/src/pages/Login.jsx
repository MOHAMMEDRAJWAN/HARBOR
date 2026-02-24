import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = res.data;

      // Save session
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Role-based navigation
      if (user.role === "wholesaler") {
        navigate("/wholesaler");
      } else {
        alert("Only wholesaler login allowed here");
      }

    } catch (err) {
      alert(
        err.response?.data?.message || "Login failed"
      );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 style={{ marginBottom: 25 }}>Harbor Wholesaler Login</h2>

        <form onSubmit={handleLogin}>
          <input
            className="form-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="form-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="primary-btn"
            style={{ width: "100%", marginTop: 10 }}
          >
            Login
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: 14 }}>
          New user?{" "}
          <span
            style={{ color: "#4f8cff", cursor: "pointer" }}
            onClick={() => navigate("/register")}
          >
            Register here
          </span>
        </p>
      </div>
    </div>
  );
}