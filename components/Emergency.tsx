// pages/emergency.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import styled from 'styled-components';
import { Bell, Mail, Phone, User, AlertTriangle, PlusCircle } from 'lucide-react';
import ReactFlow, { Background, Controls, ReactFlowProvider, addEdge, useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';

// Styles pour les blocs et le tableau de bord
const DashboardContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #000000 0%, #9c0d17 100%);
  min-height: 100vh;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: rgb(41, 38, 38);
  color: white;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 24px;
`;

const Sidebar = styled.div`
  width: 250px;
  background-color: #2a2a2a;
  color: white;
  padding: 20px;
  border-radius: 8px;
  margin-right: 20px;
`;

const SidebarButton = styled.button`
  background-color: #9c0d17;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Block = styled.div`
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  cursor: move;
  width: 250px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const BlockHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const BlockContent = styled.div`
  margin-top: 10px;
`;

const ContactList = styled.select`
  width: 100%;
  padding: 8px;
  margin-top: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

const Button = styled.button`
  background-color: #9c0d17;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
  width: 100%;
`;

const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: 'Nuclear Alert' } },
  { id: '2', position: { x: 200, y: 100 }, data: { label: 'Notify Team' } },
  { id: '3', position: { x: 400, y: 200 }, data: { label: 'Evacuate Area' } },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
];

let id = 0;
const getId = () => `dndnode_${id++}`;

const DnDFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = (params) => setEdges((eds) => addEdge(params, eds));

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
    >
      <Background />
      <Controls />
    </ReactFlow>
  );
};

const EmergencyPage: React.FC = () => {
  const router = useRouter();
  const [blocks, setBlocks] = useState([
    { id: 1, title: 'Nuclear Alert', icon: AlertTriangle, contacts: [], message: '' },
    { id: 2, title: 'Notify Team', icon: Bell, contacts: [], message: '' },
    { id: 3, title: 'Evacuate Area', icon: User, contacts: [], message: '' },
  ]);

  const contacts = [
    { id: 'contact1', name: 'Team Leader' },
    { id: 'contact2', name: 'Security Officer' },
    { id: 'contact3', name: 'Medical Team' },
  ];

  const addBlock = (type: string) => {
    const newBlock = {
      id: blocks.length + 1,
      title: type,
      icon: type === 'Nuclear Alert' ? AlertTriangle : type === 'Notify Team' ? Bell : User,
      contacts: [],
      message: '',
    };
    setBlocks([...blocks, newBlock]);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <DashboardContainer>
        <Sidebar>
          <Title>Add New Card</Title>
          <SidebarButton onClick={() => addBlock('Nuclear Alert')}>
            <PlusCircle size={16} /> Nuclear Alert
          </SidebarButton>
          <SidebarButton onClick={() => addBlock('Notify Team')}>
            <PlusCircle size={16} /> Notify Team
          </SidebarButton>
          <SidebarButton onClick={() => addBlock('Evacuate Area')}>
            <PlusCircle size={16} /> Evacuate Area
          </SidebarButton>
        </Sidebar>
        <div style={{ flex: 1 }}>
          <Header>
            <Title>Emergency Workflow Dashboard</Title>
          </Header>
          <div style={{ height: '100vh' }}>
            <ReactFlowProvider>
              <DnDFlow />
            </ReactFlowProvider>
          </div>
        </div>
      </DashboardContainer>
    </DndProvider>
  );
};

export default EmergencyPage;
