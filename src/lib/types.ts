export type FileType = 'image/jpeg' | 'image/png' | 'application/pdf' | 'unknown';

export type EditableMetadata = {
  title: string;
  author: string;
  description: string;
  tags: string; // comma-separated
};

export type GeneralMetadata = {
  fileName: string;
  fileType: FileType;
  fileSize: string; // e.g., "1.2 MB"
};

export type TechnicalMetadata = {
  [key: string]: string | number;
};

export type FileMetadata = {
  general: GeneralMetadata;
  technical: TechnicalMetadata;
  editable: EditableMetadata;
};

export type FileWithMetadata = {
  id: string;
  file: File;
  metadata: FileMetadata;
};
