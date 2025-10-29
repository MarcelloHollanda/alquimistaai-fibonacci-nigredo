import { useCallback, useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface CsvUploaderProps {
  onUpload: (file: File) => void;
  isUploading?: boolean;
}

export function CsvUploader({ onUpload, isUploading }: CsvUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith(".csv")) {
        onUpload(file);
      }
    },
    [onUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onUpload(file);
      }
    },
    [onUpload]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50",
        isUploading && "pointer-events-none opacity-50"
      )}
    >
      <Upload className="h-10 w-10 text-muted-foreground mb-4" />
      <p className="text-sm font-medium mb-1">
        {isUploading ? "Enviando..." : "Arraste um arquivo CSV ou clique para selecionar"}
      </p>
      <p className="text-xs text-muted-foreground">Tamanho máximo: 10MB</p>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        disabled={isUploading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>
  );
}
