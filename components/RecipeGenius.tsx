
import React, { useState } from 'react';
import { PantryItem, Recipe } from '../types';
import { RECIPE_FILTERS } from '../constants';
import { generateRecipe } from '../services/geminiService';
import Icon from './Icon';

interface RecipeGeniusProps {
  pantryItems: PantryItem[];
  onSaveRecipe: (recipe: Recipe) => void;
}

const markdownToHtml = (text: string): string => {
  if(!text) return '';
  // Basic markdown conversion for lists and bolding
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  const lines = html.split('\n');
  let result = '';
  let inList = false;
  
  lines.forEach(line => {
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) {
        result += '<ul>';
        inList = true;
      }
      result += `<li>${line.substring(2)}</li>`;
    } else {
      if (inList) {
        result += '</ul>';
        inList = false;
      }
      result += line ? `<p>${line}</p>` : '<br/>';
    }
  });

  if (inList) {
    result += '</ul>';
  }
  
  return result;
};


const RecipeGenius: React.FC<RecipeGeniusProps> = ({ pantryItems, onSaveRecipe }) => {
  const [selectedPantry, setSelectedPantry] = useState<Set<string>>(new Set());
  const [strictMode, setStrictMode] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (selectedPantry.size === 0) {
        setError('Please select at least one ingredient.');
        return;
    }
    setIsLoading(true);
    setGeneratedRecipe(null);
    setError(null);
    try {
      const selectedItems = pantryItems.filter(item => selectedPantry.has(item.id));
      const recipe = await generateRecipe(selectedItems, strictMode, filters);
      setGeneratedRecipe(recipe);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePantryItem = (id: string) => {
    setSelectedPantry(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({...prev, [filterName]: value}));
  }
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md flex flex-col h-full">
      <h2 className="text-xl font-bold mb-4 text-gray-700">Recipe Genius</h2>
      <div className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Ingredients to use:</h3>
          <div className="max-h-32 overflow-y-auto space-y-1 border rounded p-2">
            {pantryItems.length > 0 ? pantryItems.map(item => (
              <label key={item.id} className="flex items-center gap-2">
                <input type="checkbox" checked={selectedPantry.has(item.id)} onChange={() => handleTogglePantryItem(item.id)} className="rounded text-primary focus:ring-primary"/>
                <span>{item.name}</span>
              </label>
            )) : <p className="text-sm text-gray-500">Add items to your pantry first.</p>}
          </div>
        </div>

        <div>
            <label className="flex items-center gap-2">
                <input type="checkbox" checked={strictMode} onChange={() => setStrictMode(!strictMode)} className="rounded text-primary focus:ring-primary"/>
                <span>Use only selected ingredients</span>
            </label>
        </div>

        <div>
            <h3 className="font-semibold mb-2">Filters:</h3>
            <div className="grid grid-cols-2 gap-2">
                {Object.entries(RECIPE_FILTERS).map(([key, options]) => (
                    <select key={key} onChange={(e) => handleFilterChange(key, e.target.value)} className="text-sm p-1 border rounded">
                        <option value="">{key}</option>
                        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                ))}
            </div>
        </div>

        <button onClick={handleGenerate} disabled={isLoading || selectedPantry.size === 0} className="w-full bg-primary text-white p-2 rounded hover:bg-indigo-700 transition disabled:bg-indigo-300">
          {isLoading ? 'Generating...' : 'Generate Recipe'}
        </button>
        
        {error && <p className="text-sm text-red-600">{error}</p>}
        
        {generatedRecipe && (
          <div className="border-t pt-4 mt-4 space-y-3 animate-fade-in">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-primary">{generatedRecipe.name}</h3>
                <p className="text-sm text-gray-600">{generatedRecipe.description}</p>
              </div>
              <button onClick={() => { onSaveRecipe(generatedRecipe); setGeneratedRecipe(null); }} className="bg-secondary text-white px-3 py-1 text-sm rounded hover:bg-green-600">Save</button>
            </div>
            <div>
              <h4 className="font-semibold">Ingredients:</h4>
              <ul className="list-disc list-inside text-sm">
                {generatedRecipe.ingredients.map(ing => <li key={ing.name}>{ing.amount} {ing.name}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Instructions:</h4>
              <div className="prose prose-sm" dangerouslySetInnerHTML={{ __html: markdownToHtml(generatedRecipe.instructions) }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeGenius;
