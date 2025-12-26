"use client";

import { Edit, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { EditableMetadata } from '@/lib/types';

interface BulkEditPanelProps {
  selectedCount: number;
  onBulkUpdate: (field: keyof Omit<EditableMetadata, 'description' | 'tags'>, value: string) => void;
}

export function BulkEditPanel({ selectedCount, onBulkUpdate }: BulkEditPanelProps) {
  const [fieldToEdit, setFieldToEdit] = useState<keyof Omit<EditableMetadata, 'description' | 'tags'>>('author');
  const [value, setValue] = useState('');

  const handleApply = () => {
    if(value){
      onBulkUpdate(fieldToEdit, value);
      setValue('');
    }
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm animate-fade-in-down">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Edit className="h-5 w-5 text-primary" />
          Bulk Edit ({selectedCount} files selected)
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row items-end gap-4">
        <div className="flex-1 w-full space-y-2">
          <label className="text-sm font-medium">Field to Edit</label>
          <Select value={fieldToEdit} onValueChange={(v) => setFieldToEdit(v as any)}>
            <SelectTrigger className="bg-background/70">
              <SelectValue placeholder="Select a field" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="author">Author</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 w-full space-y-2">
          <label className="text-sm font-medium">New Value</label>
          <Input 
            placeholder={`Enter new ${fieldToEdit}`}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="bg-background/70"
          />
        </div>
        <Button onClick={handleApply} className="w-full sm:w-auto">
            <Send className="mr-2 h-4 w-4" /> Apply to All
        </Button>
      </CardContent>
    </Card>
  );
}
