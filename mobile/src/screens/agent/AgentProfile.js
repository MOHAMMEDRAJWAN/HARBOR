import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function AgentProfile() {
  const { user, logout } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{user?.name}</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email}</Text>

        <Text style={styles.label}>Role</Text>
        <Text style={styles.value}>{user?.role}</Text>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f2027", padding: 16 },
  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 16,
    borderRadius: 14,
  },
  label: { color: "#aaa", marginTop: 10, fontSize: 12 },
  value: { color: "white", fontWeight: "600", fontSize: 15 },
  logoutBtn: {
    marginTop: 30,
    backgroundColor: "#ff4d4d",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutText: { color: "white", fontWeight: "700" },
});