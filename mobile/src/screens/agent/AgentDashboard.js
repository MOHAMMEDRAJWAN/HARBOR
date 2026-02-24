import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import api from "../../api/axios";

export default function AgentDashboard() {
  const [summary, setSummary] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSummary = async () => {
    try {
      const res = await api.get("/agent/orders/summary");
      setSummary(res.data.summary);
    } catch (err) {
      console.log("Dashboard fetch failed", err.response?.data);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSummary();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (!summary) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#4f8cff" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#4f8cff"
        />
      }
    >
      <View style={styles.card}>
  <Text style={styles.label}>Active Deliveries</Text>
  <Text style={styles.value}>{summary.active}</Text>
</View>

<View style={styles.card}>
  <Text style={styles.label}>Delivered Orders</Text>
  <Text style={styles.value}>{summary.delivered}</Text>
</View>

<View style={styles.card}>
  <Text style={styles.label}>Total Earnings</Text>
  <Text style={styles.value}>₹ {summary.earnings}</Text>
</View>

<View style={styles.card}>
  <Text style={styles.label}>This Week</Text>
  <Text style={styles.value}>₹ {summary.weekEarnings}</Text>
</View>

<View style={styles.card}>
  <Text style={styles.label}>This Month</Text>
  <Text style={styles.value}>₹ {summary.monthEarnings}</Text>
</View>
    </ScrollView>
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
  label: { color: "#aaa" },
  value: {
    color: "#4f8cff",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 6,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});