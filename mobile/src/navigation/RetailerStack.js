import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import api from "../api/axios";

/* Retailer Screens */
import RetailerHome from "../screens/retailer/RetailerHome";
import RetailerOrders from "../screens/retailer/RetailerOrders";
import RetailerCredit from "../screens/retailer/RetailerCredit";
import RetailerCart from "../screens/retailer/RetailerCart";
import RetailerProfile from "../screens/retailer/RetailerProfile";

/* Store Flow Screens */
import RetailerStores from "../screens/retailer/RetailerStores";
import RetailerCategories from "../screens/retailer/RetailerCategories";
import RetailerProducts from "../screens/retailer/RetailerProducts";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/* ===============================
   Store Stack
=============================== */

function StoreStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#0f2027" },
        headerTintColor: "white",
      }}
    >
      <Stack.Screen
        name="StoresList"
        component={RetailerStores}
        options={{ title: "Stores" }}
      />
      <Stack.Screen
        name="Categories"
        component={RetailerCategories}
        options={({ route }) => ({
          title: route.params?.storeName || "Categories",
        })}
      />
      <Stack.Screen
        name="Products"
        component={RetailerProducts}
        options={({ route }) => ({
          title: route.params?.categoryName || "Products",
        })}
      />
    </Stack.Navigator>
  );
}

/* ===============================
   Retailer Stack With Notifications
=============================== */

export default function RetailerStack() {
  const [badge, setBadge] = useState(0);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [lastCreditStatus, setLastCreditStatus] = useState(null);

  useEffect(() => {
    checkNotifications();
    const interval = setInterval(checkNotifications, 20000);
    return () => clearInterval(interval);
  }, []);

  const checkNotifications = async () => {
    try {
      const ordersRes = await api.get("/retailer/orders");
      const orders = ordersRes.data.orders || [];

      if (orders.length > lastOrderCount) {
        setBadge((prev) => prev + 1);
      }
      setLastOrderCount(orders.length);

      const creditRes = await api.get("/credit/me");
      const creditStatus =
        creditRes.data.credit?.creditStatus;

      if (
        lastCreditStatus &&
        creditStatus !== lastCreditStatus
      ) {
        setBadge((prev) => prev + 1);
      }

      setLastCreditStatus(creditStatus);
    } catch (err) {
      // silent fail
    }
  };

  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
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

        headerRight: () => (
          <TouchableOpacity
            onPress={() => {
              setBadge(0);
              navigation.navigate("Orders");
            }}
            style={{ marginRight: 15 }}
          >
            <View>
              <Ionicons
                name="notifications"
                size={22}
                color="white"
              />

              {badge > 0 && (
                <View
                  style={{
                    position: "absolute",
                    right: -6,
                    top: -4,
                    backgroundColor: "red",
                    borderRadius: 10,
                    paddingHorizontal: 5,
                    paddingVertical: 1,
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: 10,
                      fontWeight: "700",
                    }}
                  >
                    {badge}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ),

        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Home") iconName = "home";
          if (route.name === "Stores") iconName = "business";
          if (route.name === "Orders") iconName = "receipt";
          if (route.name === "Cart") iconName = "cart";
          if (route.name === "Credit") iconName = "card";
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
      <Tab.Screen name="Home" component={RetailerHome} />
      <Tab.Screen name="Stores" component={StoreStack} />
      <Tab.Screen name="Orders" component={RetailerOrders} />
      <Tab.Screen name="Cart" component={RetailerCart} />
      <Tab.Screen name="Credit" component={RetailerCredit} />
      <Tab.Screen name="Profile" component={RetailerProfile} />
    </Tab.Navigator>
  );
}