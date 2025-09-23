// SummarizeChapterContent.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow to summarize chapter content.
 *
 * - summarizeChapterContent - A function that accepts chapter content and returns a summary.
 * - SummarizeChapterContentInput - The input type for the summarizeChapterContent function.
 * - SummarizeChapterContentOutput - The return type for the summarizeChapterContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeChapterContentInputSchema = z.object({
  chapterContent: z
    .string()
    .describe('The full text content of a chapter to be summarized.'),
});
export type SummarizeChapterContentInput = z.infer<
  typeof SummarizeChapterContentInputSchema
>;

const SummarizeChapterContentOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the chapter content.'),
});
export type SummarizeChapterContentOutput = z.infer<
  typeof SummarizeChapterContentOutputSchema
>;

export async function summarizeChapterContent(
  input: SummarizeChapterContentInput
): Promise<SummarizeChapterContentOutput> {
  return summarizeChapterContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeChapterContentPrompt',
  input: {schema: SummarizeChapterContentInputSchema},
  output: {schema: SummarizeChapterContentOutputSchema},
  prompt: `You are an expert academic summarizer. Please provide a concise summary of the following chapter content:\n\nChapter Content: {{{chapterContent}}}\n\nSummary: `,
});

const summarizeChapterContentFlow = ai.defineFlow(
  {
    name: 'summarizeChapterContentFlow',
    inputSchema: SummarizeChapterContentInputSchema,
    outputSchema: SummarizeChapterContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      ...output,
    };
  }
);
