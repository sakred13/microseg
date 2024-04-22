import React, { useState, useEffect } from "react";
import './DeviceManagement.css';
import MemoryIcon from '@mui/icons-material/Memory';
import { DialogContent, DialogContentText, Typography } from '@mui/material';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { API_URL } from '../../../config';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import AddDeviceModal from './AddDeviceModal';
import EditDeviceModal from './EditDeviceModal';
import AddUserModal from '../UserManagement/AddUserModal';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import DoneIcon from '@mui/icons-material/Done';
import EditIcon from '@mui/icons-material/Edit';
import Tooltip from '@mui/material/Tooltip';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import CircularProgress from '@mui/material/CircularProgress';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const getTasks = async () => {
  try {
    const url = `${API_URL}/task/getTasks?authToken=${encodeURIComponent(
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
    console.error('Error fetching tasks:', error.message);
    throw error;
  }
};

const getTrustedDevices = async () => {
  try {
    const url = `${API_URL}/device/getTrustedDevices?authToken=${encodeURIComponent(
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
    const url = `${API_URL}/device/getMoreNodes?authToken=${encodeURIComponent(
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
    const url = `${API_URL}/device/addToCluster`;
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
  }
};

const handleRemoveNode = async (nodeName) => {
  try {
    const authToken = Cookies.get('jwtToken');
    const response = await fetch(
      `${API_URL}/device/removeFromCluster`,
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
  }
};

const handleApproveDevice = async (ipAddress, nodeName) => {
  try {
    const url = `${API_URL}/device/addToCluster`;
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

function DeviceManagement(props) {
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState('');
  const [trustedDevices, setTrustedDevices] = useState([]);
  const [moreNodes, setMoreNodes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteDevice, setDeleteDevice] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [triggerRender, setTriggerRender] = useState(false);
  const navigate = useNavigate();
  const [isAddDeviceModalOpen, setIsAddDeviceModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState({ nodeName: '', nodeIP: '' });
  const [tasks, setTasks] = useState([]);
  const [isEditDeviceModalOpen, setIsEditDeviceModalOpen] = useState(false);
  const [editDeviceDetails, setEditDeviceDetails] = useState(null);
  const [isClickDisabled, setisClickDisabled] = useState(false);
  const [showRemoveClusterDialog, setShowRemoveClusterDialog] = useState(false);
  const [removeClusterNode, setRemoveClusterNode] = useState(null);
  const [removeTrustedDevice, setRemoveTrustedDevice] = useState(false);
  const deviceTypeImages = {
    "Video Capture Drone": "surveillanceDrone.png",
    "Video Analytic Controller": "videoAnalyticController.png",
    "Video Capture Rover": "reconRover.png",
    "Freight Drone": "freightDrone.png",
    "Freight UGV": "freightRover.png",
    "Sensor-Integrated Drone": "sensorIntegratedDrone.png",
    "Communication Relay Drone": "commRelayDrone.png",
    "Communication Relay Rover": "commRelayRover.png",
  };

  const handleOpen = (text) => {
    setInfoModalContent(text);
    setInfoModalOpen(true);
  };

  const handleClose = () => {
    setInfoModalOpen(false);
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasksList = await getTasks();
        setTasks(tasksList);
      } catch (error) {
        Cookies.remove('jwtToken');
        navigate('/signIn');
      }
    };

    fetchTasks();
  }, []);

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
        Cookies.remove('jwtToken');
        navigate('/signIn');
      }
    };

    if (!isModalOpen && !isAddDeviceModalOpen && !isEditDeviceModalOpen) {
      fetchDevices();
    }
  }, [isModalOpen, isAddDeviceModalOpen, isEditDeviceModalOpen, deleteDevice]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setTriggerRender((prev) => !prev);
  };

  const handleAddDeviceModalOpen = (nodeName, nodeIP) => {
    setSelectedNode({ nodeName: nodeName, nodeIP: nodeIP });
    setIsAddDeviceModalOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setShowDeleteDialog(false);
    setDeleteDevice(null);
    setTriggerRender((prev) => !prev);
  };

  const handleDeleteDevice = async (deviceName) => {
    try {
      const response = await fetch(
        `${API_URL}/device/removeTrustedDevice?authToken=${encodeURIComponent(
          Cookies.get('jwtToken')
        )}&deviceName=${deviceName}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      setShowDeleteDialog(false);
      setDeleteDevice(null);
      setTriggerRender((prev) => !prev);
    } catch (error) {
      console.error('Error removing device from trustlist:', error.message);
    }
  };

  const handleDeleteDialogOpen = (deviceName) => {
    setDeleteDevice(deviceName);
    setShowDeleteDialog(true);
  };

  const handleEditDevice = (device) => {
    setEditDeviceDetails(device);
    setIsEditDeviceModalOpen(true);
  };

  const handleRemoveNodeDialogOpen = (nodeName) => {
    setRemoveClusterNode(nodeName);
    setShowRemoveClusterDialog(true);
  };

  const handleRemoveNodeDialogClose = () => {
    setShowRemoveClusterDialog(false);
    setRemoveClusterNode(null);
    setTriggerRender((prev) => !prev); // Refresh the content after the dialog closes
  };

  const handleRemoveNodeFromCluster = async (nodeName) => {
    try {
      // Perform the removal action here
      await handleRemoveNode(nodeName); // You can use your existing function here
      setShowRemoveClusterDialog(false);
      setRemoveClusterNode(null);

      // Trigger a re-render by updating the state
      window.location.reload();
    } catch (error) {
      console.error('Error removing node from the cluster:', error.message);
      // Handle errors or show an error message to the user
    }
  };

  const handleEditDeviceModalClose = () => {
    setIsEditDeviceModalOpen(false);
    setEditDeviceDetails(null);
    setTriggerRender((prev) => !prev);
  };

  const infoModalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  return (
    <>
      <Typography style={{ textAlign: "center" }} variant="h4" gutterBottom>
        Device Management Dashboard <br />
      </Typography>      <div className="outer">
        <div className="left">
          <h2>Cluster Join Requests</h2>
          <div className="button-container">
            {Object.entries(props.pendingActions).map(([key, value]) => (
              <div key={key} className="button-with-label">
                <button className="circle-button" onClick={() => handleOpen(<div style={{ backgroundColor: "white", width: "100%" }}>
                  <h2 style={{ backgroundColor: 'white' }}>Requesting Device Information</h2>
                  <TableContainer component={Paper} style={{ maxWidth: '100%', marginTop: '20px' }}>
                    <Table size="small" style={{ width: "100%", alignContent: "left" }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <b>Name</b>
                          </TableCell>
                          <TableCell>
                            <b>IP Address</b>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow key={key}>
                          <TableCell style={{ textAlign: "left" }}>{value}</TableCell>
                          <TableCell style={{ textAlign: "left" }}>{key}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    <Button
                      startIcon={<DoneIcon />}
                      onClick={() => {
                        setisClickDisabled(true); handleApproveDevice(key, value); setInfoModalOpen(false);
                      }}
                      style={{ cursor: 'pointer', flex: 1, marginRight: '10px' }} // flex: 1 allows the button to grow
                      disabled={isClickDisabled}
                    >
                      Approve
                    </Button>
                    <Button
                      startIcon={<CloseIcon style={{ color: '#e34048' }} />}
                      onClick={() => { setisClickDisabled(true); handleDeclineDevice(key, value); setInfoModalOpen(false); }}
                      style={{ cursor: 'pointer', flex: 1, marginLeft: '10px' }} // flex: 1 allows the button to grow
                      disabled={isClickDisabled}
                    >
                      Decline
                    </Button>
                  </TableContainer>
                </div>
                )}>
                  <span style={{ backgroundColor: "grey", fontSize: "30px" }}>?</span>
                </button>
                <span>{key}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="right">
          <div className="top-right">
            <h2>Configured Devices</h2>
            <div className="button-container">
              {trustedDevices.map((device, index) => (
                <div key={index} className="button-with-label">
                  <button className="square-button" onClick={() => handleOpen(<><h2 style={{ backgroundColor: 'white' }}>Configured Device Information</h2><TableContainer component={Paper} style={{ maxWidth: '100%' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <b>Name</b>
                          </TableCell>
                          <TableCell>
                            <b>IP Address</b>
                          </TableCell>
                          <TableCell>
                            <b>Device Type</b>
                          </TableCell>
                          <TableCell>
                            <b>Allowed Operations</b>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow key={device.id}>
                          <TableCell>{device.device_name}</TableCell>
                          <TableCell>{device.ip_address}</TableCell>
                          <TableCell>{device.device_type}</TableCell>
                          <TableCell>
                            <Tooltip
                              title={device.allowedTasks.map((task, index) => (
                                <React.Fragment key={index}>
                                  {task}
                                  <br />
                                </React.Fragment>
                              ))}
                              arrow
                            >
                              <IconButton size="small">
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    <Button
                      startIcon={<EditIcon />}
                      onClick={() => handleEditDevice(device)}
                      style={{ cursor: 'pointer', backgroundColor: "white" }}
                    >
                      <font color="black">Update Device Capabilities</font>
                    </Button>{' '}
                    &nbsp;&nbsp;&nbsp;
                    <Button
                      startIcon={<RemoveCircleOutlineIcon style={{ color: '#e34048' }} />}
                      onClick={() => handleDeleteDialogOpen(device.device_name)}
                      style={{ cursor: 'pointer', color: 'black', backgroundColor: "white" }}
                    >
                      Deconfigure Device
                    </Button>
                  </TableContainer>
                  </>)}>
                    {/* Render the correct image based on device type */}
                    <img src={deviceTypeImages[device.device_type]} alt={device.device_type} className="button-image" />
                  </button>
                  <span>{device.device_name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bottom-right">
            <h2>More Devices in the Cluster</h2>
            <div className="button-container">
              {moreNodes.map((node, index) => (
                <div key={index} className="button-with-label">
                  <button className="square-button" onClick={() => handleOpen(<><h2 style={{ backgroundColor: 'white' }}>Device Information</h2><TableContainer component={Paper} style={{ maxWidth: '100%', marginTop: '20px' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <b>Name</b>
                          </TableCell>
                          <TableCell>
                            <b>IP Address</b>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow key={node.id}>
                          <TableCell>{node.nodeName}</TableCell>
                          <TableCell>{node.nodeIP}</TableCell>
                        </TableRow>
                      </TableBody>
                      <Button
                        startIcon={<AddIcon />}
                        onClick={() => handleAddDeviceModalOpen(node.nodeName, node.nodeIP)}
                        style={{ cursor: 'pointer' }}
                      >
                        <font color="black">Configure as Trusted Device</font>
                      </Button>
                      {node.nodeName !== 'controller' && (
                        <Button
                          startIcon={<DeleteIcon style={{ color: '#e34048' }} />}
                          onClick={() => handleRemoveNodeDialogOpen(node.nodeName)}
                          style={{ cursor: 'pointer' }}
                        >
                          <font color="black">Remove from Cluster</font>
                        </Button>
                      )}
                    </Table>
                  </TableContainer></>)}>
                    <MemoryIcon style={{ fontSize: 'inherit' }} />
                  </button>
                  <span>{node.nodeName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Modal
          open={infoModalOpen}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={infoModalStyle} style={{ width: 'fit-content' }}>
            <IconButton
              aria-label="close"
              onClick={handleClose}
              style={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              {infoModalContent}
            </Typography>
          </Box>
        </Modal>
        {isModalOpen && <AddUserModal isOpen={isModalOpen} setIsOpen={handleModalClose} />}
        {isAddDeviceModalOpen && (
          <AddDeviceModal
            isOpen={isAddDeviceModalOpen}
            setIsOpen={setIsAddDeviceModalOpen}
            nodeName={selectedNode.nodeName}
            nodeIP={selectedNode.nodeIP}
            allowedTasks={tasks}
          />
        )}
        {isEditDeviceModalOpen && (
          <EditDeviceModal
            isOpen={isEditDeviceModalOpen}
            setIsOpen={handleEditDeviceModalClose}
            deviceDetails={editDeviceDetails}
            allowedTasks={tasks}
          />
        )}
        <Dialog
          open={showDeleteDialog}
          onClose={handleDeleteDialogClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            Are you sure you want to deconfigure trusted device {deleteDevice}?
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {removeTrustedDevice ?
                (<text>Please wait while the device is being deconfigured. This might take some time.</text>) :
                (<text>Removing this device configuration will destroy all its "allow" policies. This action cannot be undone.</text>)
              }
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            {removeTrustedDevice ? (
              <CircularProgress size={24} />
            ) : (
              <>
                <Button
                  onClick={() => {
                    setRemoveTrustedDevice(true); // Disable buttons and show spinner
                    handleDeleteDevice(deleteDevice);
                  }}
                  color="primary"
                  disabled={removeTrustedDevice}
                >
                  Yes
                </Button>
                <Button
                  onClick={handleDeleteDialogClose}
                  color="primary"
                  autoFocus
                  disabled={removeTrustedDevice}
                >
                  No
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>
        <Dialog
          open={showRemoveClusterDialog}
          onClose={handleRemoveNodeDialogClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            Are you sure you want to remove {removeClusterNode} from the cluster?
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Removing this node from the cluster will disconnect it permanently. This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => handleRemoveNodeFromCluster(removeClusterNode)} color="primary">
              Yes
            </Button>
            <Button onClick={handleRemoveNodeDialogClose} color="primary" autoFocus>
              No
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </>
  );
}

export default DeviceManagement;
