'use server';

import { generateDescription as genkitGenerateDescription } from '@/ai/flows/metadata-tooltip-hints';

export async function generateDescriptionAction(
  fileName: string,
  fileType: string
): Promise<string> {
  try {
    const mockFileContent = `This is a file named ${fileName} of type ${fileType}. Based on this, please generate a good, concise description for a metadata field.`;
    const result = await genkitGenerateDescription({ fileContent: mockFileContent });
    return result.description;
  } catch (error) {
    console.error("AI description generation failed:", error);
    return "Failed to generate AI description.";
  }
}
