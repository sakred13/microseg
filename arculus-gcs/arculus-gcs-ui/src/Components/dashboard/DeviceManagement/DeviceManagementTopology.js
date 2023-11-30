import { useCallback, useState } from 'react';
import ReactFlow, {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, Typography } from '@mui/material';


// Node dimensions
const nodeWidth = 150;
const nodeHeight = 50;
const nodeGap = 25; // Gap between nodes

// Lists
const joinRequests = ['120.32.343.32', '43.43.232.42'];
const clusterDevices = ['dev1', 'dev2', 'dev3', 'dev4'];
const configuredDevices = ['pod5', 'pod1', 'pod2', 'pod3', 'pod4'];

const nodeStyle = {
  // ... your existing styles
  '& .react-flow__handle': {
    display: 'none',
  },
};

const labelStyle = {
  border: 'none',
  background: 'none',
  width: 'auto',
  height: 'auto',
  color: 'black', // Optional: set the text color to match Cluster Join Requests
  fontSize: '16px' // Optional: set the text size to match Cluster Join Requests
};

// Create nodes from lists
const joinRequestsNodes = joinRequests.map((request, index) => ({
  id: `join-${index}`,
  type: 'input',
  data: { label: `join-${request}` },
  position: { x: -1 * (nodeWidth + nodeGap), y: index * nodeHeight },
  style: nodeStyle,
}));

const clusterJoinRequestsLabel = {
  id: 'cluster-join-requests-label',
  type: 'default', // default type will allow us to just display text
  data: { label: 'Cluster Join Requests' }, // The text we want to display
  position: { x: -1 * (nodeWidth + nodeGap), y: -1 * nodeHeight }, // Position it above the join request nodes
  draggable: false, // This node should not be draggable
  selectable: false, // This node should not be selectable
  style: labelStyle
};

const clusterDevicesNodes = clusterDevices.map((device, index) => ({
  id: device,
  data: { label: device },
  position: { x: 0.5 * nodeGap, y: index * nodeHeight },
  parentNode: 'notConfigured',
  draggable: false,
  extent: 'parent',
  style: nodeStyle,
}));

const configuredDevicesNodes = configuredDevices.map((device, index) => ({
  id: device,
  data: { label: device },
  position: { x: 0.5 * nodeGap, y: index * nodeHeight },
  parentNode: 'configured',
  draggable: false,
  extent: 'parent',
  style: nodeStyle,
}));

// Parent and group nodes
const groupNodes = [
  {
    id: 'controller',
    data: { label: 'Controller' },
    position: { x: nodeWidth, y: 0 },
  },
  {
    id: 'configured',
    type: 'output',
    data: { label: 'Configured Devices' },
    position: { x: 1.5 * (nodeWidth + nodeGap), y: 5 * nodeGap },
    style: { width: nodeWidth + nodeGap, height: configuredDevices.length * nodeHeight, backgroundColor: '#1976D2' },
  },
  {
    id: 'notConfigured',
    data: { label: 'Configured Devices' },
    type: 'output',
    position: { x: .25 * (nodeWidth + nodeGap), y: 5 * nodeGap },
    style: { width: nodeWidth + nodeGap, height: clusterDevices.length * nodeHeight, backgroundColor: 'rgba(255, 255, 0, 0.2)' },
  }
];

const initialEdges = [{ id: 'controller-configured', source: 'controller', target: 'configured', label: 'Configured Devices' }, { id: 'controller-notConfigured', source: 'controller', target: 'notConfigured', label: "Devices in the Cluster" }];
const yOffset = -40; // Adjust the offset as needed for visual appearance
const clusterDevicesParentNode = groupNodes.find(node => node.id === 'notConfigured');
const configuredDevicesParentNode = groupNodes.find(node => node.id === 'configured');

const clusterDevicesLabel = {
  id: 'cluster-devices-label',
  type: 'default',
  data: { label: 'Devices in the Cluster' },
  position: { 
    x: clusterDevicesParentNode.position.x + (clusterDevicesParentNode.style.width / 2) - (nodeWidth / 2), 
    y: clusterDevicesParentNode.position.y + yOffset
  },
  draggable: false,
  selectable: false,
  style: labelStyle
};

const configuredDevicesLabel = {
  id: 'configured-devices-label',
  type: 'default',
  data: { label: 'Configured Devices' },
  position: { 
    x: configuredDevicesParentNode.position.x + (configuredDevicesParentNode.style.width / 2) - (nodeWidth / 2), 
    y: configuredDevicesParentNode.position.y + yOffset
  },
  draggable: false,
  selectable: false,
  style: labelStyle
};

// Add the label nodes to the initialNodes array
const initialNodes = [
  clusterJoinRequestsLabel,
  clusterDevicesLabel,
  configuredDevicesLabel,
  ...joinRequestsNodes,
  ...groupNodes,
  ...clusterDevicesNodes,
  ...configuredDevicesNodes
];
const rfStyle = {
  width: '100%',
  height: '100vh',
  backgroundColor: '#aec9f5',
  padding: "10%"
};

function DeviceManagementTopology() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  // const constrainNodePosition = (node, parentNode) => {
  //   const parentX = parentNode.position.x;
  //   const parentY = parentNode.position.y;
  //   const parentWidth = parentNode.style.width;
  //   const parentHeight = parentNode.style.height;

  //   if (node.position.x < parentX) {
  //     node.position.x = parentX;
  //   } else if (node.position.x + nodeWidth > parentX + parentWidth) {
  //     node.position.x = parentX + parentWidth - nodeWidth;
  //   }

  //   if (node.position.y < parentY) {
  //     node.position.y = parentY;
  //   } else if (node.position.y + nodeHeight > parentY + parentHeight) {
  //     node.position.y = parentY + parentHeight - nodeHeight;
  //   }
  // };

  const onNodesChange = useCallback(
    // (changes) => setNodes((nds) => applyNodeChanges(changes, nds).map((node) => {
    //   if (node.parentNode) {
    //     const parentNode = nds.find(n => n.id === node.parentNode);
    //     if (parentNode) {
    //       constrainNodePosition(node, parentNode);
    //     }
    //   }
    //   return node;
    // })),
    // []
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  return (
    <Box sx={{ textAlign: 'center', padding: '0 10%' }}>
      <Typography variant="h4" component="div" gutterBottom>
        Device Management Dashboard
      </Typography>
      <style type="text/css">
        {`
          .react-flow__handle {
            display: none !important;
          }
        `}
      </style>
      <div style={{
        width: '80%',
        height: '80vh',
        border: '2px solid black',
        margin: 'auto', // Centers the div horizontally
        boxSizing: 'border-box' // Ensures the border doesn't add to the width/height
      }}>
        <Typography
          variant="subtitle1"
          component="div"
          style={{
            position: 'absolute',
            top: 20, // Adjust this value as needed
            left: '10%', // Adjust based on the position of your joinRequests nodes
          }}>
          Cluster Join Requests
        </Typography>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          style={rfStyle}
          attributionPosition="top-right"
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </Box>
  );
}

export default DeviceManagementTopology;
