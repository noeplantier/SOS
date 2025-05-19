// components/AgentBlock/AgentBlock.styles.ts
import styled from 'styled-components';

interface AgentBlockContainerProps {
  isDragging: boolean;
}

export const AgentBlockContainer = styled.div<AgentBlockContainerProps>`
  background-color: #121212;
  color: #00ff9d;
  padding: 10px;
  margin: 10px;
  border-radius: 5px;
  cursor: move;
  opacity: ${({ isDragging }) => (isDragging ? 0.5 : 1)};
`;
