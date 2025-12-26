"use client";

import { FileText, Image, Trash2, File as FileIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FileWithMetadata } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface FileListProps {
  files: FileWithMetadata[];
  selectedFileIds: string[];
  activeFileId: string | null;
  onFileSelect: (id: string) => void;
  onSelectionChange: (id:string, checked: boolean) => void;
  onDelete: (id: string) => void;
  className?: string;
}

export function FileList({
  files,
  selectedFileIds,
  activeFileId,
  onFileSelect,
  onSelectionChange,
  onDelete,
className,
}: FileListProps) {

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-5 w-5 text-blue-500 shrink-0" />;
    }
    if (fileType === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-500 shrink-0" />;
    }
    return <FileIcon className="h-5 w-5 text-gray-500 shrink-0" />;
  }
  
  if (files.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center", className)}>
        <FileIcon className="w-10 h-10 mb-4" />
        <h3 className="font-semibold">No files found.</h3>
        <p className="text-sm">Try changing your search term or upload new files.</p>
      </div>
    );
  }

  return (
    <ScrollArea className={cn("h-full", className)}>
      <div className="space-y-1 p-2">
        {files.map((file) => (
          <div
            key={file.id}
            onClick={() => onFileSelect(file.id)}
            className={cn(
              "group flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors duration-200 border border-transparent",
              activeFileId === file.id
                ? 'bg-primary/10 border-primary/30'
                : 'hover:bg-accent'
            )}
          >
            <Checkbox
              checked={selectedFileIds.includes(file.id)}
              onCheckedChange={(checked) => onSelectionChange(file.id, !!checked)}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Select file ${file.metadata.general.fileName}`}
            />
            {getFileIcon(file.metadata.general.fileType)}
            <div className="flex-1 truncate">
              <p className="text-sm font-medium truncate">{file.metadata.general.fileName}</p>
              <p className="text-xs text-muted-foreground">{file.metadata.general.fileSize}</p>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Delete file ${file.metadata.general.fileName}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will permanently delete "{file.metadata.general.fileName}" and its metadata. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => onDelete(file.id)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
