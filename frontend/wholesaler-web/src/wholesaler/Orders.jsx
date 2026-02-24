import { useEffect, useState } from "react";
import api from "../api/axios";


export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState({});

  const statusSteps = [
    "pending",
    "accepted",
    "assigned",
    "dispatched",
    "delivered",
  ];

  const statusColors = {
    pending: "orange",
    accepted: "blue",
    assigned: "teal",
    dispatched: "purple",
    delivered: "green",
    rejected: "red",
  };

  /* ============================
     FETCH DATA
  ============================ */

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/wholesaler/orders");
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await api.get("/wholesaler/agents");
      setAgents(res.data.agents || []);
    } catch (err) {
      console.error("Failed to fetch agents", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchAgents();

    const interval = setInterval(() => {
      fetchOrders();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  /* ============================
     ACTIONS
  ============================ */

  const acceptOrder = async (orderId) => {
  try {
    await api.post(`/orders/${orderId}/accept`);
    fetchOrders();
  } catch (err) {
    console.log("ACCEPT ERROR:", err.response?.data);
    alert(err.response?.data?.message || "Failed to accept order");
  }
};

  const rejectOrder = async (orderId) => {
    try {
      await api.post(`/orders/${orderId}/reject`);
      fetchOrders();
    } catch {
      alert("Failed to reject order");
    }
  };

  const assignAgent = async (orderId) => {
    const agentEmail = selectedAgent[orderId];

    if (!agentEmail) {
      alert("Select an agent");
      return;
    }

    try {
      await api.post(`/orders/${orderId}/assign-agent`, {
        agentEmail,
      });
      fetchOrders();
    } catch {
      alert("Failed to assign agent");
    }
  };

  const dispatchOrder = async (orderId) => {
    try {
      await api.post(`/orders/${orderId}/dispatch`);
      fetchOrders();
    } catch {
      alert("Failed to dispatch order");
    }
  };

  const downloadInvoice = async (orderId) => {
    try {
      const response = await api.get(`/invoice/${orderId}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(
        new Blob([response.data])
      );

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert("Failed to download invoice");
    }
  };

  /* ============================
     PROGRESS BAR
  ============================ */

  const renderProgress = (status) => {
    const currentIndex = statusSteps.indexOf(status);

    return (
      <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
        {statusSteps.map((step, index) => (
          <div
            key={step}
            style={{
              flex: 1,
              height: 6,
              borderRadius: 5,
              background:
                index <= currentIndex ? "#4f8cff" : "#ddd",
            }}
          />
        ))}
      </div>
    );
  };

  /* ============================
     UI
  ============================ */

  return (
    
    <div className="card">
      <h2>Orders</h2>

      {loading && <p>Loading...</p>}

      {orders.map((order) => (
        <div key={order.id} className="card">
          <p><strong>Order ID:</strong> {order.id}</p>
          <p><strong>Retailer:</strong> {order.retailerEmail}</p>
          <p><strong>Total:</strong> ₹ {order.totalAmount}</p>

          {/* STATUS BADGE */}
          <p>
            <strong>Status:</strong>{" "}
            <span
              style={{
                padding: "4px 10px",
                borderRadius: 20,
                background: statusColors[order.status] || "gray",
                color: "white",
                fontSize: 12,
              }}
            >
              {order.status.toUpperCase()}
            </span>
          </p>

          {renderProgress(order.status)}

          {/* INVOICE */}
          <button
            onClick={() => downloadInvoice(order.id)}
            style={{
              marginTop: 10,
              backgroundColor: "#333",
              color: "white",
              padding: "6px 12px",
              border: "none",
              borderRadius: 6,
            }}
          >
            Download Invoice
          </button>

          {/* PAYMENT BADGE */}
          <div style={{ marginTop: 10 }}>
            <span
              style={{
                padding: "4px 10px",
                borderRadius: 20,
                background:
                  order.paymentMethod === "CREDIT"
                    ? "#f39c12"
                    : order.paymentMethod === "ONLINE"
                    ? "#2ecc71"
                    : "#3498db",
                color: "white",
                fontSize: 12,
              }}
            >
              {order.paymentMethod}
            </span>

            {order.paymentMethod === "CREDIT" && (
              <span
                style={{
                  marginLeft: 10,
                  fontSize: 12,
                  fontWeight: 500,
                  color:
                    order.creditStatus === "approved"
                      ? "green"
                      : order.creditStatus === "requested"
                      ? "orange"
                      : "red",
                }}
              >
                Credit: {order.creditStatus}
              </span>
            )}
          </div>

          {/* PENDING → ACCEPT / REJECT */}
          {order.status === "pending" && (
            <div style={{ marginTop: 15 }}>
              <button
                onClick={() => acceptOrder(order.id)}
                style={{
                  marginRight: 10,
                  backgroundColor: "green",
                  color: "white",
                  padding: "6px 12px",
                  border: "none",
                  borderRadius: 6,
                }}
              >
                Accept
              </button>

              <button
                onClick={() => rejectOrder(order.id)}
                style={{
                  backgroundColor: "red",
                  color: "white",
                  padding: "6px 12px",
                  border: "none",
                  borderRadius: 6,
                }}
              >
                Reject
              </button>
            </div>
          )}

          {/* ACCEPTED → ASSIGN */}
          {order.status === "accepted" && (
            <div style={{ marginTop: 15 }}>
              <select
                value={selectedAgent[order.id] || ""}
                onChange={(e) =>
                  setSelectedAgent({
                    ...selectedAgent,
                    [order.id]: e.target.value,
                  })
                }
              >
                <option value="">Select Agent</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.email}>
                    {agent.name} ({agent.email})
                  </option>
                ))}
              </select>

              <button
                onClick={() => assignAgent(order.id)}
                style={{
                  marginLeft: 10,
                  backgroundColor: "#4f8cff",
                  color: "white",
                  padding: "6px 12px",
                  border: "none",
                  borderRadius: 6,
                }}
              >
                Assign
              </button>
            </div>
          )}

          {/* ASSIGNED → DISPATCH */}
          {order.status === "assigned" && (
            <div style={{ marginTop: 15 }}>
              <p style={{ color: "purple" }}>
                Assigned to: {order.agentEmail}
              </p>

              <button
                onClick={() => dispatchOrder(order.id)}
                style={{
                  backgroundColor: "#8e44ad",
                  color: "white",
                  padding: "6px 12px",
                  border: "none",
                  borderRadius: 6,
                  marginTop: 8,
                }}
              >
                
              </button>
            </div>
          )}

          {/* DISPATCHED */}
          {order.status === "assigned" && (
          <button
            className="primary-btn"
            onClick={() => dispatchOrder(order.id)}
            >
              Dispatch
            </button>
          )}
        </div>
      ))}
    </div>
    
  );
}