"use client";

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from './ui/card';

interface FileUploaderProps {
  onFilesAdded: (files: File[]) => void;
  className?: string;
}

export function FileUploader({ onFilesAdded, className }: FileUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesAdded(acceptedFiles);
  }, [onFilesAdded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'application/pdf': ['.pdf'],
    },
  });

  return (
    <Card
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed border-border rounded-xl text-center cursor-pointer transition-colors duration-300 ease-in-out flex flex-col items-center justify-center p-6 bg-card/80 backdrop-blur-sm',
        'hover:border-primary/80 hover:bg-primary/10',
        isDragActive && 'border-primary bg-primary/20 scale-105',
        className
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4 text-center">
        <div className={cn("p-4 rounded-full border-4 border-muted bg-background transition-all duration-300 group-hover:border-primary/20 group-hover:bg-primary/10", isDragActive && "scale-110 border-primary/30")}>
           <UploadCloud className={cn("h-8 w-8 text-muted-foreground transition-colors duration-300 group-hover:text-primary", isDragActive && "text-primary")} />
        </div>
        {isDragActive ? (
          <p className="text-lg font-medium text-primary">Drop the files here...</p>
        ) : (
          <div>
            <p className="text-lg font-medium text-foreground">Drag & drop files here</p>
            <p className="text-sm text-muted-foreground mt-1">or click to select files</p>
            <p className="text-xs text-muted-foreground/80 mt-2">Supports: JPG, PNG, PDF</p>
          </div>
        )}
      </div>
    </Card>
  );
}
