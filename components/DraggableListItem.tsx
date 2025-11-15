
import React, { ReactNode } from 'react';

interface DraggableListItemProps {
  index: number;
  isDragging: boolean;
  onDragStart: (index: number) => void;
  onDragEnter: (index: number) => void;
  onDragEnd: () => void;
  children: ReactNode;
}

const DraggableListItem: React.FC<DraggableListItemProps> = ({
  index,
  isDragging,
  onDragStart,
  onDragEnter,
  onDragEnd,
  children,
}) => {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragEnter={() => onDragEnter(index)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      className={`transition-opacity ${isDragging ? 'opacity-30' : 'opacity-100'}`}
    >
      {children}
    </div>
  );
};

export default DraggableListItem;
