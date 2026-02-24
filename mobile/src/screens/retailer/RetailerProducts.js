import { useEffect, useState } from "react";
import { useContext } from "react";
import { CartContext } from "../../context/CartContext";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import api from "../../api/axios";

export default function RetailerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);
  const { categoryId } = route.params;

  const fetchProducts = async () => {
    try {
      const res = await api.get(`/products/category/${categoryId}`);
      console.log("Products:", res.data); // 🔍 Debug
      setProducts(res.data.products || []);
    } catch (err) {
      console.log("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const renderItem = ({ item }) => (
  <View style={styles.card}>
    <Text style={styles.name}>{item.name}</Text>
    <Text style={styles.price}>₹ {item.price}</Text>
    <Text style={styles.detail}>Stock: {item.stock}</Text>
    <Text style={styles.detail}>MOQ: {item.moq}</Text>

    <TouchableOpacity
      style={styles.cartButton}
      onPress={() => addToCart(item)}
    >
      <Text style={{ color: "white" }}>Add to Cart</Text>
    </TouchableOpacity>
  </View>
);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4f8cff" />
      </View>
    );
  }

  if (!products.length) {
    return (
      <View style={styles.empty}>
        <Text style={{ color: "white" }}>No products available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f2027", // ✅ FIX
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f2027",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f2027",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 18,
    borderRadius: 14,
    marginBottom: 16,
  },
  name: {
    color: "white",
    fontSize: 18,
    marginBottom: 6,
  },
  price: {
    color: "#4f8cff",
    fontSize: 16,
    marginBottom: 4,
  },
  detail: {
    color: "#ccc",
  },
  cartButton: {
  backgroundColor: "#4f8cff",
  padding: 10,
  borderRadius: 8,
  marginTop: 10,
  alignItems: "center",
},
});