import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import styled from 'styled-components';
import { 
  Bell, Mail, Phone, User, AlertTriangle, PlusCircle, Edit, Code, Save, 
  Trash, X, FilePlus, Settings, Database, Server, Cloud, FileCode,
  Monitor, Layers, Globe, Package, CheckCircle, Link
} from 'lucide-react';
import ReactFlow, { 
  Background, 
  Controls, 
  ReactFlowProvider, 
  addEdge, 
  useNodesState, 
  useEdgesState,
  Panel,
  ReactFlowInstance,
  getBezierPath,
  ConnectionLineType,
  MarkerType
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
  margin-top: 15px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  transition: background-color 0.2s, transform 0.2s;
  &:hover {
    background-color: #7a0b11;
    transform: translateY(-2px);
  }
`;

const SidebarSection = styled.div`
  margin-bottom: 25px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 15px;
  
  &:last-child {
    border-bottom: none;
  }
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  margin-bottom: 15px;
  color: #f8f9fa;
  border-left: 3px solid #9c0d17;
  padding-left: 10px;
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
  &:disabled {
    background-color: #6a0a10;
    opacity: 0.7;
    cursor: not-allowed;
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
  overflow-x: auto;
  flex-wrap: wrap;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 10px 15px;
  background-color: ${props => props.active ? '#9c0d17' : 'transparent'};
  border: none;
  color: white;
  cursor: pointer;
  margin-right: 5px;
  border-radius: 4px 4px 0 0;
  white-space: nowrap;
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

const LanguageBadgeContainer = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 10px;
`;

const LanguageBadge = styled.div<{ color: string }>`
  font-size: 10px;
  padding: 3px 6px;
  border-radius: 4px;
  background-color: ${props => props.color};
`;

const ConnectionBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  margin-top: 10px;
  opacity: 0.7;
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

const ConnectionList = styled.div`
  background-color: #333;
  padding: 10px;
  border-radius: 4px;
  font-size: 14px;
  margin-top: 10px;
`;

const ConnectionItem = styled.div`
  padding: 5px 0;
  border-bottom: 1px solid #444;
  &:last-child {
    border-bottom: none;
  }
`;

const ConnectionTarget = styled.div`
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const ConnectionDescription = styled.div`
  font-size: 12px;
  opacity: 0.7;
  margin-left: 20px;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  background-color: #333;
  color: white;
  border: 1px solid #555;
  border-radius: 4px;
  margin-top: 10px;
`;

const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: 'Nuclear Alert', type: 'Nuclear Alert', content: '', connections: [] }, type: 'custom' },
  { id: '2', position: { x: 200, y: 100 }, data: { label: 'Notify Team', type: 'Notify Team', content: '', connections: [] }, type: 'custom' },
  { id: '3', position: { x: 400, y: 200 }, data: { label: 'Evacuate Area', type: 'Evacuate Area', content: '', connections: [] }, type: 'custom' },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true, label: 'Automatic alert', style: { stroke: '#9c0d17', strokeWidth: 2 } },
  { id: 'e2-3', source: '2', target: '3', animated: true, label: 'Evacuation order', style: { stroke: '#9c0d17', strokeWidth: 2 } },
];

let id = 0;
const getId = () => `dndnode_${id++}`;

// Map for technology icons
const technologyIcons = {
  default: Settings,
  javascript: Code,
  typescript: FileCode,
  python: FileCode,
  rust: Package,
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
  if (lowerCode.includes('interface ') || lowerCode.includes('type ') || 
      (lowerCode.includes('<') && lowerCode.includes('>') && lowerCode.includes(':'))) {
    return 'typescript';
  }
  if (lowerCode.includes('import react') || lowerCode.includes('const ') || 
      lowerCode.includes('function(') || lowerCode.includes('=>')) {
    return 'javascript';
  }
  if (lowerCode.includes('import ') && lowerCode.includes('def ') || lowerCode.includes('print(')) {
    return 'python';
  }
  if (lowerCode.includes('fn ') || lowerCode.includes('pub struct') || 
      lowerCode.includes('impl') || lowerCode.includes('mut')) {
    return 'rust';
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

// Définir les couleurs pour les badges de langage
const languageColors = {
  typescript: 'rgba(0, 122, 204, 0.3)',
  javascript: 'rgba(241, 191, 38, 0.3)',
  python: 'rgba(55, 118, 171, 0.3)',
  rust: 'rgba(183, 65, 14, 0.3)',
  docker: 'rgba(34, 134, 195, 0.3)',
  json: 'rgba(86, 182, 194, 0.3)'
};

// Composant de nœud personnalisé avec une grande icône
const CustomNodeComponent = ({ data, id, isConnectable }) => {
  const techType = data.techIcon || 'default';
  const TechIcon = technologyIcons[techType] || technologyIcons['default'];
  
  // Déterminer l'icône principale en fonction du type
  let MainIcon;
  if (data.type === 'Nuclear Alert') MainIcon = AlertTriangle;
  else if (data.type === 'Notify Team') MainIcon = Bell;
  else if (data.type === 'Evacuate Area') MainIcon = User;
  else MainIcon = TechIcon;

  // Vérifier quels langages sont utilisés
  const hasTypeScript = data.typescript && data.typescript.trim() !== '';
  const hasJavaScript = data.javascript && data.javascript.trim() !== '';
  const hasPython = data.python && data.python.trim() !== '';
  const hasRust = data.rust && data.rust.trim() !== '';
  const hasJson = data.json && data.json.trim() !== '';
  
  // Calculer le nombre de connexions
  const connectionCount = data.connections ? data.connections.length : 0;

  return (
    <div style={{
      padding: '15px',
      borderRadius: '8px',
      width: 250,
      fontSize: '14px',
      color: 'white',
      textAlign: 'center',
      backgroundColor: '#9c0d17',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px'
    }}>
      {/* Grande icône en haut */}
      <div style={{ 
        width: '60px', 
        height: '60px', 
        borderRadius: '50%', 
        backgroundColor: 'rgba(255,255,255,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <MainIcon size={36} color="white" />
      </div>
      
      {/* Titre avec technologie */}
      <div style={{ 
        fontWeight: 'bold',
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '5px' 
      }}>
        {data.label}
        {techType !== 'default' && (
          <TechIcon size={14} style={{ opacity: 0.7 }} />
        )}
      </div>
      
      {/* Contenu si disponible */}
      {data.content && (
        <div style={{ 
          fontSize: '12px',
          backgroundColor: 'rgba(0,0,0,0.2)',
          padding: '8px',
          borderRadius: '4px',
          width: '100%',
          textAlign: 'left',
          maxHeight: '80px',
          overflow: 'auto'
        }}>
          {data.content.length > 100 ? `${data.content.substring(0, 100)}...` : data.content}
        </div>
      )}
      
      {/* Indicateur des langages utilisés */}
      <div style={{ 
        display: 'flex', 
        gap: '6px', 
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {hasTypeScript && (
          <div style={{ 
            fontSize: '10px', 
            padding: '3px 6px', 
            borderRadius: '4px', 
            backgroundColor: languageColors.typescript
          }}>
            TS
          </div>
        )}
        {hasJavaScript && (
          <div style={{ 
            fontSize: '10px', 
            padding: '3px 6px', 
            borderRadius: '4px', 
            backgroundColor: languageColors.javascript
          }}>
            JS
          </div>
        )}
        {hasPython && (
          <div style={{ 
            fontSize: '10px', 
            padding: '3px 6px', 
            borderRadius: '4px', 
            backgroundColor: languageColors.python
          }}>
            PY
          </div>
        )}
        {hasRust && (
          <div style={{ 
            fontSize: '10px', 
            padding: '3px 6px', 
            borderRadius: '4px', 
            backgroundColor: languageColors.rust
          }}>
            RS
          </div>
        )}
        {hasJson && (
          <div style={{ 
            fontSize: '10px', 
            padding: '3px 6px', 
            borderRadius: '4px', 
            backgroundColor: languageColors.json
          }}>
            JSON
          </div>
        )}
      </div>
      
      {/* Indicateur de connexions */}
      {connectionCount > 0 && (
        <div style={{ 
          fontSize: '11px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          opacity: 0.7
        }}>
          <Link size={12} /> {connectionCount} connexion{connectionCount > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

// Composant pour les bords de connexion personnalisés
const CustomEdge = ({ id, source, target, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, data, label }) => {
  const edgePath = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <path
        id={id}
        style={{ ...style }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={MarkerType.ArrowClosed}
      />
      {label && (
        <text>
          <textPath
            href={`#${id}`}
            style={{ fontSize: 12, fill: 'white', fontWeight: 'bold' }}
            startOffset="50%"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {label}
          </textPath>
        </text>
      )}
    </>
  );
};

const nodeTypes = {
  custom: CustomNodeComponent,
};

const edgeTypes = {
  custom: CustomEdge,
};

// Composant DnDFlow amélioré
const DnDFlow = ({ setReactFlowInstance, provideNodesSetter }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editMode, setEditMode] = useState('basic'); // 'basic', 'typescript', 'javascript', 'python', 'rust'
  const [nodeFormData, setNodeFormData] = useState({
    label: '',
    type: '',
    content: '',
    typescript: '',
    javascript: '',
    python: '',
    rust: '',
    json: '',
    docker: '',
    techIcon: 'default',
    connections: []
  });
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, nodeId: null });
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [availableTargets, setAvailableTargets] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState('');
  const [connectionDescription, setConnectionDescription] = useState('');

  // Fournir setNodes au parent via useEffect
  useEffect(() => {
    if (provideNodesSetter) {
      provideNodesSetter(setNodes);
    }
  }, [provideNodesSetter]);

  const onConnect = useCallback((params) => {
    // Ajouter un ID unique à la connexion et stocker des métadonnées
    const edgeWithMetadata = {
      ...params,
      id: `e${params.source}-${params.target}`,
      type: 'custom',
      animated: true,
      label: 'Connexion',
      style: { stroke: '#9c0d17', strokeWidth: 2 }
    };
    
    setEdges((eds) => addEdge(edgeWithMetadata, eds));
    
    // Mettre à jour les informations de connexion dans les nœuds
    setNodes((nds) => 
      nds.map((node) => {
        if (node.id === params.source) {
          return {
            ...node,
            data: {
              ...node.data,
              connections: [...(node.data.connections || []), {
                target: params.target,
                description: 'Connexion'
              }]
            }
          };
        }
        return node;
      })
    );
  }, [setEdges, setNodes]);

  // Fonction pour ajouter une connexion avec description
  const addConnection = useCallback(() => {
    if (!selectedNode || !selectedTarget) return;
    
    // Créer une nouvelle connexion avec description
    const connection = {
      id: `e${selectedNode.id}-${selectedTarget}`,
      source: selectedNode.id,
      target: selectedTarget,
      type: 'custom',
      animated: true,
      label: connectionDescription || 'Connexion',
      style: { stroke: '#9c0d17', strokeWidth: 2 }
    };
    
    // Ajouter à la liste des edges
    setEdges((eds) => [...eds, connection]);
    
    // Mettre à jour les informations de connexion dans le nœud source
    setNodes((nds) => 
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              connections: [...(node.data.connections || []), {
                target: selectedTarget,
                description: connectionDescription || 'Connexion'
              }]
            }
          };
        }
        return node;
      })
    );
    
    // Fermer le modal
    setShowConnectionModal(false);
    setConnectionDescription('');
    setSelectedTarget('');
  }, [selectedNode, selectedTarget, connectionDescription, setEdges, setNodes]);

  const onNodeClick = (event, node) => {
    setSelectedNode(node);
    setIsEditing(true);
    setNodeFormData({
      label: node.data.label,
      type: node.data.type || '',
      content: node.data.content || '',
      typescript: node.data.typescript || '',
      javascript: node.data.javascript || '',
      python: node.data.python || '',
      rust: node.data.rust || '',
      json: node.data.json || '',
      docker: node.data.docker || '',
      techIcon: node.data.techIcon || detectTechnology(node.data.code) || 'default',
      connections: node.data.connections || []
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
          typescript: node.data.typescript || '',
          javascript: node.data.javascript || '',
          python: node.data.python || '',
          rust: node.data.rust || '',
          json: node.data.json || '',
          docker: node.data.docker || '',
          techIcon: node.data.techIcon || 'default',
          connections: node.data.connections || []
        });
        setIsEditing(true);
        setEditMode('basic');
      }
    }
    closeContextMenu();
  };

  // Nouvelle option dans le menu contextuel pour ajouter une connexion
  const showAddConnection = () => {
    if (contextMenu.nodeId) {
      const node = nodes.find(n => n.id === contextMenu.nodeId);
      if (node) {
        setSelectedNode(node);
        
        // Filtrer les nœuds disponibles (tous sauf le nœud courant)
        const targets = nodes
          .filter(n => n.id !== contextMenu.nodeId)
          .map(n => ({ id: n.id, label: n.data.label }));
        
        setAvailableTargets(targets);
        setShowConnectionModal(true);
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
    // Early return if selectedNode is null
    if (!selectedNode) return;
    
    // Déterminer l'icône technologique en fonction du mode d'édition
    let detectedTech = nodeFormData.techIcon || 'default';
    
    if (editMode === 'typescript' && nodeFormData.typescript) {
      detectedTech = 'typescript';
    } else if (editMode === 'javascript' && nodeFormData.javascript) {
      detectedTech = 'javascript';
    } else if (editMode === 'python' && nodeFormData.python) {
      detectedTech = 'python';
    } else if (editMode === 'rust' && nodeFormData.rust) {
      detectedTech = 'rust';
    } else if (editMode === 'json' && nodeFormData.json) {
      detectedTech = 'database';
    } else if (editMode === 'docker' && nodeFormData.docker) {
      detectedTech = 'docker';
    }
    
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
              typescript: nodeFormData.typescript,
              javascript: nodeFormData.javascript,
              python: nodeFormData.python,
              rust: nodeFormData.rust,
              json: nodeFormData.json,
              docker: nodeFormData.docker,
              techIcon: detectedTech,
              connections: nodeFormData.connections
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
        typescript: '',
        javascript: '',
        python: '',
        rust: '',
        json: '',
        docker: '',
        techIcon: 'default',
        connections: []
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

      const reactFlowElement = document.querySelector('.react-flow');
      if (!reactFlowElement) return; // Exit if element doesn't exist
      
      const reactFlowBounds = reactFlowElement.getBoundingClientRect();
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

  // Initialiser l'instance ReactFlow
  const onInit = useCallback((reactFlowInstance) => {
    setReactFlowInstance(reactFlowInstance);
  }, [setReactFlowInstance]);

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
        edgeTypes={edgeTypes}
        onInit={onInit}
        connectionLineType={ConnectionLineType.Bezier}
        fitView
      >
        <Background />
        <Controls />
        <Panel position="top-left">
          <Button onClick={() => setSelectedNode(null)}>Dashboard</Button>
        </Panel>
      </ReactFlow>
      
      {/* Menu contextuel avec option pour ajouter une connexion */}
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
          <ContextMenuItem onClick={showAddConnection}>
            <Link size={14} /> Add Connection
          </ContextMenuItem>
          <ContextMenuItem onClick={deleteNode}>
            <Trash size={14} /> Delete Node
          </ContextMenuItem>
        </NodeContextMenu>
      )}
      
      {/* Modal pour ajouter une connexion */}
      {showConnectionModal && (
        <Modal onClick={() => setShowConnectionModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setShowConnectionModal(false)}>
              <X />
            </CloseButton>
            <Title>Add Connection</Title>
            
            <label>Connect {selectedNode?.data?.label} to:</label>
            <Select 
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
            >
              <option value="">Select a target node</option>
              {availableTargets.map(target => (
                <option key={target.id} value={target.id}>
                  {target.label}
                </option>
              ))}
            </Select>
            
            <label style={{ marginTop: '15px' }}>Connection Description:</label>
            <Input 
              value={connectionDescription}
              onChange={(e) => setConnectionDescription(e.target.value)}
              placeholder="Describe this connection..."
            />
            
            <Button 
              onClick={addConnection}
              disabled={!selectedTarget}
              style={{ opacity: !selectedTarget ? 0.6 : 1 }}
            >
              <Link size={16} style={{ marginRight: '8px' }} /> Connect Nodes
            </Button>
          </ModalContent>
        </Modal>
      )}
      
      {/* Modal d'édition avec onglets pour différents langages */}
      {isEditing && selectedNode && (
        <Modal onClick={() => setIsEditing(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setIsEditing(false)}>
              <X />
            </CloseButton>
            <Title>Edit Node: {selectedNode.data.label}</Title>
            
            <TabContainer>
              <Tab active={editMode === 'basic'} onClick={() => setEditMode('basic')}>Basic</Tab>
              <Tab active={editMode === 'typescript'} onClick={() => setEditMode('typescript')}>TypeScript</Tab>
              <Tab active={editMode === 'javascript'} onClick={() => setEditMode('javascript')}>JavaScript</Tab>
              <Tab active={editMode === 'python'} onClick={() => setEditMode('python')}>Python</Tab>
              <Tab active={editMode === 'rust'} onClick={() => setEditMode('rust')}>Rust</Tab>
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
                
                <label>Description</label>
                <Textarea 
                  value={nodeFormData.content} 
                  onChange={(e) => setNodeFormData({...nodeFormData, content: e.target.value})} 
                  placeholder="Enter a description for this node..."
                />
                
                {/* Liste des connexions existantes */}
                {nodeFormData.connections && nodeFormData.connections.length > 0 && (
                  <>
                    <label>Current Connections:</label>
                    <ConnectionList>
                      {nodeFormData.connections.map((conn, index) => {
                        const targetNode = nodes.find(n => n.id === conn.target);
                        return (
                          <ConnectionItem key={index}>
                            <ConnectionTarget>
                              <Link size={14} />
                              {targetNode?.data?.label || conn.target}
                            </ConnectionTarget>
                            {conn.description && <ConnectionDescription>{conn.description}</ConnectionDescription>}
                          </ConnectionItem>
                        );
                      })}
                    </ConnectionList>
                  </>
                )}
              </>
            )}
            
            {editMode === 'typescript' && (
              <>
                <label>TypeScript Code</label>
                <Textarea 
                  value={nodeFormData.typescript} 
                  onChange={(e) => setNodeFormData({...nodeFormData, typescript: e.target.value})} 
                  placeholder="// Enter TypeScript code here"
                  style={{ fontFamily: 'monospace', minHeight: '200px' }}
                />
              </>
            )}
            
            {editMode === 'javascript' && (
              <>
                <label>JavaScript Code</label>
                <Textarea 
                  value={nodeFormData.javascript} 
                  onChange={(e) => setNodeFormData({...nodeFormData, javascript: e.target.value})} 
                  placeholder="// Enter JavaScript code here"
                  style={{ fontFamily: 'monospace', minHeight: '200px' }}
                />
              </>
            )}
            
            {editMode === 'python' && (
              <>
                <label>Python Code</label>
                <Textarea 
                  value={nodeFormData.python} 
                  onChange={(e) => setNodeFormData({...nodeFormData, python: e.target.value})} 
                  placeholder="# Enter Python code here"
                  style={{ fontFamily: 'monospace', minHeight: '200px' }}
                />
              </>
            )}
            
            {editMode === 'rust' && (
              <>
                <label>Rust Code</label>
                <Textarea 
                  value={nodeFormData.rust} 
                  onChange={(e) => setNodeFormData({...nodeFormData, rust: e.target.value})} 
                  placeholder="// Enter Rust code here"
                  style={{ fontFamily: 'monospace', minHeight: '200px' }}
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
                  style={{ fontFamily: 'monospace', minHeight: '200px' }}
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
                  style={{ fontFamily: 'monospace', minHeight: '200px' }}
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

  // État pour les positions automatiques sur le flowchart
  const [nodeCounter, setNodeCounter] = useState(4); // Commencer après les nodes initiales
  const [lastPosition, setLastPosition] = useState({ x: 200, y: 200 });
  
  // Référence au composant ReactFlow pour accéder à ses méthodes
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const nodesSetter = useRef<((updater: (nodes: any) => any[]) => void) | null>(null);
  
  const provideNodesSetter = useCallback((setter) => {
    nodesSetter.current = setter;
  }, []);

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
    
    // Déterminer la position pour le nouveau node dans le flowchart
    // Décaler chaque nouveau node pour éviter les superpositions
    const newPos = {
      x: lastPosition.x + 100,
      y: lastPosition.y + 75
    };
    setLastPosition(newPos);
    
    // Si on est en vue flowchart, ajouter le node directement
    if (viewMode === 'flow' && reactFlowInstance && nodesSetter.current) {
      // Créer un nouveau node pour le flowchart
      const newFlowNode = {
        id: `node-${nodeCounter}`,
        position: newPos,
        data: { 
          label: type,
          type: type,
          content: '',
          typescript: '',
          javascript: '',
          python: '',
          rust: '',
          json: '',
          docker: '',
          techIcon: techIcon,
          connections: []
        },
        type: 'custom'
      };
      
      nodesSetter.current(nodes => [...nodes, newFlowNode]);
      setNodeCounter(prev => prev + 1);
      
      // Optionnellement, centrer la vue sur le nouveau node
      if (reactFlowInstance) {
        setTimeout(() => {
          reactFlowInstance.fitView({ padding: 0.2 });
        }, 50);
      }
    }
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
    if (!editingCard) return;
    
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
        {/* Sidebar amélioré */}
        <Sidebar>
          <SidebarSection>
            <SectionTitle>Cartes d'urgence</SectionTitle>
            <SidebarButton 
              onClick={() => addBlock('Nuclear Alert')} 
              draggable 
              onDragStart={(event) => onDragStart(event, 'Nuclear Alert')}
            >
              <AlertTriangle size={16} /> Nuclear Alert
            </SidebarButton>
            
            <SidebarButton 
              onClick={() => addBlock('Notify Team')}
              draggable 
              onDragStart={(event) => onDragStart(event, 'Notify Team')}
            >
              <Bell size={16} /> Notify Team
            </SidebarButton>
            
            <SidebarButton 
              onClick={() => addBlock('Evacuate Area')}
              draggable 
              onDragStart={(event) => onDragStart(event, 'Evacuate Area')}
            >
              <User size={16} /> Evacuate Area
            </SidebarButton>
          </SidebarSection>
          
          <SidebarSection>
            <SectionTitle>Cartes personnalisées</SectionTitle>
            {/* Custom buttons */}
            {customButtons.map(button => (
              <SidebarButton 
                key={button.id} 
                onClick={() => addBlock(button.title, button.techIcon)}
                draggable 
                onDragStart={(event) => onDragStart(event, button.title)}
              >
                {technologyIcons[button.techIcon] 
                  ? React.createElement(technologyIcons[button.techIcon], { size: 16 }) 
                  : <Settings size={16} />
                } 
                {button.title}
              </SidebarButton>
            ))}
            
            {/* Interface d'ajout de bouton */}
            {isAddingButton ? (
              <div style={{ marginTop: '20px' }}>
                <Input 
                  value={newButtonName}
                  onChange={(e) => setNewButtonName(e.target.value)}
                  placeholder="Nom de la carte"
                />
                
                <label style={{ marginTop: '10px', display: 'block', color: '#f8f9fa' }}>
                  Technologie
                </label>
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
                
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <Button onClick={addCustomButton}>Ajouter</Button>
                  <Button onClick={() => setIsAddingButton(false)}>Annuler</Button>
                </div>
              </div>
            ) : (
              <SidebarButton 
                onClick={() => setIsAddingButton(true)}
                style={{ backgroundColor: '#444' }}
              >
                <FilePlus size={16} /> Créer une nouvelle carte
              </SidebarButton>
            )}
          </SidebarSection>
          
          {/* Section mode d'affichage */}
          <SidebarSection>
            <SectionTitle>Mode d'affichage</SectionTitle>
            <ViewToggle>
              <ToggleButton 
                active={viewMode === 'dashboard'} 
                onClick={() => setViewMode('dashboard')}
              >
                Dashboard
              </ToggleButton>
              <ToggleButton 
                active={viewMode === 'flow'} 
                onClick={() => setViewMode('flow')}
              >
                Flow Chart
              </ToggleButton>
            </ViewToggle>
          </SidebarSection>
        </Sidebar>

        {/* Contenu principal */}
        <div style={{ flex: 1 }}>
          <Header>
            <Title>Emergency Workflow Dashboard</Title>
          </Header>
          <div style={{ height: '100vh' }}>
            {viewMode === 'flow' ? (
              <ReactFlowProvider>
                <div style={{ width: '100%', height: '100%' }} ref={reactFlowWrapper}>
                  <DnDFlow 
                    setReactFlowInstance={setReactFlowInstance}
                    provideNodesSetter={provideNodesSetter}
                  />
                </div>
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