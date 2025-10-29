import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ColumnMapperProps {
  headers: string[];
  mapping: Record<string, string>;
  onMappingChange: (mapping: Record<string, string>) => void;
}

const INTERNAL_FIELDS = [
  { value: "razao_social", label: "Razão Social" },
  { value: "nome_fantasia", label: "Nome Fantasia" },
  { value: "cnpj", label: "CNPJ" },
  { value: "email", label: "Email" },
  { value: "telefone", label: "Telefone" },
  { value: "uf", label: "UF" },
  { value: "cidade", label: "Cidade" },
  { value: "cnae", label: "CNAE" },
  { value: "origem", label: "Origem" },
  { value: "tags", label: "Tags" },
];

export function ColumnMapper({ headers, mapping, onMappingChange }: ColumnMapperProps) {
  const handleChange = (csvColumn: string, internalField: string) => {
    onMappingChange({ ...mapping, [csvColumn]: internalField });
  };

  return (
    <div className="space-y-4">
      {headers.map((header) => (
        <div key={header} className="space-y-2">
          <Label className="text-sm font-medium">{header}</Label>
          <Select
            value={mapping[header] || ""}
            onValueChange={(value) => handleChange(header, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um campo" />
            </SelectTrigger>
            <SelectContent>
              {INTERNAL_FIELDS.map((field) => (
                <SelectItem key={field.value} value={field.value}>
                  {field.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
}
