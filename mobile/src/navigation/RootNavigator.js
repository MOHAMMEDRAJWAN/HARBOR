import { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { View, ActivityIndicator } from "react-native";
import { AuthContext } from "../context/AuthContext";
import AuthStack from "./AuthStack";
import RetailerStack from "./RetailerStack";
import AgentStack from "./AgentStack";

export default function RootNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex:1, justifyContent:"center", alignItems:"center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user ? (
        <AuthStack />
      ) : user.role === "retailer" ? (
        <RetailerStack />
      ) : (
        <AgentStack />
      )}
    </NavigationContainer>
  );
}