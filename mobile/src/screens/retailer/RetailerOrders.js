import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import api from "../../api/axios";

export default function RetailerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/retailer/orders");
      setOrders(res.data.orders || []);
    } catch (err) {
      console.log("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /* ===============================
     ORDER STATUS TIMELINE
  =============================== */

  const statusSteps = [
    "pending",
    "accepted",
    "assigned",
    "dispatched",
    "delivered",
  ];

  const renderProgress = (status) => {
    const currentIndex = statusSteps.indexOf(status);

    return (
      <View style={styles.progressRow}>
        {statusSteps.map((step, index) => (
          <View
            key={step}
            style={[
              styles.progressBar,
              index <= currentIndex && styles.progressActive,
            ]}
          />
        ))}
      </View>
    );
  };

  /* ===============================
     ORDER CARD
  =============================== */

  const renderOrder = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.storeName}>
        {item.store?.name}
      </Text>

      <Text style={styles.orderId}>
        Order #{item.id}
      </Text>

      {/* Status Badge */}
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>
          {item.status.toUpperCase()}
        </Text>
      </View>

      {renderProgress(item.status)}

      <Text style={styles.payment}>
        Payment: {item.paymentMethod}
      </Text>

      {item.paymentMethod === "CREDIT" && (
        <Text style={styles.credit}>
          Credit: {item.creditStatus}
        </Text>
      )}

      <Text style={styles.total}>
        Total: ₹ {item.totalAmount}
      </Text>

      <View style={{ marginTop: 10 }}>
        {item.items.map((orderItem) => (
          <Text
            key={orderItem.id}
            style={styles.itemText}
          >
            • {orderItem.product?.name} x{" "}
            {orderItem.quantity}
          </Text>
        ))}
      </View>
    </View>
  );

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
        keyExtractor={(item) =>
          item.id.toString()
        }
        renderItem={renderOrder}
        ListEmptyComponent={
          <Text
            style={{
              color: "gray",
              textAlign: "center",
            }}
          >
            No orders yet
          </Text>
        }
      />
    </View>
  );
}

/* ===============================
   STYLES
=============================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f2027",
    padding: 16,
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 18,
    borderRadius: 14,
    marginBottom: 15,
  },

  storeName: {
    color: "#4f8cff",
    fontSize: 16,
    fontWeight: "600",
  },

  orderId: {
    color: "white",
    marginTop: 4,
  },

  statusBadge: {
    backgroundColor: "#4f8cff",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginTop: 8,
  },

  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },

  progressRow: {
    flexDirection: "row",
    marginTop: 10,
  },

  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#1e3c47",
    marginRight: 5,
    borderRadius: 5,
  },

  progressActive: {
    backgroundColor: "#4f8cff",
  },

  payment: {
    color: "#aaa",
    marginTop: 8,
  },

  credit: {
    color: "#f39c12",
    marginTop: 4,
  },

  total: {
    color: "#2ecc71",
    marginTop: 6,
    fontWeight: "600",
  },

  itemText: {
    color: "white",
    fontSize: 13,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});