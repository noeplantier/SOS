// components/Dashboard/Dashboard.tsx
import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import AgentBlock from './AgentBlock';
import * as S from '../styles/Dashboard.styles';

const Dashboard: React.FC = () => {
  const [agents] = useState([
    { id: '1', name: 'Agent 1' },
    { id: '2', name: 'Agent 2' },
  ]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'AGENT_BLOCK',
    drop: (item: { id: string }) => {
      // Logique pour gérer le dépôt d'un bloc d'agent
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (containerRef.current) {
      drop(containerRef.current);
    }
  }, [drop]);

  return (
    <S.DashboardContainer ref={containerRef} isOver={isOver}>
      {agents.map((agent) => (
        <AgentBlock key={agent.id} id={agent.id} name={agent.name} />
      ))}
    </S.DashboardContainer>
  );
};

export default Dashboard;
