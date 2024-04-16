import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { API_URL } from '../../../config';

const ListPolicies = ({ authToken }) => {
    const [policies, setPolicies] = useState([]);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deletePolicy, setDeletePolicy] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPolicies = async () => {
        try {
            const response = await fetch(`${API_URL}/policy/getNetworkPolicies?authToken=${authToken}`);
            const data = await response.json();
            setPolicies(data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching policies:', error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPolicies();
    }, [authToken]);

    const handleDeleteDialogOpen = (policyName) => {
        setDeletePolicy(policyName);
        setShowDeleteDialog(true);
    };

    const handleDeleteDialogClose = () => {
        setDeletePolicy(null);
        setShowDeleteDialog(false);
    };

    const handleDeletePolicy = async () => {
        try {
            const response = await fetch(`${API_URL}/policy/deleteNetworkPolicy`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    authToken: authToken,
                    policyName: deletePolicy,
                }),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            setShowDeleteDialog(false);
            // Fetch policies again after deletion
            fetchPolicies();
        } catch (error) {
            console.error('Error deleting policy:', error);
        }
    };

    return (
        <>
            {isLoading ? (
                <Typography variant="body1" component="div" align="center" style={{ marginTop: '20px' }}>
                    Loading...
                </Typography>
            ) : (
                <>
                    {policies.length === 0 ? (
                        <Typography
                            variant="body1"
                            component="div"
                            align="center"
                            style={{ marginTop: '20px', color: 'grey', fontSize: '4rem' }}
                        >
                            <br /><img src='firewall.png' style={{ width: '25%' }} /><br />
                            No Active Network Policies
                        </Typography>
                    ) : (
                        <>
                            <br />
                            <Typography variant="h4" component="div" gutterBottom>
                                Active Network Policies
                            </Typography>
                            <TableContainer component={Paper} style={{ maxWidth: '100%' }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><b>Policy ID</b></TableCell>
                                            <TableCell><b>Source Device</b></TableCell>
                                            <TableCell><b>Dest Device</b></TableCell>
                                            <TableCell><b>Ingress Port/Protocol</b></TableCell>
                                            <TableCell><b>Egress Port/Protocol</b></TableCell>
                                            <TableCell><b>Edit</b></TableCell>
                                            <TableCell><b>Delete</b></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {policies.map((policy, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{policy.name}</TableCell>
                                                <TableCell>{policy.ingress && policy.ingress[0] && policy.ingress[0].from && policy.ingress[0].from[0] && policy.ingress[0].from[0].podSelector && policy.ingress[0].from[0].podSelector.matchLabels && policy.ingress[0].from[0].podSelector.matchLabels.app}</TableCell>
                                                <TableCell>{policy.egress && policy.egress[0] && policy.egress[0].to && policy.egress[0].to[0] && policy.egress[0].to[0].podSelector && policy.egress[0].to[0].podSelector.matchLabels && policy.egress[0].to[0].podSelector.matchLabels.app}</TableCell>
                                                <TableCell>{policy.ingress && policy.ingress[0] && policy.ingress[0].ports && policy.ingress[0].ports.map(port => `${port.port}/${port.protocol}`).join(', ')}</TableCell>
                                                <TableCell>{policy.egress && policy.egress[0] && policy.egress[0].ports && policy.egress[0].ports.map(port => `${port.port}/${port.protocol}`).join(', ')}</TableCell>
                                                <TableCell>
                                                    <IconButton aria-label="edit">
                                                        <EditIcon />
                                                    </IconButton>
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton aria-label="delete" onClick={() => handleDeleteDialogOpen(policy.name)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}

                                    </TableBody>
                                </Table>
                            </TableContainer>
                            {/* Delete confirmation dialog */}
                            <Dialog
                                open={showDeleteDialog}
                                onClose={handleDeleteDialogClose}
                                aria-labelledby="alert-dialog-title"
                                aria-describedby="alert-dialog-description"
                            >
                                <DialogTitle id="alert-dialog-title">Are you sure you want to delete this policy?</DialogTitle>
                                <DialogContent>
                                    <DialogContentText id="alert-dialog-description">
                                        Deleting this policy will remove it permanently. This action cannot be undone.
                                    </DialogContentText>
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={handleDeleteDialogClose} color="primary">
                                        Cancel
                                    </Button>
                                    <Button onClick={handleDeletePolicy} color="primary" autoFocus>
                                        Delete
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </>
                    )}
                </>
            )}
        </>
    );
};

export default ListPolicies;
