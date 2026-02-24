import { useEffect, useState } from "react";
import api from "../api/axios";


export default function CreditRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get("/credit/requests");
      setRequests(res.data.retailers || []);
    } catch (err) {
      alert("Failed to load credit requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const approveCredit = async (retailerId) => {
    const limit = prompt("Enter credit limit:");

    if (!limit || Number(limit) <= 0) return;

    try {
      await api.put(`/credit/${retailerId}/approve`, {
        creditLimit: Number(limit),
      });

      alert("Credit approved");
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Approval failed");
    }
  };

  const rejectCredit = async (retailerId) => {
    try {
      await api.put(`/credit/${retailerId}/reject`);
      alert("Credit rejected");
      fetchRequests();
    } catch (err) {
      alert("Reject failed");
    }
  };

  return (
    
    <div className="card">
      <h2>Credit Requests</h2>

      {loading && <p>Loading...</p>}

      {requests.length === 0 && !loading && (
        <p>No pending credit requests</p>
      )}

      {requests.map((retailer) => (
        <div
          key={retailer.id}
          style={{
            background: "#ffffff",
            padding: 15,
            marginBottom: 15,
            borderRadius: 8,
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          }}
        >
          <p><strong>Name:</strong> {retailer.name}</p>
          <p><strong>Email:</strong> {retailer.email}</p>
          <p><strong>Phone:</strong> {retailer.phone}</p>

          <button
            onClick={() => approveCredit(retailer.id)}
            style={{
              marginRight: 10,
              backgroundColor: "green",
              color: "white",
              padding: "6px 12px",
              border: "none",
              borderRadius: 5,
            }}
          >
            Approve
          </button>

          <button
            onClick={() => rejectCredit(retailer.id)}
            style={{
              backgroundColor: "red",
              color: "white",
              padding: "6px 12px",
              border: "none",
              borderRadius: 5,
            }}
          >
            Reject
          </button>
        </div>
      ))}
    </div>
    
  );
}