import { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";

export default function LoginScreen() {
  const { login } = useContext(AuthContext);
  const navigation = useNavigation(); // ✅ FIXED

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = res.data;

      await login(token, user); // switches stack automatically
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Harbor Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={styles.link}>
          New user? Register
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f2027",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 26,
    color: "white",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 14,
    borderRadius: 10,
    color: "white",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#4f8cff",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
  link: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 15,
  },
});