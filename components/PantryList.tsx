
import React, { useState, useMemo, useRef } from 'react';
import { PantryItem, ShoppingListItem, Unit, SortOption } from '../types';
import { CATEGORIES } from '../constants';
import Icon from './Icon';
import DraggableListItem from './DraggableListItem';

interface PantryListProps {
  items: PantryItem[];
  setItems: React.Dispatch<React.SetStateAction<PantryItem[]>>;
  setShoppingListItems: React.Dispatch<React.SetStateAction<ShoppingListItem[]>>;
}

const PantryList: React.FC<PantryListProps> = ({ items, setItems, setShoppingListItems }) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState(CATEGORIES[0]);
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState(Unit.Pcs);
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.Default);
  
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const addItem = () => {
    if (!newItemName.trim()) return;
    const newItem: PantryItem = {
      id: crypto.randomUUID(),
      name: newItemName.trim(),
      category: newItemCategory,
      quantity: newItemQty,
      unit: newItemUnit,
    };
    setItems(prev => [...prev, newItem]);
    setNewItemName('');
    setNewItemQty(1);
  };

  const updateItem = (id: string, updates: Partial<PantryItem>) => {
    setItems(prev => prev.map(item => (item.id === id ? { ...item, ...updates } : item)));
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };
  
  const moveToShoppingList = (item: PantryItem) => {
    setShoppingListItems(prev => [...prev, {id: crypto.randomUUID(), name: item.name, category: item.category}]);
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
      <h2 className="text-xl font-bold mb-4 text-gray-700">In House</h2>
      
      {/* Add Item Form */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <input type="text" placeholder="Item name" value={newItemName} onChange={e => setNewItemName(e.target.value)} className="col-span-2 p-2 border rounded"/>
        <select value={newItemCategory} onChange={e => setNewItemCategory(e.target.value)} className="p-2 border rounded">
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="flex">
          <input type="number" placeholder="Qty" value={newItemQty} onChange={e => setNewItemQty(Number(e.target.value))} min="1" className="w-1/2 p-2 border rounded-l"/>
          <select value={newItemUnit} onChange={e => setNewItemUnit(e.target.value as Unit)} className="w-1/2 p-2 border-t border-b border-r rounded-r">
            <option value={Unit.Pcs}>pcs</option>
            <option value={Unit.G}>g</option>
          </select>
        </div>
        <button onClick={addItem} className="col-span-2 bg-primary text-white p-2 rounded hover:bg-indigo-700 transition">Add Item</button>
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
              <div className="bg-gray-50 p-2 rounded-md flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full inline-block">{item.category}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => moveToShoppingList(item)} className="p-1 text-gray-500 hover:text-primary"><Icon name="shopping-cart" className="w-5 h-5"/></button>
                    <button onClick={() => deleteItem(item.id)} className="p-1 text-gray-500 hover:text-red-500"><Icon name="trash" className="w-5 h-5"/></button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <button onClick={() => updateItem(item.id, { quantity: Math.max(0, item.quantity - 1) })} className="p-1 border rounded-full"><Icon name="minus" className="w-4 h-4"/></button>
                   <input type="number" value={item.quantity} onChange={e => updateItem(item.id, { quantity: Number(e.target.value) })} className="w-16 p-1 text-center border rounded"/>
                   <button onClick={() => updateItem(item.id, { quantity: item.quantity + 1 })} className="p-1 border rounded-full"><Icon name="plus" className="w-4 h-4"/></button>
                   <select value={item.unit} onChange={e => updateItem(item.id, { unit: e.target.value as Unit })} className="p-1 border rounded text-sm">
                    <option value={Unit.Pcs}>pcs</option>
                    <option value={Unit.G}>g</option>
                   </select>
                </div>
              </div>
            </DraggableListItem>
          ))
        ) : (
          <p className="text-center text-gray-500 py-8">Your pantry is empty.</p>
        )}
      </div>
    </div>
  );
};

export default PantryList;
