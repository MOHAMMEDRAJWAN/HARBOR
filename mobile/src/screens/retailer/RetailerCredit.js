import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextInput,
} from "react-native";
import api from "../../api/axios";

export default function RetailerCredit() {
  const [credit, setCredit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");

  const fetchCredit = async () => {
    try {
      const res = await api.get("/credit/me");
      setCredit(res.data.credit);
    } catch (err) {
      console.log("Credit fetch failed", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const requestCredit = async () => {
    try {
      await api.post("/credit/request");
      alert("Credit request submitted");
      fetchCredit();
    } catch (err) {
      alert(err.response?.data?.message || "Request failed");
    }
  };

  const settleCredit = async () => {
    if (!amount) return;

    try {
      await api.put("/credit/self/settle", {
        amount: Number(amount),
      });

      alert("Credit settled successfully");
      setAmount("");
      fetchCredit();
    } catch (err) {
      alert(err.response?.data?.message || "Settlement failed");
    }
  };

  useEffect(() => {
    fetchCredit();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#4f8cff" />
      </View>
    );
  }

  const available =
    (credit?.creditLimit || 0) - (credit?.creditUsed || 0);

  return (
    <View style={styles.container}>
      {/* Status Card */}
      <View style={styles.card}>
        <Text style={styles.label}>Credit Status</Text>
        <Text style={styles.status}>
          {credit?.creditStatus?.toUpperCase()}
        </Text>
      </View>

      {/* Financial Info */}
      <View style={styles.card}>
        <Text style={styles.label}>Credit Limit</Text>
        <Text style={styles.amount}>
          ₹ {credit?.creditLimit || 0}
        </Text>

        <Text style={styles.label}>Credit Used</Text>
        <Text style={styles.amount}>
          ₹ {credit?.creditUsed || 0}
        </Text>

        <Text style={styles.label}>Available Balance</Text>
        <Text style={[styles.amount, { color: "#2ecc71" }]}>
          ₹ {available}
        </Text>
      </View>

      {/* Request Button */}
      {(credit?.creditStatus === "none" ||
        credit?.creditStatus === "rejected") && (
        <TouchableOpacity
          style={styles.requestBtn}
          onPress={requestCredit}
        >
          <Text style={styles.btnText}>
            Request Credit
          </Text>
        </TouchableOpacity>
      )}

      {/* ==============================
          SELF CREDIT SETTLEMENT
         ============================== */}
      {credit?.creditStatus === "approved" &&
        credit?.creditUsed > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Settle Credit (Online)
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              placeholderTextColor="#aaa"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            <TouchableOpacity
              style={styles.payBtn}
              onPress={settleCredit}
            >
              <Text style={styles.btnText}>
                Pay Online
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
    padding: 20,
    borderRadius: 14,
    marginBottom: 15,
  },
  label: {
    color: "#aaa",
    marginBottom: 5,
  },
  status: {
    color: "#4f8cff",
    fontSize: 18,
    fontWeight: "600",
  },
  amount: {
    color: "white",
    fontSize: 16,
    marginBottom: 8,
  },
  requestBtn: {
    backgroundColor: "#6a5acd",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  payBtn: {
    backgroundColor: "#4f8cff",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: {
    color: "white",
    fontWeight: "600",
  },
  sectionTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 12,
    borderRadius: 10,
    color: "white",
    marginBottom: 10,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});