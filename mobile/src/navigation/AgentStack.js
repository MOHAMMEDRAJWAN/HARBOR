import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

/* Agent Screens */
import AgentHome from "../screens/agent/AgentHome";
import AgentHistory from "../screens/agent/AgentHistory";
import AgentProfile from "../screens/agent/AgentProfile";
import AgentOrders from "../screens/agent/AgentOrders";
import AgentDashboard from "../screens/agent/AgentDashboard";

const Tab = createBottomTabNavigator();

export default function AgentStack() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: "#0f2027",
        },
        headerTintColor: "white",
        tabBarStyle: {
          backgroundColor: "#0f2027",
          borderTopColor: "#1e3c47",
        },
        tabBarActiveTintColor: "#4f8cff",
        tabBarInactiveTintColor: "gray",
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Home") iconName = "cube";
          if (route.name === "History") iconName = "time";
          if (route.name === "Profile") iconName = "person";

          return (
            <Ionicons
              name={iconName}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={AgentHome} />
      <Tab.Screen name="Orders" component={AgentOrders} />
      <Tab.Screen name="History" component={AgentHistory} />
      <Tab.Screen name="Dashboard" component={AgentDashboard} />
      <Tab.Screen name="Profile" component={AgentProfile} />
    </Tab.Navigator>
  );
}