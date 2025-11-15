
import React, { useState, useMemo, useRef } from 'react';
import { ShoppingListItem, PantryItem, Unit, SortOption } from '../types';
import { CATEGORIES } from '../constants';
import Icon from './Icon';
import DraggableListItem from './DraggableListItem';

interface ShoppingListProps {
  items: ShoppingListItem[];
  setItems: React.Dispatch<React.SetStateAction<ShoppingListItem[]>>;
  setPantryItems: React.Dispatch<React.SetStateAction<PantryItem[]>>;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ items, setItems, setPantryItems }) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState(CATEGORIES[0]);
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.Default);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const addItem = () => {
    if (!newItemName.trim()) return;
    const newItem: ShoppingListItem = {
      id: crypto.randomUUID(),
      name: newItemName.trim(),
      category: newItemCategory,
    };
    setItems(prev => [...prev, newItem]);
    setNewItemName('');
  };
  
  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };
  
  const markAsPurchased = (item: ShoppingListItem) => {
    setPantryItems(prev => [...prev, {
      id: crypto.randomUUID(),
      name: item.name,
      category: item.category,
      quantity: 1,
      unit: Unit.Pcs
    }]);
    deleteItem(item.id);
  }

  const sortedItems = useMemo(() => {
    const sorted = [...items];
    if (sortOption === SortOption.Name) {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === SortOption.Category) {
      sorted.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
    }
    return sorted;
  }, [items, sortOption]);

  const handleDragSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const itemsCopy = [...items];
    const draggedItemContent = itemsCopy.splice(dragItem.current, 1)[0];
    itemsCopy.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setItems(itemsCopy);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md flex flex-col h-full">
      <h2 className="text-xl font-bold mb-4 text-gray-700">Shopping List</h2>
      
      {/* Add Item Form */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <input type="text" placeholder="Item name" value={newItemName} onChange={e => setNewItemName(e.target.value)} className="col-span-2 p-2 border rounded"/>
        <select value={newItemCategory} onChange={e => setNewItemCategory(e.target.value)} className="p-2 border rounded col-span-2">
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={addItem} className="col-span-2 bg-secondary text-white p-2 rounded hover:bg-green-600 transition">Add Item</button>
      </div>

      <div className="flex justify-end mb-2">
        <select value={sortOption} onChange={(e) => setSortOption(e.target.value as SortOption)} className="text-sm p-1 border rounded">
          <option value={SortOption.Default}>Sort: Default</option>
          <option value={SortOption.Name}>Sort: Name</option>
          <option value={SortOption.Category}>Sort: Category</option>
        </select>
      </div>

      {/* Item List */}
      <div className="flex-grow overflow-y-auto space-y-2 pr-2 -mr-2">
        {items.length > 0 ? (
          sortedItems.map((item, index) => (
             <DraggableListItem 
              key={item.id} 
              index={index}
              isDragging={sortOption === SortOption.Default && dragItem.current === index}
              onDragStart={(i) => sortOption === SortOption.Default && (dragItem.current = i)}
              onDragEnter={(i) => sortOption === SortOption.Default && (dragOverItem.current = i)}
              onDragEnd={handleDragSort}
            >
              <div className="bg-gray-50 p-2 rounded-md flex justify-between items-center">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full inline-block">{item.category}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => markAsPurchased(item)} className="p-1 text-gray-500 hover:text-green-500"><Icon name="check" className="w-5 h-5"/></button>
                  <button onClick={() => deleteItem(item.id)} className="p-1 text-gray-500 hover:text-red-500"><Icon name="trash" className="w-5 h-5"/></button>
                </div>
              </div>
            </DraggableListItem>
          ))
        ) : (
          <p className="text-center text-gray-500 py-8">Your shopping list is empty.</p>
        )}
      </div>
    </div>
  );
};

export default ShoppingList;
