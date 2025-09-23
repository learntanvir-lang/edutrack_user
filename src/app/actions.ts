"use server";

import {
  generateActivitySummary as generateActivitySummaryFlow,
  GenerateActivitySummaryInput,
  GenerateActivitySummaryOutput,
} from "@/ai/flows/generate-activity-summary";

export async function generateActivitySummary(
  input: GenerateActivitySummaryInput
): Promise<GenerateActivitySummaryOutput> {
  return await generateActivitySummaryFlow(input);
}
