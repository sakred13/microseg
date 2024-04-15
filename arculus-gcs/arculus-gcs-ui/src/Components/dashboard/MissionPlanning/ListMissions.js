// import React, { useState, useEffect } from 'react';
// import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
// import PlayArrowIcon from '@mui/icons-material/PlayArrow';
// import VisibilityIcon from '@mui/icons-material/Visibility';
// import { API_URL } from '../../../config';

// const ListMissions = ({ authToken, userType }) => {
//   const [missions, setMissions] = useState([]);
//   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
//   const [deleteMission, setDeleteMission] = useState(null);

//   useEffect(() => {
//     const fetchMissions = async () => {
//       let endpoint = '';
//       switch (userType) {
//         case 'Mission Creator':
//           endpoint = `${API_URL}/mission/getMissionsByCreatorId?authToken=${authToken}`;
//           break;
//         case 'Mission Supervisor':
//           endpoint = `${API_URL}/mission/getMissionsBySupervisorId?authToken=${authToken}`;
//           break;
//         case 'Mission Viewer':
//           endpoint = `${API_URL}/mission/getMissionsByViewerId?authToken=${authToken}`;
//           break;
//         default:
//           break;
//       }

//       try {
//         const response = await fetch(endpoint);
//         const data = await response.json();
//         setMissions(data.missions);
//       } catch (error) {
//         console.error('Error fetching missions:', error);
//       }
//     };

//     fetchMissions();
//   }, [authToken, userType]);

//   const handleDeleteDialogOpen = (missionId) => {
//     setDeleteMission(missionId);
//     setShowDeleteDialog(true);
//   };

//   const handleDeleteDialogClose = () => {
//     setDeleteMission(null);
//     setShowDeleteDialog(false);
//   };
  
//   const fetchMissions = async () => {
//     let endpoint = '';
//     switch (userType) {
//       case 'Mission Creator':
//         endpoint = `${API_URL}/mission/getMissionsByCreatorId?authToken=${authToken}`;
//         break;
//       case 'Mission Supervisor':
//         endpoint = `${API_URL}/mission/getMissionsBySupervisorId?authToken=${authToken}`;
//         break;
//       case 'Mission Viewer':
//         endpoint = `${API_URL}/mission/getMissionsByViewerId?authToken=${authToken}`;
//         break;
//       default:
//         break;
//     }

//     try {
//       const response = await fetch(endpoint);
//       const data = await response.json();
//       setMissions(data.missions);
//     } catch (error) {
//       console.error('Error fetching missions:', error);
//     }
//   };

//   useEffect(() => {
//     fetchMissions();
//   }, [authToken, userType]);

//   const handleDeleteMission = async () => {
//     try {
//       const response = await fetch(`${API_URL}/mission/deleteMission?id=${deleteMission}&authToken=${authToken}`, {
//         method: 'DELETE',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       if (!response.ok) {
//         throw new Error(`Error: ${response.status}`);
//       }

//       setShowDeleteDialog(false);
//       // Fetch missions again after deletion
//       fetchMissions();
//     } catch (error) {
//       console.error('Error deleting mission:', error);
//     }
//   };

//   return (
//     <>
//     <br></br>
//       <TableContainer component={Paper} style={{ maxWidth: '100%' }}>
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell><b>Mission Location</b></TableCell>
//               <TableCell><b>Mission Type</b></TableCell>
//               <TableCell><b>Creator</b></TableCell>
//               <TableCell><b>Supervisors</b></TableCell>
//               <TableCell><b>Viewers</b></TableCell>
//               <TableCell><b>Creation Time</b></TableCell>
//               <TableCell><b>Duration</b></TableCell>
//               <TableCell><b>Action</b></TableCell>
//               <TableCell><b>Action</b></TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {missions.map((mission, index) => (
//               <TableRow key={index}>
//                 <TableCell>{JSON.parse(mission.config).location}</TableCell>
//                 <TableCell>{JSON.parse(mission.config).mission_type}</TableCell>
//                 <TableCell>User admin</TableCell>
//                 <TableCell>{mission.supervisors.join(', ')}</TableCell>
//                 <TableCell>{mission.viewers.join(', ')}</TableCell>
//                 <TableCell>{JSON.parse(mission.config).create_time}</TableCell>
//                 <TableCell>{JSON.parse(mission.config).duration_sec}</TableCell>
//                 <TableCell>
//                   <IconButton aria-label="execute">
//                     <PlayArrowIcon />
//                   </IconButton>
//                 </TableCell>
//                 <TableCell>
//                   <IconButton aria-label="view">
//                     <VisibilityIcon />
//                   </IconButton>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>
//       {/* Delete confirmation dialog */}
//       <Dialog
//         open={showDeleteDialog}
//         onClose={handleDeleteDialogClose}
//         aria-labelledby="alert-dialog-title"
//         aria-describedby="alert-dialog-description"
//       >
//         <DialogTitle id="alert-dialog-title">Are you sure you want to delete this mission?</DialogTitle>
//         <DialogContent>
//           <DialogContentText id="alert-dialog-description">
//             Deleting this mission will remove it permanently. This action cannot be undone.
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleDeleteDialogClose} color="primary">
//             Cancel
//           </Button>
//           <Button onClick={handleDeleteMission} color="primary" autoFocus>
//             Delete
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </>
//   );
// };

// export default ListMissions;
