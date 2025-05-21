// pages/emergency.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import styled from 'styled-components';
import { 
  Bell, Mail, Phone, User, AlertTriangle, PlusCircle, Edit, Code, Save, 
  Trash, X, FilePlus, Settings, Database, Server, Cloud, FileCode,
  Monitor, Layers, Globe, Package
} from 'lucide-react';
import ReactFlow, { 
  Background, 
  Controls, 
  ReactFlowProvider, 
  addEdge, 
  useNodesState, 
  useEdgesState,
  Panel
} from 'reactflow';
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
  max-height: calc(100vh - 40px);
  overflow-y: auto;
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
  &:hover {
    background-color: #7a0b11;
  }
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

const Input = styled.input`
  width: 100%;
  padding: 8px;
  margin: 5px 0;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 8px;
  margin: 5px 0;
  border-radius: 4px;
  border: 1px solid #ccc;
  min-height: 100px;
  font-family: monospace;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #2a2a2a;
  padding: 20px;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  color: white;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 15px;
  border-bottom: 1px solid #444;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 10px 15px;
  background-color: ${props => props.active ? '#9c0d17' : 'transparent'};
  border: none;
  color: white;
  cursor: pointer;
  margin-right: 5px;
  border-radius: 4px 4px 0 0;
`;

const NodeContextMenu = styled.div`
  position: absolute;
  background-color: #2a2a2a;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  padding: 5px;
  z-index: 10;
`;

const ContextMenuItem = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  &:hover {
    background-color: #444;
  }
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  padding: 20px;
`;

const Card = styled.div`
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  color: white;
  position: relative;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  border-bottom: 1px solid #444;
  padding-bottom: 10px;
`;

const CardTitle = styled.h3`
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CardContent = styled.div`
  font-size: 14px;
`;

const TechBadge = styled.div`
  display: inline-flex;
  align-items: center;
  background-color: #444;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 5px;
`;

const IconSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 5px;
  margin: 10px 0;
`;

const IconOption = styled.button<{ selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  background-color: ${props => props.selected ? '#9c0d17' : '#444'};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: ${props => props.selected ? '#7a0b11' : '#555'};
  }
`;

const ViewToggle = styled.div`
  display: flex;
  background-color: #444;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 15px;
`;

const ToggleButton = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 10px;
  background-color: ${props => props.active ? '#9c0d17' : 'transparent'};
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
  &:hover {
    background-color: ${props => props.active ? '#7a0b11' : '#555'};
  }
`;

const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: 'Nuclear Alert', type: 'Nuclear Alert', code: '', content: '' } },
  { id: '2', position: { x: 200, y: 100 }, data: { label: 'Notify Team', type: 'Notify Team', code: '', content: '' } },
  { id: '3', position: { x: 400, y: 200 }, data: { label: 'Evacuate Area', type: 'Evacuate Area', code: '', content: '' } },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
];

let id = 0;
const getId = () => `dndnode_${id++}`;


// Coffee icon was missing (to represent Java)
const Coffee = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M17 8h1a4 4 0 1 1 0 8h-1"></path>
    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"></path>
    <line x1="6" y1="2" x2="6" y2="4"></line>
    <line x1="10" y1="2" x2="10" y2="4"></line>
    <line x1="14" y1="2" x2="14" y2="4"></line>
  </svg>
);

// Map for technology icons
const technologyIcons = {
  default: Settings,
  javascript: Code,
  python: FileCode,
  java: Coffee,
  docker: Package,
  kubernetes: Cloud,
  database: Database,
  web: Globe,
  api: Server,
  ui: Monitor,
  microservice: Layers
};

// Helper function to detect technology from code
const detectTechnology = (code) => {
  if (!code) return 'default';
  
  const lowerCode = code.toLowerCase();
  if (lowerCode.includes('import react') || lowerCode.includes('const ') || lowerCode.includes('function(') || lowerCode.includes('=>')) {
    return 'javascript';
  }
  if (lowerCode.includes('import ') && lowerCode.includes('def ') || lowerCode.includes('print(')) {
    return 'python';
  }
  if (lowerCode.includes('public class') || lowerCode.includes('public static void')) {
    return 'java';
  }
  if (lowerCode.includes('from dockerfile') || lowerCode.includes('docker-compose')) {
    return 'docker';
  }
  if (lowerCode.includes('apiversion') || lowerCode.includes('kind:')) {
    return 'kubernetes';
  }
  if (lowerCode.includes('select ') || lowerCode.includes('insert into')) {
    return 'database';
  }
  
  return 'default';
};

const CustomNodeComponent = ({ data, id, isConnectable }) => {
  const techType = detectTechnology(data.code);
  const TechIcon = data.techIcon ? technologyIcons[data.techIcon] : technologyIcons['default'];

  return (
    <div style={{
      padding: '10px',
      borderRadius: '3px',
      width: 200,
      fontSize: '12px',
      color: 'white',
      textAlign: 'center',
      backgroundColor: '#9c0d17'
    }}>
      <div className="custom-node-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
        {data.techIcon && <TechIcon size={16} />}
        {!data.techIcon && (
          <>
            {data.type === 'Nuclear Alert' && <AlertTriangle size={16} />}
            {data.type === 'Notify Team' && <Bell size={16} />}
            {data.type === 'Evacuate Area' && <User size={16} />}
            {data.type === 'Custom' && <Settings size={16} />}
          </>
        )}
        <div className="custom-node-title">{data.label}</div>
      </div>
      <div className="custom-node-body">
        {data.content && <div>{data.content.substring(0, 50)}...</div>}
        {data.code && <div><Code size={12} /> Has Code</div>}
      </div>
    </div>
  );
};

const nodeTypes = {
  custom: CustomNodeComponent,
};

const DnDFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editMode, setEditMode] = useState('basic'); // 'basic', 'code', 'json', 'docker'
  const [nodeFormData, setNodeFormData] = useState({
    label: '',
    type: '',
    content: '',
    code: '',
    json: '',
    docker: '',
    techIcon: 'default'
  });
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, nodeId: null });

  const onConnect = (params) => setEdges((eds) => addEdge(params, eds));
  
  const onNodeClick = (event, node) => {
    setSelectedNode(node);
    setNodeFormData({
      label: node.data.label,
      type: node.data.type || '',
      content: node.data.content || '',
      code: node.data.code || '',
      json: node.data.json || '',
      docker: node.data.docker || '',
      techIcon: node.data.techIcon || 'default'
    });
  };

  const onNodeContextMenu = (event, node) => {
    // Prevent default context menu
    event.preventDefault();
    
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      nodeId: node.id
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, nodeId: null });
  };

  const editNode = () => {
    if (contextMenu.nodeId) {
      const node = nodes.find(n => n.id === contextMenu.nodeId);
      if (node) {
        setSelectedNode(node);
        setNodeFormData({
          label: node.data.label,
          type: node.data.type || '',
          content: node.data.content || '',
          code: node.data.code || '',
          json: node.data.json || '',
          docker: node.data.docker || '',
          techIcon: node.data.techIcon || 'default'
        });
        setIsEditing(true);
        setEditMode('basic');
      }
    }
    closeContextMenu();
  };

  const deleteNode = () => {
    if (contextMenu.nodeId) {
      setNodes(nodes => nodes.filter(node => node.id !== contextMenu.nodeId));
      setEdges(edges => edges.filter(
        edge => edge.source !== contextMenu.nodeId && edge.target !== contextMenu.nodeId
      ));
    }
    closeContextMenu();
  };

  const saveNodeChanges = () => {
    const detectedTech = editMode === 'code' ? detectTechnology(nodeFormData.code) : 
                         editMode === 'json' ? 'database' : 
                         editMode === 'docker' ? 'docker' : nodeFormData.techIcon || 'default';
    
    setNodes(nds => 
      nds.map(node => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              label: nodeFormData.label,
              type: nodeFormData.type,
              content: nodeFormData.content,
              code: nodeFormData.code,
              json: nodeFormData.json,
              docker: nodeFormData.docker,
              techIcon: nodeFormData.techIcon || detectedTech
            }
          };
        }
        return node;
      })
    );
    setIsEditing(false);
    setSelectedNode(null);
  };

  const onPaneClick = () => {
    closeContextMenu();
  };

  // When clicking outside the context menu, close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenu.visible) {
        closeContextMenu();
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [contextMenu]);

  const addNode = (type, position) => {
    const newNode = {
      id: getId(),
      position,
      data: { 
        label: `${type}`, 
        type: type,
        content: '',
        code: '',
        json: '',
        docker: '',
        techIcon: 'default'
      },
      type: 'custom'
    };
    setNodes(nds => [...nds, newNode]);
  };

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = document.querySelector('.react-flow').getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');
      
      // Check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };
      
      addNode(type, position);
    },
    [setNodes]
  );

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={onPaneClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <Panel position="top-left">
          <Button onClick={() => setSelectedNode(null)}>Dashboard</Button>
        </Panel>
      </ReactFlow>
      
      {contextMenu.visible && (
        <NodeContextMenu 
          style={{ 
            top: contextMenu.y, 
            left: contextMenu.x 
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <ContextMenuItem onClick={editNode}>
            <Edit size={14} /> Edit Node
          </ContextMenuItem>
          <ContextMenuItem onClick={deleteNode}>
            <Trash size={14} /> Delete Node
          </ContextMenuItem>
        </NodeContextMenu>
      )}
      
      {isEditing && selectedNode && (
        <Modal onClick={() => setIsEditing(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setIsEditing(false)}>
              <X />
            </CloseButton>
            <Title>Edit Node</Title>
            
            <TabContainer>
              <Tab active={editMode === 'basic'} onClick={() => setEditMode('basic')}>Basic</Tab>
              <Tab active={editMode === 'code'} onClick={() => setEditMode('code')}>Code</Tab>
              <Tab active={editMode === 'json'} onClick={() => setEditMode('json')}>JSON</Tab>
              <Tab active={editMode === 'docker'} onClick={() => setEditMode('docker')}>Docker</Tab>
            </TabContainer>
            
            {editMode === 'basic' && (
              <>
                <label>Label</label>
                <Input 
                  value={nodeFormData.label} 
                  onChange={(e) => setNodeFormData({...nodeFormData, label: e.target.value})} 
                />
                
                <label>Type</label>
                <Input 
                  value={nodeFormData.type} 
                  onChange={(e) => setNodeFormData({...nodeFormData, type: e.target.value})} 
                />
                
                <label>Technology Icon</label>
                <IconSelector>
                  {Object.entries(technologyIcons).map(([key, IconComponent]) => (
                    <IconOption 
                      key={key} 
                      selected={nodeFormData.techIcon === key}
                      onClick={() => setNodeFormData({...nodeFormData, techIcon: key})}
                    >
                      <IconComponent size={16} color="white" />
                    </IconOption>
                  ))}
                </IconSelector>
                
                <label>Content</label>
                <Textarea 
                  value={nodeFormData.content} 
                  onChange={(e) => setNodeFormData({...nodeFormData, content: e.target.value})} 
                />
              </>
            )}
            
            {editMode === 'code' && (
              <>
                <label>JavaScript Code</label>
                <Textarea 
                  value={nodeFormData.code} 
                  onChange={(e) => setNodeFormData({...nodeFormData, code: e.target.value})} 
                  placeholder="// Enter JavaScript code here"
                />
              </>
            )}
            
            {editMode === 'json' && (
              <>
                <label>JSON Data</label>
                <Textarea 
                  value={nodeFormData.json} 
                  onChange={(e) => setNodeFormData({...nodeFormData, json: e.target.value})} 
                  placeholder="// Enter JSON data here"
                />
              </>
            )}
            
            {editMode === 'docker' && (
              <>
                <label>Docker Configuration</label>
                <Textarea 
                  value={nodeFormData.docker} 
                  onChange={(e) => setNodeFormData({...nodeFormData, docker: e.target.value})} 
                  placeholder="# Enter Dockerfile content or Docker commands"
                />
              </>
            )}
            
            <Button onClick={saveNodeChanges}>
              <Save size={16} /> Save Changes
            </Button>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
};

const EmergencyPage: React.FC = () => {
  const router = useRouter();
  const [blocks, setBlocks] = useState([
    { id: 1, title: 'Nuclear Alert', icon: AlertTriangle, contacts: [], message: '', code: '', techIcon: 'default' },
    { id: 2, title: 'Notify Team', icon: Bell, contacts: [], message: '', code: '', techIcon: 'default' },
    { id: 3, title: 'Evacuate Area', icon: User, contacts: [], message: '', code: '', techIcon: 'default' },
  ]);

  const contacts = [
    { id: 'contact1', name: 'Team Leader' },
    { id: 'contact2', name: 'Security Officer' },
    { id: 'contact3', name: 'Medical Team' },
  ];

  // Support for custom buttons
  const [customButtons, setCustomButtons] = useState([
    { id: 1, title: 'Custom Action', icon: Settings, techIcon: 'default' }
  ]);
  
  const [isAddingButton, setIsAddingButton] = useState(false);
  const [newButtonName, setNewButtonName] = useState('');
  const [newButtonTech, setNewButtonTech] = useState('default');
  
  // State for dashboard view
  const [viewMode, setViewMode] = useState('flow'); // 'flow' or 'dashboard'
  
  // State for editing dashboard items
  const [editingCard, setEditingCard] = useState(null);
  const [cardFormData, setCardFormData] = useState({
    title: '',
    message: '',
    code: '',
    techIcon: 'default'
  });

  const addBlock = (type: string, techIcon = 'default') => {
    const newBlock = {
      id: blocks.length + 1,
      title: type,
      icon: type === 'Nuclear Alert' ? AlertTriangle : 
            type === 'Notify Team' ? Bell : 
            type === 'Evacuate Area' ? User : Settings,
      contacts: [],
      message: '',
      code: '',
      techIcon: techIcon
    };
    setBlocks([...blocks, newBlock]);
  };

  const addCustomButton = () => {
    if (newButtonName.trim()) {
      const newButton = {
        id: customButtons.length + 1,
        title: newButtonName,
        icon: Settings,
        techIcon: newButtonTech || 'default'
      };
      setCustomButtons([...customButtons, newButton]);
      
      // Also add it to blocks for dashboard display
      addBlock(newButtonName, newButtonTech);
      
      setNewButtonName('');
      setNewButtonTech('default');
      setIsAddingButton(false);
    }
  };

  const deleteBlock = (id) => {
    setBlocks(blocks.filter(block => block.id !== id));
  };

  const editCard = (block) => {
    setEditingCard(block);
    setCardFormData({
      title: block.title,
      message: block.message || '',
      code: block.code || '',
      techIcon: block.techIcon || 'default'
    });
  };

  const saveCardChanges = () => {
    setBlocks(blocks.map(block => {
      if (block.id === editingCard.id) {
        return {
          ...block,
          title: cardFormData.title,
          message: cardFormData.message,
          code: cardFormData.code,
          techIcon: cardFormData.techIcon
        };
      }
      return block;
    }));
    
    // Also update custom buttons if this was a custom one
    const customButton = customButtons.find(btn => btn.title === editingCard.title);
    if (customButton) {
      setCustomButtons(customButtons.map(btn => {
        if (btn.id === customButton.id) {
          return {
            ...btn,
            title: cardFormData.title,
            techIcon: cardFormData.techIcon
          };
        }
        return btn;
      }));
    }
    
    setEditingCard(null);
  };

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <DashboardContainer>
        <Sidebar>
          <Title>Add New Card</Title>
          <SidebarButton onClick={() => addBlock('Nuclear Alert')} 
                         draggable 
                         onDragStart={(event) => onDragStart(event, 'Nuclear Alert')}>
            <PlusCircle size={16} /> Nuclear Alert
          </SidebarButton>
          <SidebarButton onClick={() => addBlock('Notify Team')}
                         draggable 
                         onDragStart={(event) => onDragStart(event, 'Notify Team')}>
            <PlusCircle size={16} /> Notify Team
          </SidebarButton>
          <SidebarButton onClick={() => addBlock('Evacuate Area')}
                         draggable 
                         onDragStart={(event) => onDragStart(event, 'Evacuate Area')}>
            <PlusCircle size={16} /> Evacuate Area
          </SidebarButton>
          
          {/* Custom buttons */}
          {customButtons.map(button => (
            <SidebarButton 
              key={button.id} 
              onClick={() => addBlock(button.title, button.techIcon)}
              draggable 
              onDragStart={(event) => onDragStart(event, button.title)}>
              {technologyIcons[button.techIcon] ? React.createElement(technologyIcons[button.techIcon], { size: 16 }) : <Settings size={16} />} {button.title}
            </SidebarButton>
          ))}
          
          {/* Add new button interface */}
          {isAddingButton ? (
            <div style={{ marginTop: '10px' }}>
              <Input 
                value={newButtonName}
                onChange={(e) => setNewButtonName(e.target.value)}
                placeholder="Button name"
              />
              
              <label style={{ marginTop: '10px', display: 'block' }}>Technology</label>
              <IconSelector>
                {Object.entries(technologyIcons).map(([key, IconComponent]) => (
                  <IconOption 
                    key={key} 
                    selected={newButtonTech === key}
                    onClick={() => setNewButtonTech(key)}
                  >
                    <IconComponent size={16} color="white" />
                  </IconOption>
                ))}
              </IconSelector>
              
              <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                <Button onClick={addCustomButton}>Add</Button>
                <Button onClick={() => setIsAddingButton(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <SidebarButton 
              onClick={() => setIsAddingButton(true)}
              style={{ backgroundColor: '#444' }}>
              <FilePlus size={16} /> Create New Card Type
            </SidebarButton>
          )}
          
          {/* View toggle */}
          <div style={{ marginTop: '20px' }}>
            <Title style={{ fontSize: '18px' }}>View Mode</Title>
            <ViewToggle>
              <ToggleButton active={viewMode === 'flow'} onClick={() => setViewMode('flow')}>
                Flow Chart
              </ToggleButton>
              <ToggleButton active={viewMode === 'dashboard'} onClick={() => setViewMode('dashboard')}>
                Dashboard
              </ToggleButton>
            </ViewToggle>
          </div>
        </Sidebar>
        <div style={{ flex: 1 }}>
          <Header>
            <Title>Emergency Workflow Dashboard</Title>
          </Header>
          <div style={{ height: '100vh' }}>
            {viewMode === 'flow' ? (
              <ReactFlowProvider>
                <DnDFlow />
              </ReactFlowProvider>
            ) : (
              <DashboardGrid>
                {blocks.map(block => {
                  const TechIcon = technologyIcons[block.techIcon] || Settings;
                  return (
                    <Card key={block.id}>
                      <CardHeader>
                        <CardTitle>
                          <TechIcon size={18} />
                          {block.title}
                        </CardTitle>
                        <div>
                          <CloseButton onClick={() => editCard(block)} style={{ position: 'static' }}>
                            <Edit size={16} />
                          </CloseButton>
                          <CloseButton onClick={() => deleteBlock(block.id)} style={{ position: 'static' }}>
                            <Trash size={16} />
                          </CloseButton>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {block.message && (
                          <div style={{ marginBottom: '10px' }}>{block.message}</div>
                        )}
                        {block.code && (
                          <div style={{ 
                            background: '#1e1e1e', 
                            padding: '8px', 
                            borderRadius: '4px',
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            maxHeight: '100px',
                            overflow: 'auto'
                          }}>
                            <pre style={{ margin: 0 }}>{block.code.substring(0, 100)}{block.code.length > 100 ? '...' : ''}</pre>
                          </div>
                        )}
                        {block.techIcon && block.techIcon !== 'default' && (
                          <TechBadge>
                            <TechIcon size={14} style={{ marginRight: '5px' }} />
                            {block.techIcon}
                          </TechBadge>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </DashboardGrid>
            )}
          </div>
        </div>
        
        {/* Edit Card Modal */}
        {editingCard && (
          <Modal onClick={() => setEditingCard(null)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <CloseButton onClick={() => setEditingCard(null)}>
                <X />
              </CloseButton>
              <Title>Edit Card</Title>
              
              <label>Title</label>
              <Input 
                value={cardFormData.title}
                onChange={(e) => setCardFormData({...cardFormData, title: e.target.value})}
              />
              
              <label>Message/Description</label>
              <Textarea 
                value={cardFormData.message}
                onChange={(e) => setCardFormData({...cardFormData, message: e.target.value})}
                placeholder="Enter description or message..."
              />
              
              <label>Code</label>
              <Textarea 
                value={cardFormData.code}
                onChange={(e) => setCardFormData({...cardFormData, code: e.target.value})}
                placeholder="Enter code here..."
              />
              
              <label>Technology</label>
              <IconSelector>
                {Object.entries(technologyIcons).map(([key, IconComponent]) => (
                  <IconOption 
                    key={key} 
                    selected={cardFormData.techIcon === key}
                    onClick={() => setCardFormData({...cardFormData, techIcon: key})}
                  >
                    <IconComponent size={16} color="white" />
                  </IconOption>
                ))}
              </IconSelector>
              
              <Button onClick={saveCardChanges}>
                <Save size={16} /> Save Changes
              </Button>
            </ModalContent>
          </Modal>
        )}
      </DashboardContainer>
    </DndProvider>
  );
};

export default EmergencyPage;