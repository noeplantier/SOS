// pages/emergency.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import styled from 'styled-components';

// Styles pour les blocs et le tableau de bord
const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: #f0f2f5;
  min-height: 100vh;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #1a1a1a;
  color: white;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 24px;
`;

const BlockContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
`;

const Block = styled.div`
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  cursor: move;
  width: 200px;
`;

const BlockContent = styled.div`
  margin-top: 10px;
`;

const EmergencyPage: React.FC = () => {
  const router = useRouter();
  const [blocks, setBlocks] = useState([
    { id: 1, content: 'Trigger: Nuclear Alert' },
    { id: 2, content: 'Action: Notify Team' },
    { id: 3, content: 'Action: Evacuate Area' },
  ]);

  const moveBlock = (dragIndex: number, hoverIndex: number) => {
    const draggedBlock = blocks[dragIndex];
    const updatedBlocks = [...blocks];
    updatedBlocks.splice(dragIndex, 1);
    updatedBlocks.splice(hoverIndex, 0, draggedBlock);
    setBlocks(updatedBlocks);
  };

  const BlockComponent = ({ id, content, index }: { id: number; content: string; index: number }) => {
    const [{ isDragging }, drag] = useDrag({
      type: 'BLOCK',
      item: { id, index },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    });

    const [, drop] = useDrop({
      accept: 'BLOCK',
      hover: (draggedItem: { index: number }) => {
        if (draggedItem.index !== index) {
          moveBlock(draggedItem.index, index);
          draggedItem.index = index;
        }
      },
    });

    const ref = React.useRef<HTMLDivElement>(null);
    drag(drop(ref));

    return (
      <Block ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
        <h3>Block {id}</h3>
        <BlockContent>{content}</BlockContent>
      </Block>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <DashboardContainer>
        <Header>
          <Title>Emergency Workflow Dashboard</Title>
        </Header>
        <BlockContainer>
          {blocks.map((block, index) => (
            <BlockComponent key={block.id} id={block.id} content={block.content} index={index} />
          ))}
        </BlockContainer>
      </DashboardContainer>
    </DndProvider>
  );
};

export default EmergencyPage;
