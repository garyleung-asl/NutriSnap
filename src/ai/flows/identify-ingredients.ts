'use server';
/**
 * @fileOverview An ingredient identification AI agent.
 *
 * - identifyIngredients - A function that handles the ingredient identification process.
 * - IdentifyIngredientsInput - The input type for the identifyIngredients function.
 * - IdentifyIngredientsOutput - The return type for the identifyIngredients function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const IdentifyIngredientsInputSchema = z.object({
  photoUrl: z.string().describe('The URL of the food photo.'),
});
export type IdentifyIngredientsInput = z.infer<typeof IdentifyIngredientsInputSchema>;

const IdentifyIngredientsOutputSchema = z.object({
  ingredients: z.array(
    z.object({
      name: z.string().describe('The name of the ingredient.'),
      confidence: z.number().describe('The confidence level of the identification (0-1).'),
    })
  ).describe('A list of identified ingredients and their confidence levels.'),
});
export type IdentifyIngredientsOutput = z.infer<typeof IdentifyIngredientsOutputSchema>;

export async function identifyIngredients(input: IdentifyIngredientsInput): Promise<IdentifyIngredientsOutput> {
  return identifyIngredientsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyIngredientsPrompt',
  input: {
    schema: z.object({
      photoUrl: z.string().describe('The URL of the food photo.'),
    }),
  },
  output: {
    schema: z.object({
      ingredients: z.array(
        z.object({
          name: z.string().describe('The name of the ingredient.'),
          confidence: z.number().describe('The confidence level of the identification (0-1).'),
        })
      ).describe('A list of identified ingredients and their confidence levels.'),
    }),
  },
  prompt: `You are an expert food identifier.  Given a picture of food, you will identify the ingredients in the food.

Analyze the following food photo and identify the ingredients:

Photo: {{media url=photoUrl}}

List the ingredients you identify, along with a confidence level (0-1) for each ingredient.
`,
});

const identifyIngredientsFlow = ai.defineFlow<
  typeof IdentifyIngredientsInputSchema,
  typeof IdentifyIngredientsOutputSchema
>({
  name: 'identifyIngredientsFlow',
  inputSchema: IdentifyIngredientsInputSchema,
  outputSchema: IdentifyIngredientsOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
