import React, { useState, useEffect } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { Typography } from '@mui/material';
import AddUserModal from './AddUserModal';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EditUserModal from './EditUserModal';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { API_URL } from '../../../config';

const getUsers = async () => {
    try {
        const url = `${API_URL}/user/getUsers?authToken=${encodeURIComponent(
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
        console.error('Error fetching users:', error.message);
        throw error;
    }
};

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [deleteUser, setDeleteUser] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [triggerRender, setTriggerRender] = useState(false);
    const navigate = useNavigate();
    const [editUser, setEditUser] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userList = await getUsers();
                setUsers(userList);
            } catch (error) {
                Cookies.remove('jwtToken');
                navigate('/signIn');
            }
        };

        fetchData();
    }, [triggerRender, deleteUser]);

    const handleModalClose = () => {
        setIsModalOpen(false);
        setTriggerRender(prev => !prev);
    };

    const handleEditModalClose = () => {
        setIsEditModalOpen(false);
        setTriggerRender(prev => !prev);
    };

    const handleDeleteDialogClose = () => {
        setShowDeleteDialog(false);
        setDeleteUser(null);
        setTriggerRender(prev => !prev);
    };

    const handleDeleteUser = async () => {
        try {
            const response = await fetch(
                `${API_URL}/user/deleteUser?username=${deleteUser}&authToken=${Cookies.get('jwtToken')}`,
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
            setDeleteUser(null);
            setTriggerRender(prev => !prev);
        } catch (error) {
            console.error('Error deleting user:', error.message);
        }
    };

    const handleDeleteDialogOpen = (username) => {
        setDeleteUser(username);
        setShowDeleteDialog(true);
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minHeight: '90vh',
            }}
        >
            <Typography variant="h4" gutterBottom>
                User Management Dashboard <br />
            </Typography>
            {isModalOpen && (
                <AddUserModal isOpen={isModalOpen} setIsOpen={handleModalClose} />
            )}
            {isEditModalOpen && (
                <EditUserModal isOpen={isEditModalOpen} setIsOpen={handleEditModalClose} username={editUser[0]} email={editUser[1]} role={editUser[2]} domains={editUser[3]} />
            )}
            <TableContainer component={Paper} style={{ maxWidth: '90%' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><b>User Name</b></TableCell>
                            <TableCell><b>E-mail ID</b></TableCell>
                            <TableCell><b>Role</b></TableCell>
                            <TableCell><b>Domains</b></TableCell>
                            <TableCell><b>Action</b></TableCell>
                            <TableCell><b>Action</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.user_id}>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.role_name}</TableCell>
                                <TableCell>{user.domains ? user.domains.split(',').map((domain, index) => ( <div key={index}>{domain}</div>)) : 'None'}</TableCell>
                                <TableCell>
                                    {user.username !== Cookies.get('user') && (
                                        <Button startIcon={<EditIcon />} onClick={() => { setEditUser([user.username, user.email, user.role_name, user.domains]); setIsEditModalOpen(true); }} style={{ cursor: 'pointer' }}>
                                            <font color="black">Edit</font>
                                        </Button>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {user.username !== Cookies.get('user') && (
                                        <Button
                                            startIcon={<DeleteIcon style={{ "color": "#e34048" }} />}
                                            onClick={() => handleDeleteDialogOpen(user.username)}
                                            style={{ cursor: 'pointer', color: "black" }}
                                        >
                                            Delete
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Button variant="contained" color="primary" style={{ marginTop: '16px' }} onClick={() => setIsModalOpen(true)}>
                <PersonAddIcon />&nbsp;&nbsp;Add User
            </Button>

            {/* Delete confirmation dialog */}
            <Dialog
                open={showDeleteDialog}
                onClose={handleDeleteDialogClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Are you sure you want to delete user {deleteUser}?</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Deleting this user will permanently remove their account. This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteUser} color="primary">
                        Yes
                    </Button>
                    <Button onClick={handleDeleteDialogClose} color="primary" autoFocus>
                        No
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ManageUsers;
