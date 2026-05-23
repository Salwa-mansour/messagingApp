import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);

  // If context is undefined, the hook is being called outside of its matching provider
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};