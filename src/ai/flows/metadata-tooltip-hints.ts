'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating metadata descriptions using an LLM.
 *
 * The flow takes file content as input and returns a suggested description for the file's metadata.
 *
 * @module src/ai/flows/metadata-tooltip-hints
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * Input schema for the generateDescription flow.
 */
const GenerateDescriptionInputSchema = z.object({
  fileContent: z.string().describe('The content of the file as a string.'),
});

/**
 * Type definition for the input to the generateDescription flow.
 */
export type GenerateDescriptionInput = z.infer<
  typeof GenerateDescriptionInputSchema
>;

/**
 * Output schema for the generateDescription flow.
 */
const GenerateDescriptionOutputSchema = z.object({
  description: z
    .string()
    .describe(
      'A suggested description for the file based on its content.'
    ),
});

/**
 * Type definition for the output of the generateDescription flow.
 */
export type GenerateDescriptionOutput = z.infer<
  typeof GenerateDescriptionOutputSchema
>;

/**
 * Generates a description for a file based on its content using the generateDescriptionFlow.
 * @param input - The input containing the file content.
 * @returns A promise that resolves to the generated description.
 */
export async function generateDescription(
  input: GenerateDescriptionInput
): Promise<GenerateDescriptionOutput> {
  return generateDescriptionFlow(input);
}

const generateDescriptionPrompt = ai.definePrompt({
  name: 'generateDescriptionPrompt',
  input: {schema: GenerateDescriptionInputSchema},
  output: {schema: GenerateDescriptionOutputSchema},
  prompt: `You are an expert metadata generator. Based on the content of the file, generate a concise and informative description for the file's metadata.

File Content: {{{fileContent}}}`,
});

/**
 * Genkit flow for generating a metadata description from file content.
 */
const generateDescriptionFlow = ai.defineFlow(
  {
    name: 'generateDescriptionFlow',
    inputSchema: GenerateDescriptionInputSchema,
    outputSchema: GenerateDescriptionOutputSchema,
  },
  async input => {
    const {output} = await generateDescriptionPrompt(input);
    return output!;
  }
);
