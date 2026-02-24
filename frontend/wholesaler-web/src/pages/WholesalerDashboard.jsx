import { useState, useEffect } from "react";
import Products from "../wholesaler/Products";
import Orders from "../wholesaler/Orders";
import Profile from "../wholesaler/Profile";
import Analytics from "../wholesaler/Analytics";
import CreditRequests from "../wholesaler/CreditRequests";
import CreditAccounts from "../wholesaler/CreditAccounts";
import api from "../api/axios";
import CountUp from "react-countup";

export default function WholesalerDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const [summary, setSummary] = useState({
    pending: 0,
    accepted: 0,
    assigned: 0,
    dispatched: 0,
    delivered: 0,
    rejected: 0,
  });

  /* ===============================
     NOTIFICATIONS STATE
  =============================== */

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  /* ===============================
     FETCH SUMMARY
  =============================== */

  const fetchSummary = async () => {
    try {
      const res = await api.get("/wholesaler/orders/summary");

      setSummary({
        pending: res.data.summary?.pending || 0,
        accepted: res.data.summary?.accepted || 0,
        assigned: res.data.summary?.assigned || 0,
        dispatched: res.data.summary?.dispatched || 0,
        delivered: res.data.summary?.delivered || 0,
        rejected: res.data.summary?.rejected || 0,
      });
    } catch (err) {
      console.error("Failed to fetch summary", err);
    }
  };

  /* ===============================
     FETCH NOTIFICATIONS
  =============================== */

  const fetchNotifications = async () => {
    try {
      const [ordersRes, creditRes] = await Promise.all([
        api.get("/wholesaler/orders/recent"),
        api.get("/credit/requests"),
      ]);

      const newNotifications = [];

      if (ordersRes.data.orders?.length > 0) {
        newNotifications.push({
          type: "order",
          message: `${ordersRes.data.orders.length} new pending orders`,
        });
      }

      if (creditRes.data.retailers?.length > 0) {
        newNotifications.push({
          type: "credit",
          message: `${creditRes.data.retailers.length} new credit requests`,
        });
      }

      setNotifications(newNotifications);
    } catch (err) {
      console.error("Failed to fetch notifications");
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchNotifications();

    const interval = setInterval(() => {
      fetchSummary();
      fetchNotifications();
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  /* ===============================
     DASHBOARD CONTENT
  =============================== */

  const renderContent = () => {
    if (activeTab === "products") return <Products />;
    if (activeTab === "orders") return <Orders />;
    if (activeTab === "analytics") return <Analytics />;
    if (activeTab === "profile") return <Profile />;
    if (activeTab === "credit-requests") return <CreditRequests />;
    if (activeTab === "credit-accounts") return <CreditAccounts />;

    const total =
      summary.pending +
      summary.accepted +
      summary.assigned +
      summary.dispatched +
      summary.delivered +
      summary.rejected;

    return (
      <div className="card">
        <h2 style={{ marginBottom: 30 }}>Dashboard Overview</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 25,
          }}
        >
          <DashboardCard title="Total Orders" value={total} />
          <DashboardCard title="Pending" value={summary.pending} color="orange" />
          <DashboardCard title="Accepted" value={summary.accepted} color="#4f8cff" />
          <DashboardCard title="Assigned" value={summary.assigned} color="#00cec9" />
          <DashboardCard title="Delivered" value={summary.delivered} color="#2ecc71" />
        </div>
      </div>
    );
  };

  /* ===============================
     UI
  =============================== */

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <h2 className="logo">Harbor</h2>

        {/* 🔔 Notification Bell */}
        <div style={{ position: "relative", marginBottom: 20 }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              padding: 10,
              borderRadius: 10,
              cursor: "pointer",
              width: "100%",
              color: "white",
              position: "relative",
            }}
          >
            🔔 Notifications

            {notifications.length > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 5,
                  right: 10,
                  background: "red",
                  borderRadius: "50%",
                  padding: "3px 7px",
                  fontSize: 12,
                }}
              >
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              style={{
                position: "absolute",
                top: 45,
                left: 0,
                width: "100%",
                background: "rgba(0,0,0,0.9)",
                borderRadius: 10,
                padding: 15,
                zIndex: 1000,
              }}
            >
              {notifications.length === 0 ? (
                <p>No new notifications</p>
              ) : (
                notifications.map((n, index) => (
                  <div key={index} style={{ marginBottom: 10 }}>
                    {n.message}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <button className={activeTab === "dashboard" ? "active" : ""} onClick={() => setActiveTab("dashboard")}>Dashboard</button>
        <button className={activeTab === "products" ? "active" : ""} onClick={() => setActiveTab("products")}>Products</button>
        <button className={activeTab === "orders" ? "active" : ""} onClick={() => setActiveTab("orders")}>Orders</button>
        <button className={activeTab === "analytics" ? "active" : ""} onClick={() => setActiveTab("analytics")}>Analytics</button>
        <button className={activeTab === "credit-requests" ? "active" : ""} onClick={() => setActiveTab("credit-requests")}>Credit Requests</button>
        <button className={activeTab === "credit-accounts" ? "active" : ""} onClick={() => setActiveTab("credit-accounts")}>Credit Accounts</button>
        <button className={activeTab === "profile" ? "active" : ""} onClick={() => setActiveTab("profile")}>Profile</button>
      </div>

      {/* Content */}
      <div className="dashboard-content">
        <h1 className="dashboard-title">Wholesaler Dashboard</h1>
        {renderContent()}
      </div>
    </div>
  );
}

/* ===============================
   Dashboard Card Component
=============================== */

function DashboardCard({ title, value, color = "#6a5acd" }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.08)",
        padding: 30,
        borderRadius: 18,
        backdropFilter: "blur(12px)",
        boxShadow: "0 10px 25px rgba(0,0,0,0.35)",
      }}
    >
      <p style={{ opacity: 0.8, marginBottom: 12, fontSize: 14 }}>
        {title}
      </p>

      <h1 style={{ color, fontSize: 36 }}>
        <CountUp end={value} duration={1.2} />
      </h1>
    </div>
  );
}