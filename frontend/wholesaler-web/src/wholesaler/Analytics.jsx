import { useEffect, useState } from "react";
import api from "../api/axios";
import CountUp from "react-countup";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function Analytics() {
  const [data, setData] = useState({
    totalRevenue: 0,
    statusCounts: {},
    monthlySales: {},
  });

  

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get("/wholesaler/analytics");
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch analytics", err);
    }
  };

  // Convert monthlySales object to chart array
  const chartData = Object.entries(data.monthlySales || {}).map(
    ([month, revenue]) => ({
      month,
      revenue,
    })
  );

  return (
    <div className="card">
      <h2 style={{ marginBottom: 30 }}>Analytics</h2>

      {/* Revenue Card */}
      <div
        style={{
          marginBottom: 40,
          padding: 25,
          borderRadius: 14,
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(10px)",
        }}
      >
        <p style={{ opacity: 0.8 }}>Total Revenue</p>
        <h1 style={{ color: "#2ecc71" }}>
          ₹ <CountUp end={data.totalRevenue || 0} duration={1.5} />
        </h1>
      </div>

      {/* Revenue Chart */}
      <div
        style={{
          width: "100%",
          height: 350,
          background: "rgba(255,255,255,0.05)",
          padding: 20,
          borderRadius: 14,
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#555" />
            <XAxis dataKey="month" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#4f8cff"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}