"use client";

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileText, Image as ImageIcon, Save, Tag, User, Type, ShieldOff, CameraOff, MapPinOff, File as FileIcon } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { FileWithMetadata, EditableMetadata, GeneralMetadata, TechnicalMetadata } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AiDescriptionButton } from './ai-description-button';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';

interface MetadataViewerProps {
  file: FileWithMetadata;
  onSave: (fileId: string, data: EditableMetadata) => void;
  onSanitize: (fileId: string, fields: (keyof EditableMetadata | 'location' | 'camera')[]) => void;
  className?: string;
}

const metadataFormSchema = z.object({
  title: z.string().max(100, "Title is too long.").optional(),
  author: z.string().max(50, "Author name is too long.").optional(),
  description: z.string().max(500, "Description is too long.").optional(),
  tags: z.string().refine(val => val.split(',').every(tag => tag.trim().length > 0) || val.length === 0, {
    message: "Tags should be comma-separated values."
  }).optional(),
});

function MetadataList({ data }: { data: GeneralMetadata | TechnicalMetadata }) {
  if (Object.keys(data).length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No technical metadata available.</p>
  }
  
  return (
    <ul className="space-y-4 text-sm">
      {Object.entries(data).map(([key, value]) => (
        <li key={key} className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 border-b pb-3 last:border-b-0">
          <span className="font-medium text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
          <span className="font-semibold text-right break-all">{value.toString()}</span>
        </li>
      ))}
    </ul>
  );
}

const FilePreview = ({ file }: { file: FileWithMetadata }) => {
  const [filePreview, setFilePreview] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    if (file.file.type.startsWith('image/')) {
      objectUrl = URL.createObjectURL(file.file);
      setFilePreview(objectUrl);
    } else {
      setFilePreview(null);
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [file]);

  if (file.file.type.startsWith('image/') && filePreview) {
    return (
      <div className="relative w-full h-full min-h-[300px] rounded-lg overflow-hidden bg-muted/20 animate-fade-in">
        <Image src={filePreview} alt={`Preview of ${file.metadata.general.fileName}`} layout="fill" objectFit="contain" />
      </div>
    );
  }
  
  let Icon = FileIcon;
  let color = "text-muted-foreground";
  if (file.file.type.startsWith('image/')) {
    Icon = ImageIcon;
    color = "text-primary";
  } else if (file.file.type === 'application/pdf') {
    Icon = FileText;
    color = "text-destructive";
  }


  return (
    <div className="flex items-center justify-center w-full h-full min-h-[300px] rounded-lg bg-muted/30 border border-dashed animate-fade-in">
      <div className="text-center text-muted-foreground">
        <Icon className={`mx-auto h-16 w-16 ${color}`} />
        <p className="mt-2 text-sm">No preview available for this file type.</p>
      </div>
    </div>
  );
};


export function MetadataViewer({ file, onSave, onSanitize, className }: MetadataViewerProps) {
  const form = useForm<EditableMetadata>({
    resolver: zodResolver(metadataFormSchema),
    defaultValues: file.metadata.editable,
  });

  useEffect(() => {
    form.reset(file.metadata.editable);
  }, [file, form]);

  const onSubmit = (data: EditableMetadata) => {
    onSave(file.id, data);
  };
  
  const fileTypeIcon = useMemo(() => {
    if (file.metadata.general.fileType.startsWith('image/')) {
      return <ImageIcon className="h-8 w-8 text-primary" />;
    }
    if (file.metadata.general.fileType === 'application/pdf') {
      return <FileText className="h-8 w-8 text-destructive" />;
    }
    return <FileIcon className="h-8 w-8 text-muted-foreground" />;
  }, [file.metadata.general.fileType]);


  return (
    <Card className={cn("h-full flex flex-col rounded-xl overflow-hidden bg-card/80 backdrop-blur-sm animate-fade-in", className)}>
      <CardHeader className="flex flex-row items-center gap-4 border-b p-4">
        <div className="bg-primary/10 p-2 rounded-lg">{fileTypeIcon}</div>
        <div>
          <CardTitle className="leading-tight text-xl break-all">{file.metadata.general.fileName}</CardTitle>
          <CardDescription>{file.metadata.general.fileSize} - {file.metadata.general.fileType}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col min-h-0 p-0">
        <Tabs defaultValue="preview" className="flex-grow flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-4 rounded-none border-b h-auto p-1 bg-transparent">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="editable">Editable</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="flex-grow mt-0 p-6 bg-muted/20">
             <FilePreview file={file} />
          </TabsContent>

          <TabsContent value="editable" className="flex-grow mt-0 min-h-0">
            <ScrollArea className="h-full p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><Type className="mr-2 h-4 w-4" />Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter file title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="author"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><User className="mr-2 h-4-w-4" />Author</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter author name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Textarea placeholder="Add a description..." className="min-h-[100px] resize-y" {...field} />
                            <AiDescriptionButton form={form} currentFile={file} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><Tag className="mr-2 h-4 w-4" />Tags</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., travel, summer, beach" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex flex-wrap gap-4 items-center">
                    <Button type="submit">
                      <Save className="mr-2 h-4 w-4" /> Save Changes
                    </Button>
                    <Separator orientation="vertical" className="h-6" />
                    <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => onSanitize(file.id, ['location'])}><MapPinOff className="mr-2 h-4 w-4" />Remove Location</Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => onSanitize(file.id, ['camera'])}><CameraOff className="mr-2 h-4 w-4"/>Remove Camera Info</Button>
                        <Button type="button" variant="destructive" size="sm" onClick={() => onSanitize(file.id, ['author', 'title'])}><ShieldOff className="mr-2 h-4 w-4"/>Sanitize All</Button>
                    </div>
                  </div>
                </form>
              </Form>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="general" className="mt-0">
            <ScrollArea className="h-[calc(100vh-22rem)] p-6">
              <MetadataList data={file.metadata.general} />
            </ScrollArea>
          </TabsContent>
          <TabsContent value="technical" className="mt-0">
            <ScrollArea className="h-[calc(100vh-22rem)] p-6">
              <MetadataList data={file.metadata.technical} />
             </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
