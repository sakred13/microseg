import React, { useState } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { MenuItem } from '@mui/material';
import Cookies from 'js-cookie';
import { API_URL } from '../../../config';
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';

const customStyles = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '80%',
    maxHeight: '80%',
    width: 'auto',
    height: 'auto',
    bgcolor: 'white',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    overflowY: 'auto',
};

const successStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'green',
};

const defaultTheme = createTheme();

const EditUserModal = ({ isOpen, setIsOpen, username, email, role, domains }) => {
    const [isSuccess, setIsSuccess] = useState(false);
    const [selectedDomains, setSelectedDomains] = useState(domains ? domains.split(',') : []);
    const [formData, setFormData] = useState({
        username: username || '',
        email: email || '',
        role: role || '',
    });
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim() || /\s/.test(formData.username) || /[^a-zA-Z0-9]/.test(formData.username)) {
            newErrors.username = 'Invalid username';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        }

        if (!formData.role) {
            newErrors.role = 'Role is required';
        }

        if (selectedDomains.length === 0) {
            newErrors.domains = 'At least one domain must be selected';
        }        

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0; // Return true if there are no errors
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (validateForm()) {
            const domainsString = selectedDomains.join(',');

            try {
                const response = await fetch(`${API_URL}/user/updateUser`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        authToken: Cookies.get('jwtToken'),
                        user: username,
                        updated_username: formData.username,
                        email_id: formData.email,
                        role: formData.role,
                        domains: domainsString,
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    setIsSuccess(true);
                    setTimeout(() => {
                        setIsSuccess(false);
                        setIsOpen(false);
                    }, 3000);
                } else {
                    console.error('Error updating user:', data.message);
                }
            } catch (error) {
                console.error('Error submitting form:', error);
            }
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });

        // Clear error message when the user starts typing
        setErrors({
            ...errors,
            [e.target.name]: '',
        });
    };

    return (
        <Modal
            open={isOpen}
            onClose={() => {
                setIsSuccess(false);
                setIsOpen(false);
            }}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={customStyles}>
                <ThemeProvider theme={defaultTheme}>
                    <Container component="main" maxWidth="xs">
                        <CssBaseline />
                        <Box
                            sx={{
                                marginTop: 3,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >
                            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}></Avatar>
                            <Typography component="h1" variant="h5">
                                Edit User Details
                            </Typography>
                            {!isSuccess && (
                                <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <TextField
                                                autoComplete="given-name"
                                                name="username"
                                                required
                                                fullWidth
                                                id="username"
                                                label="Username"
                                                autoFocus
                                                value={formData.username}
                                                onChange={handleChange}
                                                error={Boolean(errors.username)}
                                                helperText={errors.username}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                required
                                                fullWidth
                                                id="email"
                                                label="Email ID"
                                                name="email"
                                                autoComplete="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                error={Boolean(errors.email)}
                                                helperText={errors.email}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                select
                                                fullWidth
                                                required
                                                id="role"
                                                label="Role"
                                                name="role"
                                                value={formData.role}
                                                onChange={handleChange}
                                                error={Boolean(errors.role)}
                                                helperText={errors.role}
                                            >
                                                <MenuItem value="Mission Creator">Mission Creator</MenuItem>
                                                <MenuItem value="Mission Supervisor">Mission Supervisor</MenuItem>
                                                <MenuItem value="Mission Viewer">Mission Viewer</MenuItem>
                                            </TextField>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Autocomplete
                                                multiple
                                                id="domains"
                                                options={["Explosive Ordnance Reconnaissance", "Covert Operations Support", "Structural Integrity Assessment", "Crisis Response and Restoration"]}
                                                getOptionLabel={(option) => option}
                                                value={selectedDomains}
                                                onChange={(event, newValue) => {
                                                    setSelectedDomains(newValue);
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        variant="outlined"
                                                        label="Domains"
                                                        placeholder="Select Domains"
                                                        error={Boolean(errors.domains)}
                                                        helperText={errors.domains}
                                                    />
                                                )}
                                                renderTags={(value, getTagProps) =>
                                                    value.map((option, index) => (
                                                        <Chip key={index} label={option} {...getTagProps({ index })} />
                                                    ))
                                                }
                                            />
                                        </Grid>
                                    </Grid>
                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        sx={{ mt: 3, mb: 2 }}
                                    >
                                        Save Changes
                                    </Button>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="error"
                                        onClick={() => setIsOpen(false)}
                                        sx={{ mt: 1, mb: 2 }}
                                    >
                                        Cancel
                                    </Button>
                                </Box>
                            )}
                            {isSuccess && (
                                <Box sx={successStyles}>
                                    <CheckCircleOutlineIcon sx={{ fontSize: 120 }} />
                                    <Typography variant="h4" color="inherit">
                                        User Details Updated!
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Container>
                </ThemeProvider>
            </Box>
        </Modal>
    );
};

export default EditUserModal;
