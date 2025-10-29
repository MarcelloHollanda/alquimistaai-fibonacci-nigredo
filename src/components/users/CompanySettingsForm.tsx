import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function CompanySettingsForm() {
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    company_description: "",
    logo_url: "",
    target_audience: "",
    work_profile: "",
    interests: "",
    main_clients: "",
    whatsapp: "",
    email: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    twitter: "",
    website: "",
  });

  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["company-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_settings")
        .select("*")
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
  });

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const uploadLogo = async (file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("company-assets")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("company-assets")
        .getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, logo_url: publicUrl }));
      toast.success("Logo enviada com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao enviar logo: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Buscar tenant_id do usuário
      const { data: profile } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

      if (!profile) throw new Error("Perfil do usuário não encontrado");

      const { error } = await supabase
        .from("company_settings")
        .upsert({ ...formData, user_id: user.id, tenant_id: profile.tenant_id });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-settings"] });
      toast.success("Configurações salvas com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao salvar: " + error.message);
    },
  });

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações da Empresa</CardTitle>
        <CardDescription>
          Configure as informações da sua empresa que serão utilizadas no sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={formData.logo_url} />
            <AvatarFallback>LOGO</AvatarFallback>
          </Avatar>
          <div>
            <Label htmlFor="logo">Logo da Empresa</Label>
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadLogo(file);
              }}
              disabled={uploading}
              className="mt-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company_name">Nome da Empresa *</Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail Corporativo</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company_description">Descrição da Empresa</Label>
          <Textarea
            id="company_description"
            value={formData.company_description}
            onChange={(e) => setFormData({ ...formData, company_description: e.target.value })}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="target_audience">Público Alvo</Label>
          <Textarea
            id="target_audience"
            value={formData.target_audience}
            onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
            rows={2}
            placeholder="Descreva seu público alvo ideal..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="work_profile">Perfil de Trabalho</Label>
          <Textarea
            id="work_profile"
            value={formData.work_profile}
            onChange={(e) => setFormData({ ...formData, work_profile: e.target.value })}
            rows={2}
            placeholder="Descreva como sua empresa trabalha..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="interests">Interesses</Label>
          <Textarea
            id="interests"
            value={formData.interests}
            onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
            rows={2}
            placeholder="Quais são os principais interesses da empresa?"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="main_clients">Principais Clientes</Label>
          <Textarea
            id="main_clients"
            value={formData.main_clients}
            onChange={(e) => setFormData({ ...formData, main_clients: e.target.value })}
            rows={2}
            placeholder="Liste alguns de seus principais clientes..."
          />
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold mb-4">Redes Sociais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                value={formData.facebook}
                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                placeholder="@empresa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="@empresa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                placeholder="linkedin.com/company/empresa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter/X</Label>
              <Input
                id="twitter"
                value={formData.twitter}
                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                placeholder="@empresa"
              />
            </div>
          </div>
        </div>

        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending || !formData.company_name}
          className="w-full"
        >
          {saveMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar Configurações"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
