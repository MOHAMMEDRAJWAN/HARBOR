import { useContext, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from "react-native";
import { CartContext } from "../../context/CartContext";
import api from "../../api/axios";
import { Ionicons } from "@expo/vector-icons";

export default function RetailerCart({ navigation }) {
  const {
    cart,
    removeFromCart,
    clearCart,
    updateQuantity,
  } = useContext(CartContext);

  const [paymentMethod, setPaymentMethod] = useState("COD");

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  console.log("CART:", cart);
  console.log("CART CONTENT:", cart);
  const placeOrder = async () => {
  if (!cart.length) return;

  try {
    const storeId = cart[0].storeId; // ✅ dynamic

    if (!storeId) {
      alert("Invalid store");
      return;
    }

    const orderData = {
      items: cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
      paymentMethod,
    };

    await api.post(`/orders/${storeId}`, orderData);

    alert("Order placed successfully");
    clearCart();
    navigation.navigate("Orders");
  } catch (err) {
    const msg = err.response?.data?.message || "Order failed";
    console.log(err.response?.data);

    if (msg && msg.includes("No credit account with this wholesaler")) {
      Alert.alert(
        "Credit Request Sent",
        "A credit request was sent to the wholesaler. You cannot complete this purchase on credit until they approve. Do you want to view your credit status?",
        [
          {
            text: "View Credit",
            onPress: () => navigation.navigate("Credit"),
          },
          { text: "OK", style: "cancel" },
        ]
      );
    } else {
      Alert.alert("Order Error", msg);
    }
  }
};

  // 🔥 Animated Quantity Button
  const AnimatedButton = ({ icon, onPress }) => {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 0.85,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
      ]).start();

      onPress();
    };

    return (
      <Animated.View
        style={[
          styles.qtyCircle,
          { transform: [{ scale }] },
        ]}
      >
        <TouchableOpacity onPress={handlePress}>
          <Ionicons
            name={icon}
            size={20}
            color="white"
          />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>

      <Text style={styles.price}>
        ₹ {item.price} x {item.quantity}
      </Text>

      {/* Quantity Controls */}
      <View style={styles.qtyRow}>
        <AnimatedButton
          icon="remove"
          onPress={() =>
            updateQuantity(item.id, item.quantity - 1)
          }
        />

        <Text style={styles.qtyValue}>
          {item.quantity}
        </Text>

        <AnimatedButton
          icon="add"
          onPress={() =>
            updateQuantity(item.id, item.quantity + 1)
          }
        />
      </View>

      <TouchableOpacity
        onPress={() => removeFromCart(item.id)}
        style={styles.removeBtn}
      >
        <Text style={styles.removeText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={cart}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <View style={styles.summary}>
        <Text style={styles.total}>Total: ₹ {total}</Text>

        {/* Payment Selection */}
        <View style={styles.paymentRow}>
          {["COD", "ONLINE", "CREDIT"].map((method) => (
            <TouchableOpacity
              key={method}
              style={[
                styles.payButton,
                paymentMethod === method &&
                  styles.selected,
              ]}
              onPress={() => setPaymentMethod(method)}
            >
              <Text style={styles.payText}>
                {method}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.orderBtn,
            cart.length === 0 && {
              backgroundColor: "#555",
            },
          ]}
          onPress={placeOrder}
          disabled={!cart.length}
        >
          <Text style={styles.orderText}>
            Place Order
          </Text>
        </TouchableOpacity>
      </View>
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

  name: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  price: {
    color: "#4f8cff",
    marginTop: 6,
  },

  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },

  qtyCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#4f8cff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4f8cff",
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 6,
  },

  qtyValue: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
    marginHorizontal: 18,
  },

  removeBtn: {
    marginTop: 10,
  },

  removeText: {
    color: "#ff6b6b",
    fontWeight: "600",
  },

  summary: {
    marginTop: 20,
    padding: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
  },

  total: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },

  paymentRow: {
    flexDirection: "row",
    marginVertical: 12,
  },

  payButton: {
    backgroundColor: "#1e3c47",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginRight: 10,
  },

  selected: {
    backgroundColor: "#4f8cff",
  },

  payText: {
    color: "white",
    fontWeight: "600",
  },

  orderBtn: {
    backgroundColor: "#6a5acd",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  orderText: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
  },
});