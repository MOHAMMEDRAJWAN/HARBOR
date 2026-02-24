import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axios";

export default function RetailerProfile() {
  const { user, logout, login } =
    useContext(AuthContext);

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(
    user?.address || ""
  );
  const [saving, setSaving] = useState(false);

  const saveProfile = async () => {
    try {
      setSaving(true);

      const res = await api.put("/me/update", {
        name,
        phone,
        address,
      });

      // Update context user
      await login(
        await api.defaults.headers.Authorization?.split(" ")[1],
        res.data.user
      );

      alert("Profile updated successfully");
    } catch (err) {
      alert("Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>
          {user?.email}
        </Text>

        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
        />

        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
        />
      </View>

      <TouchableOpacity
        style={styles.saveBtn}
        onPress={saveProfile}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.btnText}>
            Save Changes
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={logout}
      >
        <Text style={styles.btnText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f2027",
    padding: 16,
  },

  title: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 16,
    borderRadius: 14,
  },

  label: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 12,
  },

  value: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
    marginTop: 4,
  },

  input: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 12,
    borderRadius: 10,
    color: "white",
    marginTop: 6,
  },

  saveBtn: {
    marginTop: 20,
    backgroundColor: "#4f8cff",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  logoutBtn: {
    marginTop: 15,
    backgroundColor: "#ff4d4d",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  btnText: {
    color: "white",
    fontWeight: "700",
  },
});