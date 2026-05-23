import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatDashboard from "./components/chatBoard";


function App() {
  return (
    <Routes>
      {/* Root Layout wrapper containing shared structures (like toast notifications or universal wrappers) */}
      <Route path="/" element={<Layout />}>
        
        {/* Public Authentication Routes */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* Protected Application Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="chat" element={<ChatDashboard />} />
        </Route>

        {/* Fallbacks & Redirects */}
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="*" element={<div style={{ padding: "20px" }}><h2>404 - Page Not Found</h2></div>} />
      </Route>
    </Routes>
  );
}

export default App;