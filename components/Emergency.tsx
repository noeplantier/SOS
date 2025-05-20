import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import styled from 'styled-components';
import { 
  Bell, Mail, Phone, User, AlertTriangle, PlusCircle, Edit, Code, Save, 
  Trash, X, FilePlus, Settings, Database, Server, Cloud, FileCode,
  Monitor, Layers, Globe, Package, Copy, Link, Expand
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

// Styled components
const DashboardContainer = styled.div`
  display: flex;
  flex-direction: row;
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
  gap: 8px;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background-color 0.2s;
  &:hover {
    background-color: #7a0b11;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  margin: 5px 0;
  border-radius: 4px;
  border: 1px solid #ccc;
  background-color: #333;
  color: white;
  &:focus {
    outline: none;
    border-color: #9c0d17;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 8px;
  margin: 5px 0;
  border-radius: 4px;
  border: 1px solid #ccc;
  min-height: 100px;
  font-family: monospace;
  background-color: #333;
  color: white;
  &:focus {
    outline: none;
    border-color: #9c0d17;
  }
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
  display: flex;
  align-items: center;
  justify-content: center;
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
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  }
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
  margin-top: 5px;
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

const CodePreview = styled.div`
  background: #1e1e1e;
  padding: 8px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  max-height: 100px;
  overflow: auto;
  margin: 10px 0;
`;


// Technology icons mapping
const technologyIcons = {
  default: Settings,
  javascript: Code,
  python: FileCode,
  docker: Package,
  kubernetes: Cloud,
  database: Database,
  web: Globe,
  api: Server,
  ui: Monitor,
  microservice: Layers
};

// Helper function to detect technology from code content
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

// Coffee icon for Java
const Coffee = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M17 8h1a4 4 0 1 1 0 8h-1"></path>
    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"></path>
    <line x1="6" y1="2" x2="6" y2="4"></line>
    <line x1="10" y1="2" x2="10" y2="4"></line>
    <line x1="14" y1="2" x2="14" y2="4"></line>
  </svg>
);

// Custom node component for ReactFlow
const CustomNodeComponent = ({ data }) => {
  const TechIcon = data.techIcon && technologyIcons[data.techIcon] ? technologyIcons[data.techIcon] : technologyIcons['default'];
  
  return (
    <div style={{
      padding: '12px',
      borderRadius: '5px',
      width: 220,
      fontSize: '13px',
      color: 'white',
      textAlign: 'left',
      backgroundColor: '#9c0d17',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        marginBottom: '8px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        paddingBottom: '8px'
      }}>
        <TechIcon size={16} />
        <div style={{ fontWeight: 'bold', flex: 1 }}>{data.label}</div>
      </div>
      <div style={{ fontSize: '12px' }}>
        {data.content && (
          <div style={{ marginBottom: '5px' }}>
            {data.content.length > 50 ? `${data.content.substring(0, 50)}...` : data.content}
          </div>
        )}
        {data.code && <div><Code size={12} /> Code</div>}
        {data.json && <div><Database size={12} /> JSON</div>}
        {data.docker && <div><Package size={12} /> Docker</div>}
      </div>
    </div>
  );
};

// Initial ReactFlow nodes and edges
const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: 'Nuclear Alert', type: 'Nuclear Alert', techIcon: 'default' }, type: 'custom' },
  { id: '2', position: { x: 200, y: 100 }, data: { label: 'Notify Team', type: 'Notify Team', techIcon: 'default' }, type: 'custom' },
  { id: '3', position: { x: 400, y: 200 }, data: { label: 'Evacuate Area', type: 'Evacuate Area', techIcon: 'default' }, type: 'custom' },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
];

// Node types for ReactFlow
const nodeTypes = {
  custom: CustomNodeComponent,
};

let id = 0;
const getId = () => `node_${id++}`;

// DnDFlow component - handles the ReactFlow instance
const DnDFlow = ({ blocks, updateBlock }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editMode, setEditMode] = useState('basic');
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

  // Connect ReactFlow nodes and edges
  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);
  
  // Sync nodes with blocks data
  useEffect(() => {
    const newNodes = blocks.map((block) => {
      // Check if we have an existing node for this block
      const existingNode = nodes.find((n) => n.id === `block_${block.id}`);
      
      return {
        id: `block_${block.id}`,
        position: existingNode ? existingNode.position : {
          x: Math.random() * 300, 
          y: Math.random() * 300
        },
        data: {
          label: block.title,
          type: block.title,
          content: block.message || '',
          code: block.code || '',
          json: block.json || '',
          docker: block.docker || '',
          techIcon: block.techIcon || 'default'
        },
        type: 'custom'
      };
    });
    
    setNodes(newNodes);
  }, [blocks]);
  
  // Handle node click event
  const onNodeClick = useCallback((_, node) => {
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
  }, []);

  // Handle right-click on node
  const onNodeContextMenu = useCallback((event, node) => {
    // Prevent default browser context menu
    event.preventDefault();
    
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      nodeId: node.id
    });
  }, []);

  // Close context menu
  const closeContextMenu = useCallback(() => {
    setContextMenu({ visible: false, x: 0, y: 0, nodeId: null });
  }, []);

  // Edit node via context menu
  const editNode = useCallback(() => {
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
  }, [contextMenu.nodeId, nodes, closeContextMenu]);

  // Delete node via context menu
  const deleteNode = useCallback(() => {
    if (contextMenu.nodeId) {
      // Extract block ID from node ID
      const blockId = parseInt(contextMenu.nodeId.replace('block_', ''));
      
      // Remove the node
      setNodes(nodes => nodes.filter(node => node.id !== contextMenu.nodeId));
      
      // Remove any connected edges
      setEdges(edges => edges.filter(
        edge => edge.source !== contextMenu.nodeId && edge.target !== contextMenu.nodeId
      ));
    }
    closeContextMenu();
  }, [contextMenu.nodeId, setNodes, setEdges, closeContextMenu]);

  // Save node changes and sync to blocks
  const saveNodeChanges = useCallback(() => {
    const detectedTech = editMode === 'code' ? detectTechnology(nodeFormData.code) : 
                       editMode === 'json' ? 'database' : 
                       editMode === 'docker' ? 'docker' : 
                       nodeFormData.techIcon || 'default';
    
    // Update nodes
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
    
    // Extract block ID from node ID and update blocks state in parent
    const blockId = parseInt(selectedNode.id.replace('block_', ''));
    
    // Update the parent blocks state
    updateBlock(blockId, {
      title: nodeFormData.label,
      message: nodeFormData.content,
      code: nodeFormData.code,
      json: nodeFormData.json,
      docker: nodeFormData.docker,
      techIcon: nodeFormData.techIcon || detectedTech
    });
    
    setIsEditing(false);
    setSelectedNode(null);
  }, [selectedNode, nodeFormData, editMode, setNodes, updateBlock]);

  // Handle pane click to close context menu
  const onPaneClick = useCallback(() => {
    closeContextMenu();
  }, [closeContextMenu]);

  // Close context menu when clicking outside
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
  }, [contextMenu.visible, closeContextMenu]);

  // Handle drag over for drop target
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop of new elements
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = document.querySelector('.react-flow')?.getBoundingClientRect();
      if (!reactFlowBounds) return;
      
      const nodeData = event.dataTransfer.getData('application/reactflow');
      if (!nodeData) return;
      
      try {
        const { type, id } = JSON.parse(nodeData);
        
        const position = {
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        };
        
        // Find the corresponding block
        const blockIndex = blocks.findIndex(b => b.id === parseInt(id));
        if (blockIndex !== -1) {
          const block = blocks[blockIndex];
          
          // Add the node with block data
          const newNode = {
            id: `block_${block.id}`,
            position,
            data: {
              label: block.title,
              type: block.title,
              content: block.message || '',
              code: block.code || '',
              json: block.json || '',
              docker: block.docker || '',
              techIcon: block.techIcon || 'default'
            },
            type: 'custom'
          };
          
          setNodes(nds => [...nds, newNode]);
        }
      } catch (error) {
        console.error("Error processing dropped node:", error);
      }
    },
    [blocks, setNodes]
  );

  return (
    <div style={{ height: '80vh', width: '100%' }}>
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
        <Background gap={16} size={1} color="#444" />
        <Controls />
        <Panel position="top-right">
          <Button onClick={() => setNodes([])}>
            <Expand size={16} /> Reset View
          </Button>
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
              <X size={18} />
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

// Main Emergency component
const EmergencyPage: React.FC = () => {
  const router = useRouter();
  const [blocks, setBlocks] = useState([
    { id: 1, title: 'Nuclear Alert', icon: AlertTriangle, message: '', code: '', json: '', docker: '', techIcon: 'default' },
    { id: 2, title: 'Notify Team', icon: Bell, message: '', code: '', json: '', docker: '', techIcon: 'default' },
    { id: 3, title: 'Evacuate Area', icon: User, message: '', code: '', json: '', docker: '', techIcon: 'default' },
  ]);

  const [customButtons, setCustomButtons] = useState([
    { id: 1, title: 'Custom Action', icon: Settings, techIcon: 'default' }
  ]);
  
  const [isAddingButton, setIsAddingButton] = useState(false);
  const [newButtonName, setNewButtonName] = useState('');
  const [newButtonTech, setNewButtonTech] = useState('default');
  
  // View mode toggle (flow or dashboard)
  const [viewMode, setViewMode] = useState('flow');
  
  // Editing card state
  const [editingCard, setEditingCard] = useState(null);
  const [editMode, setEditMode] = useState('basic');
  const [cardFormData, setCardFormData] = useState({
    title: '',
    message: '',
    code: '',
    json: '',
    docker: '',
    techIcon: 'default'
  });
  
  // Function to add a new block
  const addBlock = useCallback((type: string, techIcon = 'default') => {
    const newId = blocks.length > 0 ? Math.max(...blocks.map(b => b.id)) + 1 : 1;
    
    const getIconForType = (type) => {
      switch(type) {
        case 'Nuclear Alert': return AlertTriangle;
        case 'Notify Team': return Bell;
        case 'Evacuate Area': return User;
        default: return technologyIcons[techIcon] || Settings;
      }
    };
    
    const newBlock = {
      id: newId,
      title: type,
      icon: getIconForType(type),
      message: '',
      code: '',
      json: '',
      docker: '',
      techIcon: techIcon
    };
    
    setBlocks(prevBlocks => [...prevBlocks, newBlock]);
  }, [blocks]);

  // Function to add a custom button
  const addCustomButton = useCallback(() => {
    if (newButtonName.trim()) {
      const newButton = {
        id: customButtons.length > 0 ? Math.max(...customButtons.map(b => b.id)) + 1 : 1,
        title: newButtonName,
        icon: technologyIcons[newButtonTech] || Settings,
        techIcon: newButtonTech || 'default'
      };
      
      setCustomButtons(prevButtons => [...prevButtons, newButton]);
      
      // Also add it to blocks for dashboard display
      addBlock(newButtonName, newButtonTech);
      
      // Reset form
      setNewButtonName('');
      setNewButtonTech('default');
      setIsAddingButton(false);
    }
  }, [newButtonName, newButtonTech, customButtons, addBlock]);

  // Function to update block by ID
  const updateBlock = useCallback((id, newData) => {
    setBlocks(prevBlocks => prevBlocks.map(block => {
      if (block.id === id) {
        // Update the icon based on techIcon if it changed
        const icon = newData.techIcon && newData.techIcon !== block.techIcon ? 
          (technologyIcons[newData.techIcon] || Settings) : block.icon;
        
        return {
          ...block,
          ...newData,
          icon,
          title: newData.title || block.title // Ensure title is updated
        };
      }
      return block;
    }));
    
    // Also update custom buttons if this was a custom one
    if (newData.title) {
      const customButton = customButtons.find(btn => btn.id === id);
      if (customButton) {
        setCustomButtons(prevButtons => prevButtons.map(btn => {
          if (btn.id === id) {
            return {
              ...btn,
              title: newData.title,
              techIcon: newData.techIcon || btn.techIcon,
              icon: technologyIcons[newData.techIcon] || btn.icon
            };
          }
          return btn;
        }));
      }
    }
  }, [customButtons]);

  // Function to delete a block
  const deleteBlock = useCallback((id) => {
    setBlocks(prevBlocks => prevBlocks.filter(block => block.id !== id));
    
    // Also remove from custom buttons if it was a custom one
    setCustomButtons(prevButtons => prevButtons.filter(btn => btn.id !== id));
  }, []);

  // Function to edit a card
  const editCard = useCallback((block) => {
    setEditingCard(block);
    setCardFormData({
      title: block.title,
      message: block.message || '',
      code: block.code || '',
      json: block.json || '',
      docker: block.docker || '',
      techIcon: block.techIcon || 'default'
    });
    setEditMode('basic');
  }, []);

  // Function to save card changes
  const saveCardChanges = useCallback(() => {
    updateBlock(editingCard.id, {
      title: cardFormData.title,
      message: cardFormData.message,
      code: cardFormData.code,
      json: cardFormData.json,
      docker: cardFormData.docker,
      techIcon: cardFormData.techIcon
    });
    
    setEditingCard(null);
  }, [editingCard, cardFormData, updateBlock]);

  // Handle drag start for sidebar buttons
  const onDragStart = useCallback((event, type, id) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ type, id }));
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <DashboardContainer>
        <Sidebar>
          <Title>Add New Card</Title>
          
          {/* Standard buttons */}
          <SidebarButton 
            onClick={() => addBlock('Nuclear Alert')} 
            draggable 
            onDragStart={(event) => onDragStart(event, 'Nuclear Alert', 1)}
          >
            <AlertTriangle size={16} /> Nuclear Alert
          </SidebarButton>
          
          <SidebarButton 
            onClick={() => addBlock('Notify Team')}
            draggable 
            onDragStart={(event) => onDragStart(event, 'Notify Team', 2)}
          >
            <Bell size={16} /> Notify Team
          </SidebarButton>
          
          <SidebarButton 
            onClick={() => addBlock('Evacuate Area')}
            draggable 
            onDragStart={(event) => onDragStart(event, 'Evacuate Area', 3)}
          >
            <User size={16} /> Evacuate Area
          </SidebarButton>
          
          {/* Custom buttons */}
          {customButtons.map(button => {
            const ButtonIcon = technologyIcons[button.techIcon] || button.icon || Settings;
            return (
              <SidebarButton 
                key={button.id} 
                onClick={() => addBlock(button.title, button.techIcon)}
                draggable 
                onDragStart={(event) => onDragStart(event, button.title, button.id)}
              >
                <ButtonIcon size={16} /> {button.title}
              </SidebarButton>
            );
          })}
          
          {/* Add new button interface */}
          {isAddingButton ? (
            <div style={{ marginTop: '15px', padding: '10px', background: '#333', borderRadius: '4px' }}>
              <label>Button Name</label>
              <Input 
                value={newButtonName}
                onChange={(e) => setNewButtonName(e.target.value)}
                placeholder="Enter button name"
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
              
              <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                <Button onClick={addCustomButton}>
                  <PlusCircle size={16} /> Add
                </Button>
                <Button onClick={() => setIsAddingButton(false)} style={{ backgroundColor: '#555' }}>
                  <X size={16} /> Cancel
                </Button>
              </div>
            </div>
          ) : (
            <SidebarButton 
              onClick={() => setIsAddingButton(true)}
              style={{ backgroundColor: '#444', marginTop: '15px' }}
            >
              <FilePlus size={16} /> Create New Card Type
            </SidebarButton>
          )}
          
          {/* View toggle */}
          <div style={{ marginTop: '30px' }}>
            <Title style={{ fontSize: '18px', marginBottom: '10px' }}>View Mode</Title>
            <ViewToggle>
             
              <ToggleButton active={viewMode === 'dashboard'} onClick={() => setViewMode('dashboard')}>
                Dashboard
              </ToggleButton>

               <ToggleButton active={viewMode === 'flow'} onClick={() => setViewMode('flow')}>
                Flow Chart
              </ToggleButton>
              
            </ViewToggle>
          </div>
        </Sidebar>
        
        {/* Main Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <Header>
            <Title>Emergency Workflow Dashboard</Title>
          </Header>
          
          {/* Content based on view mode */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {viewMode === 'flow' ? (
              <ReactFlowProvider>
                <DnDFlow blocks={blocks} updateBlock={updateBlock} />
              </ReactFlowProvider>
            ) : (
              <DashboardGrid>
                {blocks.map(block => {
                  const TechIcon = technologyIcons[block.techIcon] || block.icon || Settings;
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
                          <CodePreview>
                            <pre style={{ margin: 0 }}>
                              {block.code.length > 150 
                                ? `${block.code.substring(0, 150)}...` 
                                : block.code}
                            </pre>
                          </CodePreview>
                        )}
                        
                        {block.json && (
                          <CodePreview>
                            <pre style={{ margin: 0 }}>
                              JSON: {block.json.length > 100 
                                ? `${block.json.substring(0, 100)}...` 
                                : block.json}
                            </pre>
                          </CodePreview>
                        )}
                        
                        {block.docker && (
                          <CodePreview>
                            <pre style={{ margin: 0 }}>
                              Docker: {block.docker.length > 100 
                                ? `${block.docker.substring(0, 100)}...` 
                                : block.docker}
                            </pre>
                          </CodePreview>
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
                <X size={18} />
              </CloseButton>
              <Title>Edit Card</Title>
              
              <TabContainer>
                <Tab active={editMode === 'basic'} onClick={() => setEditMode('basic')}>Basic</Tab>
                <Tab active={editMode === 'code'} onClick={() => setEditMode('code')}>Code</Tab>
                <Tab active={editMode === 'json'} onClick={() => setEditMode('json')}>JSON</Tab>
                <Tab active={editMode === 'docker'} onClick={() => setEditMode('docker')}>Docker</Tab>
              </TabContainer>
              
              {editMode === 'basic' && (
                <>
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
                </>
              )}
              
              {editMode === 'code' && (
                <>
                  <label>JavaScript Code</label>
                  <Textarea 
                    value={cardFormData.code}
                    onChange={(e) => setCardFormData({...cardFormData, code: e.target.value})}
                    placeholder="// Enter JavaScript code here"
                  />
                </>
              )}
              
              {editMode === 'json' && (
                <>
                  <label>JSON Data</label>
                  <Textarea 
                    value={cardFormData.json}
                    onChange={(e) => setCardFormData({...cardFormData, json: e.target.value})}
                    placeholder="// Enter JSON data here"
                  />
                </>
              )}
              
              {editMode === 'docker' && (
                <>
                  <label>Docker Configuration</label>
                  <Textarea 
                    value={cardFormData.docker}
                    onChange={(e) => setCardFormData({...cardFormData, docker: e.target.value})}
                    placeholder="# Enter Dockerfile content or Docker commands"
                  />
                </>
              )}
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <Button onClick={saveCardChanges}>
                  <Save size={16} /> Save Changes
                </Button>
                <Button onClick={() => setEditingCard(null)} style={{ backgroundColor: '#555' }}>
                  <X size={16} /> Cancel
                </Button>
              </div>
            </ModalContent>
          </Modal>
        )}
      </DashboardContainer>
    </DndProvider>
  );
};

export default EmergencyPage;