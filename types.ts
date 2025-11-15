
export enum View {
  Lists = 'LISTS',
  Recipes = 'RECIPES',
}

export enum Unit {
  Pcs = 'pcs',
  G = 'g',
}

export enum SortOption {
  Default = 'Default',
  Name = 'Name',
  Category = 'Category',
}

export interface Item {
  id: string;
  name: string;
  category: string;
}

export interface PantryItem extends Item {
  quantity: number;
  unit: Unit;
}

export interface ShoppingListItem extends Item {}

export interface RecipeIngredient {
  name: string;
  amount: string; // e.g., "2 cups" or "100g"
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: RecipeIngredient[];
  instructions: string; // Markdown format
}
