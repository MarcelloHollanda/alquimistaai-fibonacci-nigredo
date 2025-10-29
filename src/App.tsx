import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TenantProvider } from "@/contexts/TenantContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Auth from "./pages/Auth";
import UserManagement from "./pages/UserManagement";
import NotFound from "./pages/NotFound";
import Leads from "./pages/Leads";
import Estrategia from "./pages/Estrategia";
import Aprovacoes from "./pages/Aprovacoes";
import Disparo from "./pages/Disparo";
import Conversas from "./pages/Conversas";
import Agendamentos from "./pages/Agendamentos";
import Relatorios from "./pages/Relatorios";
import Agentes from "./pages/Agentes";
import Config from "./pages/Config";
import Objecoes from "./pages/Objecoes";
import Experimentos from "./pages/Experimentos";
import Aprendizado from "./pages/Aprendizado";
import IntegrationTests from "./pages/IntegrationTests";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TenantProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/auth" element={<Auth />} />
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/leads" element={<Leads />} />
                <Route path="/estrategia" element={<Estrategia />} />
                <Route path="/aprovacoes" element={<Aprovacoes />} />
                <Route path="/disparo" element={<Disparo />} />
                <Route path="/conversas" element={<Conversas />} />
                <Route path="/agendamentos" element={<Agendamentos />} />
                <Route path="/relatorios" element={<Relatorios />} />
                <Route path="/objecoes" element={<Objecoes />} />
                <Route path="/experimentos" element={<Experimentos />} />
                <Route path="/aprendizado" element={<Aprendizado />} />
                <Route path="/agentes" element={<Agentes />} />
                <Route path="/config" element={<Config />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/integration-tests" element={<IntegrationTests />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </TenantProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
