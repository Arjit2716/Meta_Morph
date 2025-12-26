import { FileType, FileMetadata, EditableMetadata, GeneralMetadata, TechnicalMetadata } from './types';

const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const getFileType = (file: File): FileType => {
  if (file.type === 'image/jpeg' || file.type === 'image/png') {
    return file.type;
  }
  if (file.type === 'application/pdf') {
    return 'application/pdf';
  }
  return 'unknown';
};

const createInitialEditableMetadata = (): EditableMetadata => ({
  title: '',
  author: '',
  description: '',
  tags: '',
});

export const generateMockMetadata = (file: File): FileMetadata => {
  const fileType = getFileType(file);

  const general: GeneralMetadata = {
    fileName: file.name,
    fileType: fileType,
    fileSize: formatBytes(file.size),
  };

  let technical: TechnicalMetadata = {};
  
  const createdDate = new Date(file.lastModified).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  switch (fileType) {
    case 'image/jpeg':
    case 'image/png':
      technical = {
        'Image Dimensions': '1920x1080',
        'Color Space': 'sRGB',
        'Resolution': '72 DPI',
        'Date Created': createdDate,
      };
      break;
    case 'application/pdf':
      technical = {
        'PDF Version': '1.7',
        'Page Count': 5,
        'Creator Tool': 'Adobe Acrobat',
        'Date Created': createdDate,
      };
      break;
    default:
      technical = {
        'Info': 'No technical metadata available for this file type.',
      };
      break;
  }

  const editable = createInitialEditableMetadata();

  return { general, technical, editable };
};
