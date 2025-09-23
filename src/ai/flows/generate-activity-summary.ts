'use server';

/**
 * @fileOverview This file defines a Genkit flow to generate a short summary of activities within a chapter.
 *
 * - generateActivitySummary - A function that generates a summary of chapter activities.
 * - GenerateActivitySummaryInput - The input type for the generateActivitySummary function.
 * - GenerateActivitySummaryOutput - The return type for the generateActivitySummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateActivitySummaryInputSchema = z.object({
  activities: z
    .string()
    .describe("A list of activities completed within a chapter.  Include activity types and notes."),
});
export type GenerateActivitySummaryInput = z.infer<typeof GenerateActivitySummaryInputSchema>;

const GenerateActivitySummaryOutputSchema = z.object({
  summary: z.string().describe('A short summary of the chapter activities.'),
  progress: z.string().describe('A short, one-sentence summary of what you have generated.'),
});
export type GenerateActivitySummaryOutput = z.infer<typeof GenerateActivitySummaryOutputSchema>;

export async function generateActivitySummary(input: GenerateActivitySummaryInput): Promise<GenerateActivitySummaryOutput> {
  return generateActivitySummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateActivitySummaryPrompt',
  input: {schema: GenerateActivitySummaryInputSchema},
  output: {schema: GenerateActivitySummaryOutputSchema},
  prompt: `You are a helpful study assistant. Please summarize the following activities into a concise summary.

Activities: {{{activities}}}`,
});

const generateActivitySummaryFlow = ai.defineFlow(
  {
    name: 'generateActivitySummaryFlow',
    inputSchema: GenerateActivitySummaryInputSchema,
    outputSchema: GenerateActivitySummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      ...output!,
      progress: 'Generated a short summary of the chapter activities.',
    };
  }
);
