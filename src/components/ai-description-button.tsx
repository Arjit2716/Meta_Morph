"use client";

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { generateDescriptionAction } from '@/app/actions';
import type { FileWithMetadata } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

interface AiDescriptionButtonProps {
  form: UseFormReturn<any>;
  currentFile: FileWithMetadata;
}

export function AiDescriptionButton({ form, currentFile }: AiDescriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const description = await generateDescriptionAction(
        currentFile.metadata.general.fileName,
        currentFile.metadata.general.fileType
      );
      
      if (description.includes("Failed")) {
        toast({
          variant: "destructive",
          title: "AI Assistant Error",
          description: "Could not generate a description. Please try again.",
        });
      } else {
        form.setValue('description', description, { shouldValidate: true });
        toast({
          title: "AI Assistant",
          description: "Description has been generated and filled in.",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "AI Assistant Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleGenerate}
            disabled={isLoading}
            className="shrink-0"
          >
            {isLoading ? (
              <Sparkles className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span className="sr-only">Generate with AI</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Generate description with AI</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
