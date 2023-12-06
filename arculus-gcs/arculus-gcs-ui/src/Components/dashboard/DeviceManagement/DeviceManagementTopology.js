import React, { useState, useCallback, useRef, useEffect } from 'react';
import DeviceInspection from './deviceInspection';
import ReactFlow, {
  applyNodeChanges,
  Background,
  Controls
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, Typography, Button } from '@mui/material';
import { API_URL } from '../../../config';
import Cookies from 'js-cookie';
// import { useNavigate } from 'react-router-dom';



// Node dimensions
const nodeWidth = 150;
const nodeHeight = 50;
const nodeGap = 25; // Gap between nodes

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

const getTrustedDevices = async () => {
  try {
      const url = `${API_URL}/api/getTrustedDevices?authToken=${encodeURIComponent(
          Cookies.get('jwtToken')
      )}`;

      const response = await fetch(url, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
          },
      });

      if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      return data;
  } catch (error) {
      console.error('Error fetching trusted devices:', error.message);
      throw error;
  }
};

const getMoreNodes = async () => {
  try {
      const url = `${API_URL}/api/getMoreNodes?authToken=${encodeURIComponent(
          Cookies.get('jwtToken')
      )}`;

      const response = await fetch(url, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
          },
      });

      if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      return data;
  } catch (error) {
      console.error('Error fetching more nodes:', error.message);
      throw error;
  }
};

const handleDeclineDevice = async (ipAddress, nodeName) => {
  try {
      const url = `${API_URL}/api/addToCluster`;
      const authToken = Cookies.get('jwtToken');
      const response = await fetch(url, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${encodeURIComponent(Cookies.get('jwtToken'))}`,
          },
          body: JSON.stringify({
              ipAddress,
              nodeName,
              authToken,
              decline: true
          }),
      });

      if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Success:', data);
      // Perform any additional actions after a successful API call
  } catch (error) {
      console.error('Error handling device decline:', error.message);
      // Handle errors or show an error message to the user
  }
};

const handleRemoveNode = async (nodeName) => {
  try {
      const authToken = Cookies.get('jwtToken');
      const response = await fetch(
          `${API_URL}/api/removeFromCluster`,
          {
              method: 'DELETE',
              headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${encodeURIComponent(authToken)}`,
              },
              body: JSON.stringify({
                  authToken,
                  nodeName,
              }),
          }
      );

      if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
      }

      console.log('Node removed successfully');
  } catch (error) {
      console.error('Error removing node from the cluster:', error.message);
      // Handle errors or show an error message to the user
  }
};

const handleApproveDevice = async (ipAddress, nodeName) => {
  try {
      const url = `${API_URL}/api/addToCluster`;
      const authToken = Cookies.get('jwtToken');
      const response = await fetch(url, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${encodeURIComponent(Cookies.get('jwtToken'))}`,
          },
          body: JSON.stringify({
              ipAddress,
              nodeName,
              authToken,
          }),
      });

      if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Success:', data);
      // Perform any additional actions after a successful API call
  } catch (error) {
      console.error('Error handling device approval:', error.message);
      // Handle errors or show an error message to the user
  }
};

// Create nodes from lists
// const joinRequestsNodes = joinRequests.map((request, index) => ({
//   id: `join-${index}`,
//   type: 'input',
//   data: { label: `join-${request}` },
//   position: { x: -1 * (nodeWidth + nodeGap), y: index * nodeHeight },
//   style: nodeStyle,
// }));

const clusterJoinRequestsLabel = {
  id: 'cluster-join-requests-label',
  type: 'default', // default type will allow us to just display text
  data: { label: 'Cluster Join Requests' }, // The text we want to display
  position: { x: -1 * (nodeWidth + nodeGap), y: -1 * nodeHeight }, // Position it above the join request nodes
  draggable: false, // This node should not be draggable
  selectable: false, // This node should not be selectable
  style: labelStyle
};


// Parent and group nodes


const yOffset = -40; // Adjust the offset as needed for visual appearance

// Add the label nodes to the initialNodes array
const rfStyle = {
  width: '100%',
  height: '100vh',
  backgroundColor: '#aec9f5',
  padding: "10%"
};

function DeviceManagementTopology() {
  const [trustedDevices, setTrustedDevices] = useState([]);
  const [moreNodes, setMoreNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const menuRef = useRef(null); // Reference to the menu box
  const [deleteDevice, setDeleteDevice] = useState(null);
  // const navigate = useNavigate();

  const testDevice = {
    "device_id": 23,
    "device_name": "controller",
    "ip_address": "10.42.0.26",
    "personnel_rank": null,
    "device_type": "Video Analytic Controller",
    "allowedTasks": [
        "send_command",
        "receive_posdata",
        "receive_sensordata",
        "receive_video"
    ]
  };

  const clusterDevicesNodes = moreNodes.map((device, index) => ({
    id: device,
    data: { label: device },
    position: { x: 0.5 * nodeGap, y: index * nodeHeight },
    parentNode: 'notConfigured',
    draggable: false,
    extent: 'parent',
    style: nodeStyle,
  }));

  const configuredDevicesNodes = trustedDevices.map((device, index) => ({
    id: device,
    data: { label: device },
    position: { x: 0.5 * nodeGap, y: index * nodeHeight },
    parentNode: 'configured',
    draggable: false,
    extent: 'parent',
    style: nodeStyle,
  }));

  const groupNodes = [
    {
      id: 'configured',
      type: 'output',
      position: { x: 1.5 * (nodeWidth + nodeGap), y: 5 * nodeGap },
      style: { width: nodeWidth + nodeGap, height: trustedDevices.length * nodeHeight, backgroundColor: '#1976D2' },
    },
    {
      id: 'notConfigured',
      type: 'output',
      position: { x: .25 * (nodeWidth + nodeGap), y: 5 * nodeGap },
      style: { width: nodeWidth + nodeGap, height: moreNodes.length * nodeHeight, backgroundColor: 'rgba(255, 255, 0, 0.2)' },
    }
  ];

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

  const initialNodes = [
    clusterJoinRequestsLabel,
    clusterDevicesLabel,
    configuredDevicesLabel,
    // ...joinRequestsNodes,
    ...groupNodes,
    ...clusterDevicesNodes,
    ...configuredDevicesNodes
  ];

  const [nodes, setNodes] = useState(initialNodes);

  useEffect(() => {
    const fetchDevices = async () => {
        try {
            const trustedDevicesList = await getTrustedDevices();
            const moreNodesList = await getMoreNodes();

            const filteredMoreNodes = moreNodesList.filter(
                (node) =>
                    !trustedDevicesList.some(
                        (device) => device.device_name === node.nodeName
                    )
            );

            setTrustedDevices(trustedDevicesList);
            setMoreNodes(filteredMoreNodes);
        } catch (error) {
            // Cookies.remove('jwtToken');
            // navigate('/signIn');
            console.log('error');
        }
    };

    fetchDevices();

  }, []);  

  const onNodeClick = (event, node) => {
    if (node.type === 'input' || moreNodes.includes(node.id)) { // Assuming 'input' type is used for Cluster Join Request nodes
      setSelectedNode(node);
    }
  };

  const handleOutsideClick = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setSelectedNode(null); // Close the menu if click is outside
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleApprove = (node) => {
    // Logic to handle approval
    console.log('Approved', node);
    setSelectedNode(null); // Deselect node after action
  };

  const handleReject = (node) => {
    // Logic to handle rejection
    console.log('Rejected', node);
    setSelectedNode(null); // Deselect node after action
  };

  const handleConfigureAsTrusted = () => {
    console.log('Configured as trusted', selectedNode);
    // Add your configuration logic here
    setSelectedNode(null); // Deselect node after action
  };


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

  // const onEdgesChange = useCallback(
  //   (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
  //   [setEdges]
  // );

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
        display: 'flex'
      }}>
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
            onNodesChange={onNodesChange}
            // onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            fitView
            style={rfStyle}
            attributionPosition="top-right"
          >
            <Background />
            <Controls />
          </ReactFlow>
          {selectedNode && (
            <Box
              ref={menuRef}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 'auto',
                bgcolor: 'background.paper',
                boxShadow: 24,
                border: "1px solid black",
                p: 1,
              }}
            >
              <Typography variant="h6" component="h2">
                {selectedNode.data.label}
              </Typography>
              {/* Check if the selected node is a cluster device for displaying the trusted device configuration button */}
              {trustedDevices.includes(selectedNode.id) ? (
                <Button onClick={handleConfigureAsTrusted} color="primary">
                  Configure as trusted device
                </Button>
              ) : (
                <>
                  <Button onClick={handleApprove}>Approve</Button>
                  <Button onClick={handleReject} color="error">Reject</Button>
                </>)}
            </Box>
          )}
        </div>
        <DeviceInspection device={testDevice}/>
      </div>
    </Box>
  );
}

export default DeviceManagementTopology;
