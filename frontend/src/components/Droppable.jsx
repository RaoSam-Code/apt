import React from 'react';
import { useDroppable } from '@dnd-kit/core';

export default function Droppable(props) {
  const { isOver, setNodeRef } = useDroppable({
    id: props.id,
  });
  const style = {
    backgroundColor: isOver ? '#f0f0f0' : '#ffffff',
    border: '1px dashed #cccccc',
    padding: '20px',
    minHeight: '200px',
  };

  return (
    <div ref={setNodeRef} style={style}>
      {props.children}
    </div>
  );
}
