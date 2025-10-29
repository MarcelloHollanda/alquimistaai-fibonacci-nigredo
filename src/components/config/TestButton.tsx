import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

interface TestButtonProps {
  label: string;
  onTest: () => Promise<{ success: boolean; message: string }>;
  variant?: "default" | "outline";
}

type TestState = "idle" | "loading" | "success" | "error";

export function TestButton({ label, onTest, variant = "outline" }: TestButtonProps) {
  const [state, setState] = useState<TestState>("idle");
  const [message, setMessage] = useState<string>("");

  const handleTest = async () => {
    setState("loading");
    setMessage("");
    
    try {
      const result = await onTest();
      setState(result.success ? "success" : "error");
      setMessage(result.message);
      
      if (result.success) {
        setTimeout(() => {
          setState("idle");
          setMessage("");
        }, 3000);
      }
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Erro ao testar integração");
    }
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant={variant}
        onClick={handleTest}
        disabled={state === "loading"}
        className="w-full"
      >
        {state === "loading" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {state === "success" && <CheckCircle className="mr-2 h-4 w-4 text-success" />}
        {state === "error" && <XCircle className="mr-2 h-4 w-4 text-destructive" />}
        {label}
      </Button>
      
      {message && (
        <Alert variant={state === "error" ? "destructive" : "default"}>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
