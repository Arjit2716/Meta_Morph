"use client";

import { useState } from 'react';
import { Download, Files, Search, Trash2, UploadCloud, File as FileIcon, Moon, Sun } from 'lucide-react';
import { AppHeader } from '@/components/app-header';
import { FileUploader } from '@/components/file-uploader';
import { FileList } from '@/components/file-list';
import { MetadataViewer } from '@/components/metadata-viewer';
import type { FileWithMetadata, EditableMetadata } from '@/lib/types';
import { generateMockMetadata } from '@/lib/mock-data';
import { BulkEditPanel } from '@/components/bulk-edit-panel';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from 'next-themes';

export default function Home() {
  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const activeFile = files.find(f => f.id === activeFileId) || null;

  const handleFilesAdded = (addedFiles: File[]) => {
    const newFileEntries: FileWithMetadata[] = addedFiles.map(file => {
      const id = `${file.name}-${file.lastModified}-${Math.random()}`;
      return {
        id,
        file,
        metadata: generateMockMetadata(file),
      };
    });
    setFiles(prevFiles => [...prevFiles, ...newFileEntries]);
    if (newFileEntries.length > 0 && !activeFileId) {
      setActiveFileId(newFileEntries[0].id);
    }
    toast({
        title: `${newFileEntries.length} file(s) added.`,
        description: "Select a file to view and edit its metadata.",
    });
  };

  const handleFileSelect = (id: string) => {
    setActiveFileId(id);
  };
  
  const handleSelectionChange = (id: string, isChecked: boolean) => {
    setSelectedFileIds(prev => 
      isChecked ? [...prev, id] : prev.filter(fileId => fileId !== id)
    );
  };
  
  const handleDelete = (idToDelete: string) => {
    const fileName = files.find(f => f.id === idToDelete)?.metadata.general.fileName;
    setFiles(prev => prev.filter(f => f.id !== idToDelete));
    setSelectedFileIds(prev => prev.filter(id => id !== idToDelete));
    
    if (activeFileId === idToDelete) {
      const remainingFiles = files.filter(f => f.id !== idToDelete);
      setActiveFileId(remainingFiles.length > 0 ? remainingFiles[0].id : null);
    }

    toast({
        title: "File Deleted",
        description: `"${fileName}" has been removed.`,
    });
  };

  const handleBulkDelete = () => {
    const count = selectedFileIds.length;
    setFiles(prev => prev.filter(f => !selectedFileIds.includes(f.id)));
    if (activeFileId && selectedFileIds.includes(activeFileId)) {
        const remainingFiles = files.filter(f => !selectedFileIds.includes(f.id));
        setActiveFileId(remainingFiles.length > 0 ? remainingFiles[0].id : null);
    }
    setSelectedFileIds([]);
    toast({
        title: `Deleted ${count} files.`,
        variant: "destructive",
    });
  };


  const handleMetadataSave = (fileId: string, data: EditableMetadata) => {
    const fileName = files.find(f=>f.id === fileId)?.metadata.general.fileName;
    setFiles(prevFiles =>
      prevFiles.map(f =>
        f.id === fileId ? { ...f, metadata: { ...f.metadata, editable: data } } : f
      )
    );
    toast({
        title: "Metadata Saved",
        description: `Changes to ${fileName} have been saved.`,
    });
  };

  const handleBulkUpdate = (field: keyof Omit<EditableMetadata, 'description' | 'tags'>, value: string) => {
    setFiles(prevFiles =>
      prevFiles.map(f =>
        selectedFileIds.includes(f.id)
          ? { ...f, metadata: { ...f.metadata, editable: { ...f.metadata.editable, [field]: value } } }
          : f
      )
    );
    toast({
        title: "Bulk Edit Applied",
        description: `Updated '${field}' for ${selectedFileIds.length} files.`,
    });
  };

  const handleExportJson = () => {
    const filesToExport = files.filter(f => selectedFileIds.includes(f.id));
    if (filesToExport.length === 0) {
      toast({ variant: "destructive", title: "Export Error", description: "No files selected to export."});
      return;
    }
    const exportData = filesToExport.map(f => ({
      fileName: f.metadata.general.fileName,
      metadata: f.metadata
    }));
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'metadata_export.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "Export Successful", description: "Metadata exported as JSON."});
  };
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFileIds(filteredFiles.map(f => f.id));
    } else {
      setSelectedFileIds([]);
    }
  };

  const handleSanitize = (fileId: string, fields: (keyof EditableMetadata | 'location' | 'camera')[]) => {
    setFiles(prevFiles =>
      prevFiles.map(f => {
        if (f.id === fileId) {
          const newEditable = { ...f.metadata.editable };
          const newTechnical = { ...f.metadata.technical };
          
          if (fields.includes('author')) {
            newEditable.author = '';
          }
          if (fields.includes('title')) {
            newEditable.title = '';
          }

          // Example of removing technical data
          if (fields.includes('description')) { 
            delete newTechnical['camera model'];
            delete newTechnical['location'];
          }

          toast({
            title: 'Metadata Sanitized',
            description: `Selected fields have been cleared for ${f.metadata.general.fileName}.`,
          });

          return { ...f, metadata: { ...f.metadata, editable: newEditable, technical: newTechnical } };
        }
        return f;
      })
    );
  };

  const filteredFiles = files.filter(file =>
    file.metadata.general.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AppHeader>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </AppHeader>
      <main className="flex-grow grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4 sm:p-6 lg:p-8">
        <div className="md:col-span-1 lg:col-span-1 flex flex-col gap-6">
          <FileUploader onFilesAdded={handleFilesAdded} className="h-48" />
          <Card className="flex-grow flex flex-col bg-card/80 backdrop-blur-sm">
            <CardContent className="p-0 flex-grow flex flex-col">
              {files.length > 0 ? (
                <>
                  <div className="p-4 flex justify-between items-center border-b">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Files className="h-5 w-5 text-primary" /> Files ({filteredFiles.length})
                    </h2>
                    {selectedFileIds.length > 0 && (
                      <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                        <Trash2 className="h-4 w-4 mr-2" />Delete ({selectedFileIds.length})
                      </Button>
                    )}
                  </div>
                  <div className="p-4 border-b">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search files..."
                        className="pl-9 bg-background/70"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center border-b p-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="selectAll"
                        checked={filteredFiles.length > 0 && selectedFileIds.length === filteredFiles.length}
                        onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                        aria-label="Select all files"
                      />
                      <Label htmlFor="selectAll" className="text-sm font-medium cursor-pointer">
                        Select All
                      </Label>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleExportJson} disabled={selectedFileIds.length === 0}>
                      <Download className="h-4 w-4 mr-2" />Export JSON
                    </Button>
                  </div>
                  <div className="flex-grow min-h-0">
                    <FileList
                      files={filteredFiles}
                      activeFileId={activeFileId}
                      selectedFileIds={selectedFileIds}
                      onFileSelect={handleFileSelect}
                      onSelectionChange={handleSelectionChange}
                      onDelete={handleDelete}
                    />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 animate-fade-in">
                  <UploadCloud className="h-12 w-12 mb-4 text-primary" />
                  <h3 className="font-semibold text-lg">No files uploaded</h3>
                  <p className="text-sm">Upload files to begin managing metadata.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 lg:col-span-3 flex flex-col gap-6">
          {selectedFileIds.length > 1 && (
            <BulkEditPanel selectedCount={selectedFileIds.length} onBulkUpdate={handleBulkUpdate} />
          )}
          <div className="flex-grow">
            {activeFile ? (
              <MetadataViewer file={activeFile} onSave={handleMetadataSave} onSanitize={handleSanitize} className="h-full" />
            ) : (
              <Card className="h-full flex items-center justify-center border-2 border-dashed bg-card/80 backdrop-blur-sm animate-fade-in">
                <div className="text-center text-muted-foreground">
                  <FileIcon className="h-16 w-16 mx-auto mb-4 text-primary" />
                  <p className="text-lg font-medium">Select a file to view its metadata</p>
                  <p className="text-sm">Or upload new files to get started</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
