import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import api from "../../api/axios";

export default function AgentDashboard() {
  const [summary, setSummary] = useState({});

  useEffect(() => {
    api
      .get("/agent/orders/summary")
      .then((res) => setSummary(res.data.summary || {}))
      .catch((err) =>
        console.log("Dashboard fetch failed", err.response?.data)
      );
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Total Orders</Text>
        <Text style={styles.value}>{summary.total || 0}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Active Deliveries</Text>
        <Text style={styles.value}>{summary.dispatched || 0}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Delivered Orders</Text>
        <Text style={styles.value}>{summary.delivered || 0}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f2027", padding: 16 },
  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 20,
    borderRadius: 14,
    marginBottom: 15,
  },
  label: { color: "#aaa" },
  value: { color: "#4f8cff", fontSize: 22, fontWeight: "700", marginTop: 6 },
});