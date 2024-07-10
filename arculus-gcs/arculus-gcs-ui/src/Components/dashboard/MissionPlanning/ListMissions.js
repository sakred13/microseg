import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { API_URL } from '../../../config';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import DeleteIcon from '@mui/icons-material/Delete';

// Add this state to track which mission's play button was clicked
const ListMissions = ({ authToken, setSelectedLocation, setDeviceName, setActiveTab, userType, setVideoCollectionDrone, setSupplyDeliveryDrone }) => {
  const [missions, setMissions] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteMissionId, setDeleteMissionId] = useState(null);
  const [loadingMission, setLoadingMission] = useState(null);

  useEffect(() => {
    fetchMissions();
  }, [authToken, userType]);

  const fetchMissions = async () => {
    let endpoint = '';
    switch (userType) {
      case 'Mission Creator':
        endpoint = `${API_URL}/mission/getMissionsByCreatorId?authToken=${authToken}`;
        break;
      case 'Mission Supervisor':
        endpoint = `${API_URL}/mission/getMissionsBySupervisorId?authToken=${authToken}`;
        break;
      case 'Mission Viewer':
        endpoint = `${API_URL}/mission/getMissionsByViewerId?authToken=${authToken}`;
        break;
      default:
        break;
    }

    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      setMissions(data.missions);
    } catch (error) {
      console.error('Error fetching missions:', error);
    }
  };

  const handleExecuteMission = async (config, missionId) => {
    setLoadingMission(missionId); // Set the loading state to the current mission ID

    const { gcX, gcY, destX, destY, selections } = config;
    const controller = selections['Video-Analytic Route Planner (Ground Control)'];
    const supplyDrone = selections['Supply Delivery Drone'];
    const surveillanceDrone = selections['Video Collection Surveillance Drone'];
    const relayDrone = selections['Communication Relay Drone'];
    const requestBody = {
      gcX, gcY, destX, destY, controller, supplyDrone, surveillanceDrone, relayDrone, missionId
    };

    try {
      const response = await fetch(`${API_URL}/mission/executeStealthyReconAndResupply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Wait for 2 seconds after the API response before navigating to the execution tab
      setTimeout(() => {
        setSelectedLocation(config.location);
        setVideoCollectionDrone(config.selections['Video Collection Surveillance Drone']);
        setSupplyDeliveryDrone(config.selections['Supply Delivery Drone']);
        setActiveTab('Mission Execution');
        setDeviceName(controller);
        setLoadingMission(null); // Reset the loading state
      }, 4000);
    } catch (error) {
      console.error('Error executing mission:', error);
      setLoadingMission(null); // Ensure loading state is cleared on error
    }
  };

  const handleDeleteDialogOpen = (missionId) => {
    setDeleteMissionId(missionId);
    setShowDeleteDialog(true);
  };

  const handleDeleteDialogClose = () => {
    setShowDeleteDialog(false);
  };

  const handleDeleteMission = async () => {
    try {
      const response = await fetch(`${API_URL}/mission/deleteMission`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authToken: authToken,
          missionId: deleteMissionId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }

      setShowDeleteDialog(false);
      setDeleteMissionId(null);
      fetchMissions();  // Refresh the list of missions after deletion
    } catch (error) {
      console.error('Error deleting mission:', error);
    }
  };


  return (
    <>
      <br></br>
      {!missions || missions.length === 0 ? (
        <div style={{ textAlign: 'center' }}>
          <img src="noMission.png" alt="No Missions" style={{ maxWidth: '25%', height: 'auto' }} />
          <Typography variant="h3" color="textSecondary" style={{ marginTop: '1rem' }}>No Missions Configured</Typography>
        </div>
      ) : (
        <TableContainer component={Paper} style={{ maxWidth: '100%' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>Mission Location</b></TableCell>
                <TableCell><b>Mission Type</b></TableCell>
                <TableCell><b>Creator</b></TableCell>
                <TableCell><b>Supervisors</b></TableCell>
                <TableCell><b>Viewers</b></TableCell>
                <TableCell><b>Creation Time</b></TableCell>
                <TableCell><b>Duration</b></TableCell>
                {userType === 'Mission Creator' && (<TableCell><b>Execute</b></TableCell>)}
                <TableCell><b>Monitor</b></TableCell>
                <TableCell><b>Status</b></TableCell>
                {userType === 'Mission Creator' && (<TableCell><b>Delete</b></TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {
                // Assuming 'missions' is already available in your component's scope
                // Parse the `create_time` and sort missions in ascending order by date
                missions.sort((a, b) => {
                  const timeA = new Date(JSON.parse(a.config).create_time);
                  const timeB = new Date(JSON.parse(b.config).create_time);
                  return timeB - timeA;
                }).map((mission, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {(() => {
                        const path = JSON.parse(mission.config).location;
                        switch (path) {
                          case '/murrietaHeights.png': return 'Murrieta Heights';
                          case '/libertycity.png': return 'Liberty City';
                          case '/forest.png': return 'Paleto Forest';
                          case '/desert.png': return 'Grand Senora Desert';
                          default: return 'Unknown Location';
                        }
                      })()}
                    </TableCell>
                    <TableCell>{JSON.parse(mission.config).mission_type}</TableCell>
                    <TableCell>User admin</TableCell>
                    <TableCell>{mission.supervisors.join(', ')}</TableCell>
                    <TableCell>{mission.viewers.join(', ')}</TableCell>
                    <TableCell>{JSON.parse(mission.config).create_time}</TableCell>
                    <TableCell>{JSON.parse(mission.config).duration_sec} sec</TableCell>
                    {userType === 'Mission Creator' && <TableCell>
                      <IconButton
                        aria-label="execute"
                        disabled={loadingMission === mission.mission_id || ['IN EXECUTION', "SUCCESSFUL", "ABORTED"].includes(mission.state)}
                        onClick={() => handleExecuteMission(JSON.parse(mission.config), mission.mission_id)}
                      >
                        {loadingMission === mission.mission_id ? <HourglassEmptyIcon /> : <PlayArrowIcon />}
                      </IconButton>
                    </TableCell>}
                    <TableCell>
                      <IconButton
                        aria-label="view"
                        disabled={['CREATED', "SUCCESSFUL", "ABORTED"].includes(mission.state)}
                        onClick={() => {
                          setSelectedLocation(JSON.parse(mission.config).location);
                          setDeviceName(JSON.parse(mission.config).selections['Video-Analytic Route Planner (Ground Control)']);
                          setActiveTab('Mission Execution');
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>

                    </TableCell>
                    <TableCell>{mission.state}</TableCell> {/* Display state directly */}
                    {userType === 'Mission Creator' && (
                      <TableCell>
                        <IconButton
                          aria-label="delete"
                          onClick={() => handleDeleteDialogOpen(mission.mission_id)}
                          disabled={mission.state === 'IN EXECUTION'}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {/* Delete confirmation dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={handleDeleteDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Are you sure you want to delete this mission?</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Deleting this mission will remove it permanently. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteMission} color="primary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ListMissions;
