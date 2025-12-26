# **App Name**: MetaMorph

## Core Features:

- File Upload: Allow users to upload single or multiple files (JPG, PNG, PDF initially).
- Metadata Extraction: Automatically extract metadata from uploaded files, using a service that routes to the correct extractor internally. Display in a clear, structured JSON format.
- Metadata Editing: Enable users to edit allowed metadata fields (title, author, description, tags).
- Bulk Edit: Enable bulk editing of the same field applied to many files.
- Metadata Tooltip Hints: Uses a LLM tool that uses the content in the document to decide what is a good description to fill in when creating/editing Metadata descriptions. 
- File Storage: Temporarily store uploaded files on the server for processing and automatically clean them up after download.
- Export/Download: Allow users to download updated files or metadata as JSON/CSV.

## Style Guidelines:

- Primary color: A saturated sky blue (#4DB2FF), suggesting clear communication and efficient processing.
- Background color: A very light, desaturated sky blue (#F0F8FF). It provides a clean, non-distracting background for detailed metadata viewing and editing.
- Accent color: A contrasting vibrant yellow (#FFD700). It calls attention to editable fields and key CTAs like "Download."
- Body and headline font: 'Inter', a grotesque-style sans-serif, provides a modern, machined, objective, neutral look, suitable for both headlines and body text.
- Use clear, consistent icons for file types and actions, focusing on simplicity and recognizability.
- Implement a split-screen layout with a file list on the left and metadata details on the right. Use tabs to organize metadata into general, technical, and editable sections.
- Use subtle transitions and progress indicators during file upload, metadata extraction, and download processes.