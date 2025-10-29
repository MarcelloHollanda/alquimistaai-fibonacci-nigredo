import React, { createContext, useContext, useState, useEffect } from "react";
import { DEFAULT_TENANT_ID } from "@/lib/tenant-config";

interface TenantConfig {
  id: string; // UUID do tenant (tenant_id no backend)
  name: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  tenantId: string; // UUID para uso no backend/database (preparação SaaS)
}

interface TenantContextType {
  tenant: TenantConfig;
  updateTenant: (config: Partial<TenantConfig>) => void;
}

const defaultTenant: TenantConfig = {
  id: import.meta.env.VITE_TENANT_KEY || "demo",
  name: "Núcleo de Prospecção",
  primaryColor: "#2563eb",
  secondaryColor: "#6366f1",
  tenantId: DEFAULT_TENANT_ID, // UUID fixo para modo single-tenant
};

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<TenantConfig>(defaultTenant);

  useEffect(() => {
    // Carregar configuração do tenant do localStorage
    const storedConfig = localStorage.getItem("tenant_config");
    if (storedConfig) {
      setTenant({ ...defaultTenant, ...JSON.parse(storedConfig) });
    }
  }, []);

  const updateTenant = (config: Partial<TenantConfig>) => {
    const updated = { ...tenant, ...config };
    setTenant(updated);
    localStorage.setItem("tenant_config", JSON.stringify(updated));
  };

  return (
    <TenantContext.Provider value={{ tenant, updateTenant }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}
