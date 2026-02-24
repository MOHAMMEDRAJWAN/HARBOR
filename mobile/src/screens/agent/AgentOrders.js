import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from "react-native";
import api from "../../api/axios";

export default function AgentOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const [successVisible, setSuccessVisible] = useState(false);
  const [earnedAmount, setEarnedAmount] = useState(0);

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

  const confirmDelivery = async () => {
    if (!selectedOrderId) return;

    try {
      const res = await api.post(
        `/orders/${selectedOrderId}/deliver`
      );

      const earnings = res.data.order?.agentEarnings || 0;

      setModalVisible(false);
      setSelectedOrderId(null);

      setEarnedAmount(earnings);
      setSuccessVisible(true);

      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Delivery failed");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4f8cff"
          />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.orderId}>
              Order #{item.id}
            </Text>

            <Text style={styles.text}>
              Store: {item.store?.name}
            </Text>

            <Text style={styles.text}>
              Retailer: {item.retailerEmail}
            </Text>

            <Text style={styles.amount}>
              ₹ {item.totalAmount}
            </Text>

            {/* PRODUCT LIST */}
            {item.items?.map((i) => (
              <Text key={i.id} style={styles.text}>
                • {i.product?.name} x {i.quantity}
              </Text>
            ))}

            {/* DELIVERY TIMESTAMP */}
            {item.deliveredAt && (
              <Text style={styles.timestamp}>
                Delivered on:{" "}
                {new Date(item.deliveredAt).toLocaleString()}
              </Text>
            )}

            {/* STATUS LOGIC */}
            {item.status === "assigned" && (
              <Text style={styles.waitingText}>
                Waiting for Dispatch
              </Text>
            )}

            {item.status === "dispatched" && (
              <TouchableOpacity
                style={styles.deliverBtn}
                onPress={() => {
                  setSelectedOrderId(item.id);
                  setModalVisible(true);
                }}
              >
                <Text style={styles.btnText}>
                  Mark Delivered
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No active deliveries
          </Text>
        }
      />

      {/* CONFIRM DELIVERY MODAL */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              Confirm Delivery
            </Text>

            <Text style={styles.modalText}>
              Are you sure you delivered Order #{selectedOrderId}?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setModalVisible(false);
                  setSelectedOrderId(null);
                }}
              >
                <Text style={styles.modalBtnText}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={confirmDelivery}
              >
                <Text style={styles.modalBtnText}>
                  Confirm
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* SUCCESS EARNINGS MODAL */}
      <Modal transparent visible={successVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              Delivery Successful 🎉
            </Text>

            <Text style={styles.modalText}>
              You earned ₹ {earnedAmount}
            </Text>

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={() => setSuccessVisible(false)}
            >
              <Text style={styles.modalBtnText}>
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    padding: 18,
    borderRadius: 14,
    marginBottom: 15,
  },
  orderId: {
    color: "#4f8cff",
    fontSize: 16,
    fontWeight: "600",
  },
  text: {
    color: "white",
    marginTop: 4,
  },
  amount: {
    color: "#2ecc71",
    marginTop: 6,
    fontWeight: "600",
  },
  timestamp: {
    color: "#aaa",
    marginTop: 6,
    fontSize: 12,
  },
  deliverBtn: {
    backgroundColor: "#6a5acd",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  btnText: {
    color: "white",
    fontWeight: "600",
  },
  waitingText: {
    color: "#f1c40f",
    marginTop: 10,
    fontWeight: "600",
  },
  empty: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 30,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#1e2a38",
    padding: 25,
    borderRadius: 16,
    width: "80%",
  },
  modalTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  modalText: {
    color: "#ccc",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelBtn: {
    backgroundColor: "#555",
    padding: 12,
    borderRadius: 10,
    width: "45%",
    alignItems: "center",
  },
  confirmBtn: {
    backgroundColor: "#2ecc71",
    padding: 12,
    borderRadius: 10,
    width: "45%",
    alignItems: "center",
  },
  modalBtnText: {
    color: "white",
    fontWeight: "600",
  },
});