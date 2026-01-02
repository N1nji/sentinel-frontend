import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import type { JSX } from "react";

interface TokenPayload {
  tipo: string;
}

export default function AdminRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode<TokenPayload>(token);

    if (decoded.tipo !== "admin") {
      return <Navigate to="/dashboard" replace />;
    }

    return children;
  } catch {
    return <Navigate to="/login" replace />;
  }
}
