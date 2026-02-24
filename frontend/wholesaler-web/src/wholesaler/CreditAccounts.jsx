import { useEffect, useState } from "react";
import api from "../api/axios";

export default function CreditAccounts() {
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/credit/accounts");
      setRetailers(res.data.retailers || []);
    } catch (err) {
      alert("Failed to load credit accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const settleCredit = async (retailerId) => {
    const amount = prompt("Enter settlement amount:");

    if (!amount) return;

    try {
      await api.put(`/credit/${retailerId}/settle`, {
        amount: Number(amount),
      });

      alert("Credit settled successfully");
      fetchAccounts();
    } catch (err) {
      alert("Settlement failed");
    }
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: 20 }}>Credit Accounts</h2>

      {loading && <p>Loading...</p>}

      {!loading && retailers.length === 0 && (
        <p>No approved credit accounts</p>
      )}

      {retailers.map((r) => (
        <div
          key={r.id}
          className="card"
          style={{
            marginBottom: 15,
            padding: 20,
          }}
        >
          <h4 style={{ marginBottom: 10 }}>{r.name}</h4>

          <p><strong>Email:</strong> {r.email}</p>
          <p><strong>Phone:</strong> {r.phone}</p>
          <p><strong>Limit:</strong> ₹ {r.creditLimit}</p>
          <p><strong>Used:</strong> ₹ {r.creditUsed}</p>
          <p>
            <strong>Available:</strong> ₹ {r.creditLimit - r.creditUsed}
          </p>

          <button
            onClick={() => settleCredit(r.id)}
            style={{
              marginTop: 12,
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              background: "linear-gradient(90deg, #6c5ce7, #4f8cff)",
              color: "white",
              fontWeight: 500,
            }}
          >
            Settle Credit
          </button>
        </div>
      ))}
    </div>
  );
}