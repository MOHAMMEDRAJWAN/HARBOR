import { useState } from "react";
import api from "../api/axios";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    businessName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });

  const handleRegister = async () => {
    try {
      await api.post("/auth/register/wholesaler", form);
      alert("Registration successful");
      window.location.href = "/login";
    } catch {
      alert("Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Register Wholesaler</h2>

        {Object.keys(form).map((key) => (
          <input
            key={key}
            className="form-input"
            type={key === "password" ? "password" : "text"}
            placeholder={key}
            value={form[key]}
            onChange={(e) =>
              setForm({ ...form, [key]: e.target.value })
            }
          />
        ))}

        <button className="primary-btn" onClick={handleRegister}>
          Register
        </button>
      </div>
    </div>
  );
}