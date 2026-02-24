import { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import api from "../../api/axios";
import { CartContext } from "../../context/CartContext";

export default function RetailerStores() {
  const [stores, setStores] = useState([]);
  const [expandedStore, setExpandedStore] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [categories, setCategories] = useState({});
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(false);

  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const res = await api.get("/stores");
      setStores(res.data.stores || []);
    } catch (err) {
      console.log("Store fetch failed", err);
    }
  };

  const fetchCategories = async (storeId) => {
    try {
      const res = await api.get(`/categories/store/${storeId}`);
      setCategories((prev) => ({
        ...prev,
        [storeId]: res.data.categories || [],
      }));
    } catch (err) {
      console.log("Category fetch failed", err);
    }
  };

  const fetchProducts = async (categoryId) => {
    try {
      const res = await api.get(`/products/category/${categoryId}`);
      setProducts((prev) => ({
        ...prev,
        [categoryId]: res.data.products || [],
      }));
    } catch (err) {
      console.log("Product fetch failed", err);
    }
  };

  return (
    <View style={styles.container}>
      {stores.map((store) => (
        <View key={store.id} style={styles.storeCard}>
          <TouchableOpacity
            onPress={() => {
              if (expandedStore === store.id) {
                setExpandedStore(null);
              } else {
                setExpandedStore(store.id);
                fetchCategories(store.id);
              }
            }}
          >
            <Text style={styles.storeName}>{store.name}</Text>
          </TouchableOpacity>

          {expandedStore === store.id &&
            categories[store.id]?.map((cat) => (
              <View key={cat.id} style={styles.categoryBlock}>
                <TouchableOpacity
                  onPress={() => {
                    if (expandedCategory === cat.id) {
                      setExpandedCategory(null);
                    } else {
                      setExpandedCategory(cat.id);
                      fetchProducts(cat.id);
                    }
                  }}
                >
                  <Text style={styles.categoryName}>{cat.name}</Text>
                </TouchableOpacity>

                {expandedCategory === cat.id &&
                  products[cat.id]?.map((product) => (
                    <View key={product.id} style={styles.productCard}>
                      <Text style={styles.productName}>
                        {product.name}
                      </Text>
                      <Text style={styles.productPrice}>
                        ₹ {product.price}
                      </Text>

                      <TouchableOpacity
                        style={styles.cartBtn}
                        onPress={() =>
                          addToCart({
                           id: product.id,
                           name: product.name,
                           price: product.price,
                           storeId: store.id,   //  MUST pass storeId
                          })
                        }
                      >
                        <Text style={{ color: "white" }}>
                          Add to Cart
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
              </View>
            ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f2027",
    padding: 16,
  },
  storeCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 16,
    borderRadius: 14,
    marginBottom: 15,
  },
  storeName: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  categoryBlock: {
    marginTop: 12,
    paddingLeft: 10,
  },
  categoryName: {
    color: "#4f8cff",
    fontSize: 16,
    marginBottom: 8,
  },
  productCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  productName: {
    color: "white",
  },
  productPrice: {
    color: "#aaa",
  },
  cartBtn: {
    marginTop: 6,
    backgroundColor: "#6a5acd",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
  },
});