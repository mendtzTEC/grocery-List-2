
import React, { useState } from 'react';
import { Recipe } from '../types';
import Icon from './Icon';

interface RecipeCardProps {
  recipe: Recipe;
  onAddMissing: (recipe: Recipe) => void;
  onDelete: (recipeId: string) => void;
}

const markdownToHtml = (text: string): string => {
  if(!text) return '';
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  const lines = html.split('\n');
  let result = '';
  let inList = false;
  
  lines.forEach(line => {
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) {
        result += '<ul class="list-disc list-inside space-y-1">';
        inList = true;
      }
      result += `<li>${line.substring(2)}</li>`;
    } else {
      if (inList) {
        result += '</ul>';
        inList = false;
      }
      result += line ? `<p>${line}</p>` : '';
    }
  });

  if (inList) {
    result += '</ul>';
  }
  
  return result.replace(/<p><\/p>/g, '<br/>');
};

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onAddMissing, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md flex flex-col overflow-hidden">
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-800">{recipe.name}</h3>
        <p className="text-sm text-gray-600 mt-1">{recipe.description}</p>
      </div>
      
      {isExpanded && (
        <div className="p-4 border-t space-y-4">
          <div>
            <h4 className="font-semibold text-gray-700">Ingredients:</h4>
            <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
              {recipe.ingredients.map(ing => (
                <li key={ing.name}>{ing.amount} {ing.name}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700">Instructions:</h4>
            <div className="prose prose-sm max-w-none mt-2 text-gray-600" dangerouslySetInnerHTML={{ __html: markdownToHtml(recipe.instructions) }} />
          </div>
        </div>
      )}

      <div className="mt-auto p-2 bg-gray-50 border-t flex items-center justify-between">
        <div className="flex gap-1">
          <button onClick={() => onAddMissing(recipe)} className="text-xs text-primary font-semibold hover:underline">Add Missing</button>
          <span className="text-gray-300">|</span>
          <button onClick={() => onDelete(recipe.id)} className="text-xs text-red-600 font-semibold hover:underline">Delete</button>
        </div>
        <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center text-sm text-gray-600 hover:text-primary">
          <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
          <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
};

export default RecipeCard;
