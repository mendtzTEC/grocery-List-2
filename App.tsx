
import React, { useState, useMemo } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { View, PantryItem, ShoppingListItem, Recipe } from './types';
import Header from './components/Header';
import PantryList from './components/PantryList';
import ShoppingList from './components/ShoppingList';
import RecipeGenius from './components/RecipeGenius';
import RecipeCard from './components/RecipeCard';
import ImportRecipeModal from './components/ImportRecipeModal';
import Icon from './components/Icon';

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.Lists);
  const [pantryItems, setPantryItems] = useLocalStorage<PantryItem[]>('pantryItems', []);
  const [shoppingListItems, setShoppingListItems] = useLocalStorage<ShoppingListItem[]>('shoppingListItems', []);
  const [savedRecipes, setSavedRecipes] = useLocalStorage<Recipe[]>('savedRecipes', []);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const ownedItemNames = useMemo(() => {
    const pantryNames = new Set(pantryItems.map(i => i.name.toLowerCase()));
    const shoppingListNames = new Set(shoppingListItems.map(i => i.name.toLowerCase()));
    return new Set([...pantryNames, ...shoppingListNames]);
  }, [pantryItems, shoppingListItems]);

  const addMissingIngredientsToShoppingList = (recipe: Recipe) => {
    const newItems: ShoppingListItem[] = [];
    recipe.ingredients.forEach(ingredient => {
      const normalizedName = ingredient.name.toLowerCase();
      if (!ownedItemNames.has(normalizedName)) {
        // A simple guess for category, can be improved.
        const category = ingredient.name.includes('milk') || ingredient.name.includes('cheese') ? 'Dairy' : 
                         ingredient.name.includes('chicken') || ingredient.name.includes('beef') ? 'Meat' :
                         ingredient.name.includes('lettuce') || ingredient.name.includes('apple') ? 'Produce' : 'Pantry';

        newItems.push({ id: crypto.randomUUID(), name: ingredient.name, category: category });
      }
    });
    setShoppingListItems(prev => [...prev, ...newItems]);
    alert(`${newItems.length} missing ingredients added to your shopping list!`);
  };

  const deleteRecipe = (recipeId: string) => {
    if(window.confirm("Are you sure you want to delete this recipe?")){
      setSavedRecipes(prev => prev.filter(r => r.id !== recipeId));
    }
  };


  return (
    <div className="min-h-screen font-sans text-gray-800">
      <Header currentView={view} setView={setView} onImportClick={() => setIsImportModalOpen(true)} />

      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        {view === View.Lists && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <PantryList items={pantryItems} setItems={setPantryItems} setShoppingListItems={setShoppingListItems} />
            <ShoppingList items={shoppingListItems} setItems={setShoppingListItems} setPantryItems={setPantryItems} />
            <RecipeGenius pantryItems={pantryItems} onSaveRecipe={(recipe) => setSavedRecipes(prev => [...prev, recipe])} />
          </div>
        )}
        
        {view === View.Recipes && (
          <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-700">My Saved Recipes</h2>
            {savedRecipes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedRecipes.map(recipe => (
                  <RecipeCard 
                    key={recipe.id} 
                    recipe={recipe} 
                    onAddMissing={addMissingIngredientsToShoppingList}
                    onDelete={deleteRecipe}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md">
                <Icon name="book-open" className="w-16 h-16 mx-auto text-gray-400" />
                <h3 className="mt-4 text-xl font-semibold text-gray-600">No recipes saved yet!</h3>
                <p className="mt-2 text-gray-500">
                  Go to the 'Lists' view to generate a recipe with the Recipe Genius.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <ImportRecipeModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        setShoppingListItems={setShoppingListItems}
        ownedItemNames={ownedItemNames}
      />
    </div>
  );
};

export default App;
