import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import api from "../../api/axios";

export default function AgentOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/agent/orders/active");
      setOrders(res.data.orders || []);
    } catch (err) {
      console.log("Active fetch failed", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const markDelivered = async (orderId) => {
    try {
      await api.post(`/orders/${orderId}/deliver`);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Delivery failed");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#4f8cff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.orderId}>Order #{item.id}</Text>
            <Text style={styles.text}>Store: {item.store?.name}</Text>
            <Text style={styles.text}>Retailer: {item.retailerEmail}</Text>
            <Text style={styles.amount}>₹ {item.totalAmount}</Text>

            <TouchableOpacity
              style={styles.deliverBtn}
              onPress={() => markDelivered(item.id)}
            >
              <Text style={styles.btnText}>Mark Delivered</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No active deliveries</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f2027", padding: 16 },
  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 18,
    borderRadius: 14,
    marginBottom: 15,
  },
  orderId: { color: "#4f8cff", fontSize: 16, fontWeight: "600" },
  text: { color: "white", marginTop: 4 },
  amount: { color: "#2ecc71", marginTop: 6, fontWeight: "600" },
  deliverBtn: {
    backgroundColor: "#6a5acd",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  btnText: { color: "white", fontWeight: "600" },
  empty: { color: "#aaa", textAlign: "center", marginTop: 30 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});