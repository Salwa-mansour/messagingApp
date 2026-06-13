import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import PersistLogin from "./components/PersistLogin";
import ChatDashboard from "./components/ChatBoard";
import AllUsers from "./components/AllUsers";

import CreateGroup from "./components/CreateGroup";


function App() {
  return (
    <Routes>
      {/* Root Layout wrapper containing shared structures (like toast notifications or universal wrappers) */}
     {/* Public Authentication Routes */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

      <Route path="/" element={<Layout />}>
        
      
        {/* Protected Application Routes */}
        <Route element={<PersistLogin />}>
          <Route element={<ProtectedRoute />}>
              <Route path="chat" element={<ChatDashboard />} />
              <Route path="users" element={<AllUsers />} />
            
              <Route path="creategroup" element={<CreateGroup />} />
          </Route>
        </Route>
        {/* Fallbacks & Redirects */}
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="*" element={<div style={{ padding: "20px" }}><h2>404 - Page Not Found</h2></div>} />
      </Route>
    </Routes>
  );
}

export default App;