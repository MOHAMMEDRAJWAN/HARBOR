import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import api from "../../api/axios";

export default function AgentHome() {
  const [availableOrders, setAvailableOrders] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [availableRes, activeRes, summaryRes] =
        await Promise.all([
          api.get("/agent/orders/available"),
          api.get("/agent/orders/active"),
          api.get("/agent/orders/summary"),
        ]);

      setAvailableOrders(availableRes.data.orders || []);
      setActiveOrders(activeRes.data.orders || []);
      setSummary(summaryRes.data.summary || {});
    } catch (err) {
      console.log("Agent fetch failed", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const acceptOrder = async (orderId) => {
    try {
      await api.post(`/orders/${orderId}/dispatch`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Accept failed");
    }
  };

  const markDelivered = async (orderId) => {
    try {
      await api.post(`/orders/${orderId}/deliver`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Delivery failed");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#4f8cff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* SUMMARY */}
      <View style={styles.summaryRow}>
        <DashboardCard title="Total" value={summary.total || 0} />
        <DashboardCard title="Active" value={summary.dispatched || 0} />
        <DashboardCard title="Delivered" value={summary.delivered || 0} />
      </View>

      {/* AVAILABLE */}
      <Text style={styles.sectionTitle}>Available Orders</Text>

      {availableOrders.length === 0 ? (
        <Text style={styles.emptyText}>No available orders</Text>
      ) : (
        availableOrders.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.title}>Order #{item.id}</Text>
            <Text style={styles.text}>Store: {item.store?.name}</Text>
            <Text style={styles.amount}>₹ {item.totalAmount}</Text>

            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={() => acceptOrder(item.id)}
            >
              <Text style={styles.btnText}>Accept Order</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      {/* ACTIVE */}
      <Text style={styles.sectionTitle}>Active Deliveries</Text>

      {activeOrders.length === 0 ? (
        <Text style={styles.emptyText}>No active deliveries</Text>
      ) : (
        activeOrders.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.title}>Order #{item.id}</Text>
            <Text style={styles.text}>Retailer: {item.retailerEmail}</Text>
            <Text style={styles.amount}>₹ {item.totalAmount}</Text>

            <TouchableOpacity
              style={styles.deliverBtn}
              onPress={() => markDelivered(item.id)}
            >
              <Text style={styles.btnText}>Mark Delivered</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

function DashboardCard({ title, value }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryTitle}>{title}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f2027", padding: 16 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  summaryCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 16,
    borderRadius: 14,
    width: "31%",
  },
  summaryTitle: { color: "#aaa", fontSize: 12 },
  summaryValue: { color: "#4f8cff", fontSize: 18, fontWeight: "700", marginTop: 5 },
  sectionTitle: { color: "white", fontSize: 18, fontWeight: "600", marginVertical: 10 },
  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 16,
    borderRadius: 14,
    marginBottom: 15,
  },
  title: { color: "#4f8cff", fontSize: 16, fontWeight: "600" },
  text: { color: "white", marginTop: 4 },
  amount: { color: "#2ecc71", marginTop: 6, fontWeight: "600" },
  acceptBtn: {
    backgroundColor: "#4f8cff",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  deliverBtn: {
    backgroundColor: "#2ecc71",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  btnText: { color: "white", fontWeight: "600" },
  emptyText: { color: "#aaa" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});