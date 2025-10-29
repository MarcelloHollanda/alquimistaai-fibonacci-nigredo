import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Building2, Settings } from "lucide-react";
import { CompanySettingsForm } from "@/components/users/CompanySettingsForm";
import { UserRolesTable } from "@/components/users/UserRolesTable";
import { UserProfileForm } from "@/components/users/UserProfileForm";

export default function UserManagement() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
          <p className="text-muted-foreground">
            Configure usuários, perfis de acesso e informações da empresa
          </p>
        </div>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Meu Perfil
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <UserRolesTable />
        </TabsContent>

        <TabsContent value="company" className="space-y-4">
          <CompanySettingsForm />
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <UserProfileForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
