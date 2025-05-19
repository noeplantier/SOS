import React from 'react';
import { useDrag } from 'react-dnd';
import * as S from '../styles/AgentBlock.styles';

interface AgentBlockProps {
  id: string;
  name: string;
}

const AgentBlock: React.FC<AgentBlockProps> = ({ id, name }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'AGENT_BLOCK',
    item: { id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <S.AgentBlockContainer ref={drag} isDragging={isDragging}>
      {name}
    </S.AgentBlockContainer>
  );
};

export default AgentBlock;
