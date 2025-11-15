
import React, { useState } from 'react';
import Modal from './Modal';
import { ShoppingListItem } from '../types';
import { parseRecipeForShoppingList } from '../services/geminiService';
import Icon from './Icon';

interface ParsedIngredient {
  name: string;
  amount: string;
  category: string;
}

interface ImportRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  setShoppingListItems: React.Dispatch<React.SetStateAction<ShoppingListItem[]>>;
  ownedItemNames: Set<string>;
}

const ImportRecipeModal: React.FC<ImportRecipeModalProps> = ({ isOpen, onClose, setShoppingListItems, ownedItemNames }) => {
  const [recipeText, setRecipeText] = useState('');
  const [servings, setServings] = useState(4);
  const [isLoading, setIsLoading] = useState(false);
  const [parsedIngredients, setParsedIngredients] = useState<ParsedIngredient[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!recipeText.trim()) {
      setError('Please paste a recipe.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setParsedIngredients([]);
    try {
      const ingredients = await parseRecipeForShoppingList(recipeText, servings);
      setParsedIngredients(ingredients);
      const initiallySelected = new Set<string>();
      ingredients.forEach((ing: ParsedIngredient) => {
        if (!ownedItemNames.has(ing.name.toLowerCase())) {
          initiallySelected.add(ing.name);
        }
      });
      setSelectedIngredients(initiallySelected);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleIngredient = (name: string) => {
    setSelectedIngredients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(name)) {
        newSet.delete(name);
      } else {
        newSet.add(name);
      }
      return newSet;
    });
  };

  const handleAddToList = () => {
    const itemsToAdd: ShoppingListItem[] = parsedIngredients
      .filter(ing => selectedIngredients.has(ing.name))
      .map(ing => ({
        id: crypto.randomUUID(),
        name: ing.name,
        category: ing.category,
      }));
    
    setShoppingListItems(prev => [...prev, ...itemsToAdd]);
    handleClose();
  };

  const handleClose = () => {
    setRecipeText('');
    setServings(4);
    setIsLoading(false);
    setParsedIngredients([]);
    setSelectedIngredients(new Set());
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import Recipe to Shopping List">
      <div className="space-y-4">
        <div>
          <label htmlFor="recipe-text" className="block text-sm font-medium text-gray-700">
            Paste Recipe Text
          </label>
          <textarea
            id="recipe-text"
            rows={8}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            value={recipeText}
            onChange={(e) => setRecipeText(e.target.value)}
            placeholder="Paste your recipe here..."
          />
        </div>
        <div>
          <label htmlFor="servings" className="block text-sm font-medium text-gray-700">
            Number of Servings
          </label>
          <input
            type="number"
            id="servings"
            min="1"
            className="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            value={servings}
            onChange={(e) => setServings(Number(e.target.value))}
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
        >
          {isLoading ? 'Generating...' : 'Generate Shopping List'}
        </button>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {parsedIngredients.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900">Review Items</h3>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-2 border-t pt-3">
              {parsedIngredients.map(ing => {
                const isOwned = ownedItemNames.has(ing.name.toLowerCase());
                return (
                  <div key={ing.name} className="flex items-center justify-between p-2 rounded-md bg-gray-50">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={`ing-${ing.name}`}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={selectedIngredients.has(ing.name)}
                        onChange={() => handleToggleIngredient(ing.name)}
                      />
                      <label htmlFor={`ing-${ing.name}`} className="flex flex-col">
                        <span className="font-medium text-gray-800">{ing.name}</span>
                        <span className="text-sm text-gray-500">{ing.amount}</span>
                      </label>
                    </div>
                    {isOwned && (
                      <span className="text-xs font-semibold text-green-800 bg-green-100 px-2 py-1 rounded-full">
                        Owned
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <button
              onClick={handleAddToList}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Add {selectedIngredients.size} selected items to Shopping List
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ImportRecipeModal;
