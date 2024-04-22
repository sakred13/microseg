import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Modal, Autocomplete, Chip } from '@mui/material';
import AuthenticationModal from './AuthenticationModal';
import Cookies from 'js-cookie';
import { API_URL } from '../../../config';

const authToken = encodeURIComponent(Cookies.get('jwtToken'));
const AccountDashboard = () => {
    const [user, setUser] = useState({
        username: '',
        email: '',
        domains: [],
        role_name: ''
    });
    const [originalUser, setOriginalUser] = useState({});
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [authModalOpen, setAuthModalOpen] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/user/getCurrentUser?authToken=${authToken}`)
            .then(res => res.json())
            .then(data => {
                setUser({
                    username: data.username,
                    email: data.email,
                    domains: data.domains ? data.domains.split(',') : [],
                    role_name: data.role_name
                });
                setOriginalUser({
                    username: data.username,
                    email: data.email,
                    domains: data.domains ? data.domains.split(',') : [],
                    role_name: data.role_name
                });
            });
    }, []);

    useEffect(() => {
        const isChanged = JSON.stringify(user) !== JSON.stringify(originalUser) ||
            passwords.currentPassword || passwords.newPassword || passwords.confirmNewPassword;
        setIsDirty(isChanged);
    }, [user, passwords]);

    const handleDomainChange = (event, newValue) => {
        setUser({ ...user, domains: newValue });
    };

    const handleUpdateProfile = () => {
        setAuthModalOpen(true);
    };

    return (
        <Box sx={{
            p: 4,
            maxWidth: "40%",
            display: 'flex',       
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center',    
            height: '100vh',        
            margin: 'auto',          
            width: '100%'            
        }}>
            <Typography variant="h4">Account Information</Typography>
            <TextField
                margin="normal"
                fullWidth
                label="Username"
                value={user.username}
                InputProps={{
                    readOnly: true,
                }}
            />
            <TextField
                margin="normal"
                fullWidth
                label="Email"
                value={user.email}
                onChange={e => setUser({ ...user, email: e.target.value })}
            />
            <Autocomplete
                multiple
                options={[]}
                value={user.domains}
                onChange={handleDomainChange}
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                        <Chip key={index} label={option} {...getTagProps({ index })} />
                    ))
                }
                renderInput={(params) => (
                    <TextField
                        {...params}
                        variant="filled"
                        label="Domains"
                        placeholder="Add domains"
                    />
                )}
            />
            <TextField
                margin="normal"
                fullWidth
                label="Role"
                value={user.role_name}
                InputProps={{
                    readOnly: true,
                }}
            />
            <Button onClick={() => setChangePasswordOpen(!changePasswordOpen)}>
                Change Password
            </Button>
            {changePasswordOpen && (
                <Box>
                    <TextField
                        margin="normal"
                        fullWidth
                        type="password"
                        label="Current Password"
                        onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        type="password"
                        label="New Password"
                        onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        type="password"
                        label="Confirm New Password"
                        onChange={e => setPasswords({ ...passwords, confirmNewPassword: e.target.value })}
                    />
                </Box>
            )}
            <Button
                variant="contained"
                disabled={!isDirty}
                onClick={handleUpdateProfile}>
                Update Profile
            </Button>
            <AuthenticationModal
                open={authModalOpen}
                email={user.email}
                onClose={() => setAuthModalOpen(false)}
                authToken={authToken}
                onVerified={() => {
                    // Call updateUser API
                }}
            />
        </Box>
    );
};

export default AccountDashboard;
