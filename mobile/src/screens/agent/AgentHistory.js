import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import api from "../../api/axios";

export default function AgentHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await api.get("/agent/orders/history");
      setOrders(res.data.orders || []);
    } catch (err) {
      console.log("History fetch failed", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
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
            <Text style={styles.title}>
              Order #{item.id}
            </Text>

            <Text style={styles.text}>
              Total: ₹ {item.totalAmount}
            </Text>

            <Text style={styles.delivered}>
              Delivered
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ color: "gray", textAlign: "center" }}>
            No delivery history
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f2027",
    padding: 16,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  title: {
    color: "#4f8cff",
    fontWeight: "600",
  },
  text: {
    color: "white",
    marginTop: 4,
  },
  delivered: {
    color: "#2ecc71",
    marginTop: 6,
    fontWeight: "600",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});