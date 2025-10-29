import { BookOpen, Download, ExternalLink } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

interface TutorialStep {
  title: string;
  description: string;
  link?: string;
}

interface TutorialAccordionProps {
  title?: string;
  steps: TutorialStep[];
  pdfUrl?: string;
}

export function TutorialAccordion({ 
  title = "Como obter credenciais?", 
  steps,
  pdfUrl 
}: TutorialAccordionProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="tutorial">
        <AccordionTrigger className="text-sm">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>{title}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 pt-2">
            <ol className="space-y-3 text-sm">
              {steps.map((step, index) => (
                <li key={index} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">{step.title}</p>
                    <p className="text-muted-foreground">{step.description}</p>
                    {step.link && (
                      <a
                        href={step.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        Acessar plataforma
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ol>
            
            {pdfUrl && (
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href={pdfUrl} download>
                  <Download className="mr-2 h-4 w-4" />
                  Baixar Tutorial Completo (PDF)
                </a>
              </Button>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
