
import { GoogleGenAI, Type } from "@google/genai";
import { PantryItem } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateRecipe = async (
  ingredients: PantryItem[],
  strictMode: boolean,
  filters: Record<string, string>
) => {
  const ingredientsList = ingredients.map(i => `${i.name} (${i.quantity}${i.unit})`).join(', ');
  const strictness = strictMode
    ? 'You MUST only use the provided ingredients. You can assume common staples like oil, salt, pepper are available.'
    : 'You can suggest 1-2 additional common ingredients if it significantly improves the recipe.';

  const filterString = Object.entries(filters)
    .filter(([, value]) => value && value !== 'None')
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');

  const prompt = `
    You are a creative chef. Generate a single recipe based on the following criteria.
    Ingredients available: ${ingredientsList}.
    Ingredient usage rule: ${strictness}.
    Recipe preferences: ${filterString}.
    
    Provide the response in the exact JSON format specified. The instructions should be a single string in Markdown format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'The creative name of the recipe.' },
            description: { type: Type.STRING, description: 'A short, enticing description of the dish.' },
            ingredients: {
              type: Type.ARRAY,
              description: 'A list of all ingredients required for the recipe.',
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: 'The name of the ingredient.' },
                  amount: { type: Type.STRING, description: 'The quantity and unit, e.g., "2 cups" or "100g".' }
                },
                required: ['name', 'amount'],
              },
            },
            instructions: { type: Type.STRING, description: 'Step-by-step cooking instructions in Markdown format.' }
          },
          required: ['name', 'description', 'ingredients', 'instructions'],
        },
      },
    });

    const recipe = JSON.parse(response.text);
    return { ...recipe, id: crypto.randomUUID() };
  } catch (error) {
    console.error('Error generating recipe:', error);
    throw new Error('Failed to generate recipe from AI.');
  }
};


export const parseRecipeForShoppingList = async (recipeText: string, servings: number) => {
  const prompt = `
    Analyze the following recipe text. Adjust the ingredient quantities for ${servings} servings.
    For each ingredient, provide a normalized name (e.g., "all-purpose flour" becomes "flour"), the adjusted quantity as a string (e.g., "2 cups"), and assign it a category from this list: Produce, Dairy, Meat, Bakery, Pantry, Frozen, Beverages, Other.
    Return the result as a JSON array.

    Recipe Text:
    ---
    ${recipeText}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING, description: 'The normalized name of the ingredient.' },
                        amount: { type: Type.STRING, description: 'The adjusted quantity for the specified servings.' },
                        category: { type: Type.STRING, description: 'The grocery category for the ingredient.' },
                    },
                    required: ['name', 'amount', 'category'],
                },
            },
        },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('Error parsing recipe:', error);
    throw new Error('Failed to parse recipe with AI.');
  }
};
