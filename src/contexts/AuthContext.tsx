import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole } from "@/lib/permissions";

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Verificar se há usuário no localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Simulação de login (modo mock)
    const mockUser: User = {
      id: "1",
      email,
      name: email.split("@")[0],
      role: email.includes("admin") ? "admin" : "gestor",
      tenantId: import.meta.env.VITE_TENANT_KEY || "demo",
    };

    setUser(mockUser);
    localStorage.setItem("user", JSON.stringify(mockUser));
    localStorage.setItem("auth_token", "mock-token-" + Date.now());
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("auth_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
