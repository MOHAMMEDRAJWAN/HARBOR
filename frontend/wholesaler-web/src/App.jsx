import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import WholesalerDashboard from "./pages/WholesalerDashboard";
import ProtectedRoute from "./auth/ProtectedRoute";
import Products from "./wholesaler/Products";
import Orders from "./wholesaler/Orders";
import Analytics from "./wholesaler/Analytics";
import CreditRequests from "./wholesaler/CreditRequests";
import CreditAccounts from "./wholesaler/CreditAccounts";
import Profile from "./wholesaler/Profile";
import "./App.css";
//import Layout from "./components/Layout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route
         path="/wholesaler"
         element={
           <ProtectedRoute role="wholesaler">
             
              <WholesalerDashboard />
             
          </ProtectedRoute>
       }
    />

<Route
  path="/wholesaler/products"
  element={
    <ProtectedRoute role="wholesaler">
      <Products />
    </ProtectedRoute>
  }
/>

<Route
  path="/wholesaler/orders"
  element={
    <ProtectedRoute role="wholesaler">
      <Orders />
    </ProtectedRoute>
  }
/>

<Route
  path="/wholesaler/analytics"
  element={
    <ProtectedRoute role="wholesaler">
      <Analytics />
    </ProtectedRoute>
  }
/>

<Route
  path="/wholesaler/credit-requests"
  element={
    <ProtectedRoute role="wholesaler">
      <CreditRequests />
    </ProtectedRoute>
  }
/>

<Route
  path="/wholesaler/credit-accounts"
  element={
    <ProtectedRoute role="wholesaler">
      <CreditAccounts />
    </ProtectedRoute>
  }
/>

<Route
  path="/wholesaler/profile"
  element={
    <ProtectedRoute role="wholesaler">
      <Profile />
    </ProtectedRoute>
  }
/>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}