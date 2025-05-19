// pages/emergency.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import styled from 'styled-components';
import { Bell, Mail, Phone, User, AlertTriangle } from 'lucide-react';

// Styles pour les blocs et le tableau de bord
const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  padding: 50px;
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

const BlockContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
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

  const moveBlock = (dragIndex: number, hoverIndex: number) => {
    const draggedBlock = blocks[dragIndex];
    const updatedBlocks = [...blocks];
    updatedBlocks.splice(dragIndex, 1);
    updatedBlocks.splice(hoverIndex, 0, draggedBlock);
    setBlocks(updatedBlocks);
  };

  const BlockComponent = ({ id, title, icon: Icon, contacts: blockContacts, index }: { id: number; title: string; icon: React.FC<{ className?: string }>; contacts: any[]; index: number }) => {
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

    const [message, setMessage] = useState('');
    const [selectedContacts, setSelectedContacts] = useState<string[]>(blockContacts);

    const handleContactChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const options = e.target.options;
      const selected: string[] = [];
      for (let i = 0; i < options.length; i++) {
        if (options[i].selected) {
          selected.push(options[i].value);
        }
      }
      setSelectedContacts(selected);
    };

    const handleSendAlert = () => {
      alert(`Sending alert to ${selectedContacts.join(', ')}: ${message}`);
    };

    const ref = React.useRef<HTMLDivElement>(null);
    drag(drop(ref));

    return (
      <Block ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
        <BlockHeader>
          <h3><Icon /> {title}</h3>
        </BlockHeader>
        <BlockContent>
          <ContactList multiple value={selectedContacts} onChange={handleContactChange}>
            {contacts.map(contact => (
              <option key={contact.id} value={contact.id}>{contact.name}</option>
            ))}
          </ContactList>
          <textarea
            placeholder="Type your emergency message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ width: '100%', marginTop: '10px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <Button onClick={handleSendAlert}>Send Alert</Button>
        </BlockContent>
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
            <BlockComponent
              key={block.id}
              id={block.id}
              title={block.title}
              icon={block.icon}
              contacts={block.contacts}
              index={index}
            />
          ))}
        </BlockContainer>
      </DashboardContainer>
    </DndProvider>
  );
};

export default EmergencyPage;
