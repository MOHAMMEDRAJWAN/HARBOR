import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import api from "../../api/axios";

export default function RegisterScreen() {
  const navigation = useNavigation(); // ✅ single navigation source

  const [role, setRole] = useState("retailer");
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const endpoint = `/auth/register/${role}`;

      const payload = {
        name,
        email,
        phone,
        address,
        password,
      };

      if (role === "wholesaler") {
        payload.businessName = businessName;
      }

      await api.post(endpoint, payload);

      alert("Registration successful. Please login.");
      navigation.navigate("Login");
    } catch (err) {
  console.log("REGISTER ERROR:", err.response?.data);
  console.log("REGISTER FULL ERROR:", err);
  alert(err.response?.data?.message || "Registration failed");
}
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <View style={styles.roleRow}>
        {["retailer", "agent", "wholesaler"].map((r) => (
          <TouchableOpacity
            key={r}
            style={[
              styles.roleBtn,
              role === r && styles.selectedRole,
            ]}
            onPress={() => setRole(r)}
          >
            <Text style={styles.roleText}>{r}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        placeholder="Name"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      {role === "wholesaler" && (
        <TextInput
          placeholder="Business Name"
          placeholderTextColor="#aaa"
          style={styles.input}
          value={businessName}
          onChangeText={setBusinessName}
        />
      )}

      <TextInput
        placeholder="Email"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Phone"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
      />

      <TextInput
        placeholder="Address"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={address}
        onChangeText={setAddress}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#aaa"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
      >
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.link}>
          Already have account? Login
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f2027",
    padding: 20,
  },
  title: {
    color: "white",
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 14,
    borderRadius: 10,
    color: "white",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#4f8cff",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
  roleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  roleBtn: {
    padding: 10,
    backgroundColor: "#1e3c47",
    borderRadius: 8,
    width: "30%",
    alignItems: "center",
  },
  selectedRole: {
    backgroundColor: "#4f8cff",
  },
  roleText: {
    color: "white",
    fontSize: 12,
  },
  link: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 15,
  },
});