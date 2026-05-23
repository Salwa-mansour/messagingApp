import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Mock placeholder component for your core application workspace
const ChatDashboard = () => (
  <div style={{ padding: "20px" }}>
    <h2>Chat Dashboard Workspace</h2>
    <p>Welcome! You successfully authenticated.</p>
  </div>
);

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