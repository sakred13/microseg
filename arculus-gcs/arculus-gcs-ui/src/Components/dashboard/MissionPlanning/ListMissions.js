import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { API_URL } from '../../../config';
import { getThemeProps } from '@mui/system';
import MissionExecution from './MissionExecution';

const ListMissions = ({ authToken, setSelectedLocation, setDeviceName, setActiveTab, userType }) => {
  const [missions, setMissions] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteMission, setDeleteMission] = useState(null);
  const [missionId, setMissionId] = useState(null);

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

  const handleDeleteDialogOpen = (missionId) => {
    setDeleteMission(missionId);
    setShowDeleteDialog(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteMission(null);
    setShowDeleteDialog(false);
  };

  const handleDeleteMission = async () => {
    try {
      const response = await fetch(`${API_URL}/mission/deleteMission?id=${deleteMission}&authToken=${authToken}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      setShowDeleteDialog(false);
      // Fetch missions again after deletion
      fetchMissions();
    } catch (error) {
      console.error('Error deleting mission:', error);
    }
  };

  const handleExecuteMission = async (config, missionId) => {
    try {
      const { gcX, gcY, destX, destY, selections } = config;
      console.log('config: ', config);
      const controller = selections['Video-Analytic Route Planner (Ground Control)'];
      const supplyDrone = selections['Supply Delivery Drone'];
      const surveillanceDrone = selections['Video Collection Surveillance Drone'];

      console.log('controller, supplyDrone, surveillanceDrone: ', controller, supplyDrone, surveillanceDrone)

      const requestBody = {
        gcX,
        gcY,
        destX, destY,
        controller,
        supplyDrone,
        surveillanceDrone,
        missionId
      };
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

      setSelectedLocation(config.location);
      setActiveTab('Mission Execution');
      setDeviceName(config.selections['Video-Analytic Route Planner (Ground Control)']);
      // Redirect to Mission Execution tab if the response is OK
      // You can implement the redirection logic here
    } catch (error) {
      console.error('Error executing mission:', error);
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
                <TableCell><b>Execute</b></TableCell>
                <TableCell><b>Monitor</b></TableCell>
                <TableCell><b>State</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {missions.map((mission, index) => (
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
                  <TableCell>{JSON.parse(mission.config).duration_sec}</TableCell>
                  <TableCell>
                    <IconButton aria-label="execute" disabled={['IN EXECUTION', "SUCCESSFUL", "FAILED"].includes(mission.state)} onClick={() => handleExecuteMission(JSON.parse(mission.config), mission.mission_id)}>
                      <PlayArrowIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <IconButton aria-label="view" disabled={['CREATED', "SUCCESSFUL", "FAILED"].includes(mission.state)} onClick={() => { setSelectedLocation(mission.config.location); setActiveTab('Mission Execution'); setDeviceName(mission.config.selections['Video-Analytic Route Planner (Ground Control)']); }}>
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell>{mission.state}</TableCell> {/* Display state directly */}
                </TableRow>
              ))}

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
