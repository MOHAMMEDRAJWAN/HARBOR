import { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { CartContext } from "../../context/CartContext";
import api from "../../api/axios";

export default function RetailerHome() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/retailer/orders");
      setOrders(res.data.orders || []);
    } catch (err) {
      console.log(
        "Failed to fetch orders",
        err.response?.data
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
  };

  /* ===============================
     SUMMARY CALCULATIONS
  =============================== */

  const totalOrders = orders.length;

  const deliveredOrders = orders.filter(
    (o) => o.status === "delivered"
  ).length;

  const totalSpend = orders.reduce(
    (sum, o) => sum + o.totalAmount,
    0
  );

  /* ===============================
     FREQUENTLY BOUGHT LOGIC
  =============================== */

  const frequencyMap = {};

  orders.forEach((order) => {
    order.items.forEach((item) => {
      const id = item.productId;
      const name = item.product?.name;

      if (!frequencyMap[id]) {
        frequencyMap[id] = {
          id,
          name,
          price: item.price,
          quantity: 0,
        };
      }

      frequencyMap[id].quantity += item.quantity;
    });
  });

  const frequentProducts = Object.values(
    frequencyMap
  )
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#4f8cff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ================= SUMMARY CARDS ================= */}

      <View style={styles.cardRow}>
        <DashboardCard
          title="Total Spend"
          value={`₹ ${totalSpend}`}
        />
        <DashboardCard
          title="Total Orders"
          value={totalOrders}
        />
        <DashboardCard
          title="Delivered"
          value={deliveredOrders}
        />
      </View>

      {/* ================= FREQUENTLY BOUGHT ================= */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Frequently Bought
        </Text>

        {frequentProducts.length === 0 ? (
          <Text style={styles.emptyText}>
            No order history yet
          </Text>
        ) : (
          <FlatList
            data={frequentProducts}
            keyExtractor={(item) =>
              item.id.toString()
            }
            renderItem={({ item }) => (
              <View style={styles.productCard}>
                <Text style={styles.productName}>
                  {item.name}
                </Text>

                <Text style={styles.productQty}>
                  Bought {item.quantity} times
                </Text>

                <TouchableOpacity
                  style={styles.reorderBtn}
                  onPress={() => {
                    addToCart({
                      id: item.id,
                      name: item.name,
                      price: item.price,
                      quantity: 1,
                    });
                    alert("Added to cart");
                  }}
                >
                  <Text style={styles.reorderText}>
                    Reorder
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4f8cff"]}
            tintColor="#4f8cff"
          />
        }

/* ===============================
   Dashboard Card Component
=============================== */

function DashboardCard({ title, value }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>
        {title}
      </Text>
      <Text style={styles.cardValue}>
        {value}
      </Text>
    </View>
  );
}

/* ===============================
   Styles
=============================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f2027",
    padding: 16,
  },

  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 16,
    borderRadius: 14,
    width: "31%",
  },

  cardTitle: {
    color: "#aaa",
    fontSize: 12,
    marginBottom: 8,
  },

  cardValue: {
    color: "#4f8cff",
    fontSize: 18,
    fontWeight: "700",
  },

  section: {
    marginTop: 30,
  },

  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },

  productCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },

  productName: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },

  productQty: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 4,
  },

  reorderBtn: {
    marginTop: 10,
    backgroundColor: "#4f8cff",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },

  reorderText: {
    color: "white",
    fontWeight: "600",
  },

  emptyText: {
    color: "#aaa",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});