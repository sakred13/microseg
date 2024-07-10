import React, { useState } from 'react';
import { Box, Typography, Avatar, Button, CssBaseline, TextField, Grid, Container, ThemeProvider, createTheme, MenuItem, Chip, Autocomplete } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Cookies from 'js-cookie';
import { API_URL } from '../config';
import { useNavigate } from 'react-router-dom';

const defaultTheme = createTheme();

const NewSetup = () => {
    const [isSuccess, setIsSuccess] = useState(false);
    const [selectedDomains, setSelectedDomains] = useState([]);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        role: 'Mission Creator',  // Role locked as "Mission Creator"
        password: '',
        retype_password: '',
    });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();  // Initialize the useNavigate hook

    const validateForm = () => {
        let newErrors = {};

        if (!formData.username.trim() || /\s/.test(formData.username) || /[^a-zA-Z0-9]/.test(formData.username)) {
            newErrors.username = 'Invalid username';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        }

        if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters long';
        }

        if (formData.password !== formData.retype_password) {
            newErrors.retype_password = 'Passwords do not match';
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
            const userData = {
                jwtToken: Cookies.get("jwtToken"),
                username: formData.username,
                email: formData.email,
                role: formData.role,
                password: formData.password,
                domains: domainsString,
            };

            try {
                const response = await fetch(`${API_URL}/auth/signup`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(userData),
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }

                setIsSuccess(true);
                setTimeout(() => {
                    navigate('/');  // Redirect to the root address
                }, 3000);  // Delay for 3 seconds to display the success message
            } catch (error) {
                console.error('Error creating user:', error.message);
            }
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });

        setErrors({
            ...errors,
            [e.target.name]: '',
        });
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}></Avatar>
                    <Typography component="h1" variant="h5">
                        Welcome to Arculus! Get Started!
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
                                        fullWidth
                                        id="role"
                                        label="Role"
                                        name="role"
                                        value={formData.role}
                                        InputProps={{
                                            readOnly: true,
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Autocomplete
                                        multiple
                                        id="domains"
                                        options={["Explosive Ordnance Reconnaissance", "Covert Operations Support", "Structural Integrity Assessment", "Crisis Response and Restoration"]}
                                        value={selectedDomains}
                                        onChange={(event, newValue) => {
                                            setSelectedDomains(newValue);
                                        }}
                                        isOptionEqualToValue={(option, value) => option === value}
                                        renderTags={(value, getTagProps) =>
                                            value.map((option, index) => (
                                                <Chip key={index} label={option} {...getTagProps({ index })} />
                                            ))
                                        }
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Domains"
                                                placeholder="Select Domains"
                                                error={Boolean(errors.domains)}
                                                helperText={errors.domains}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        name="password"
                                        label="Password"
                                        type="password"
                                        id="password"
                                        autoComplete="new-password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        error={Boolean(errors.password)}
                                        helperText={errors.password}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        name="retype_password"
                                        label="Re-enter Password"
                                        type="password"
                                        id="password2"
                                        autoComplete="new-password"
                                        value={formData.retype_password}
                                        onChange={handleChange}
                                        error={Boolean(errors.retype_password)}
                                        helperText={errors.retype_password}
                                    />
                                </Grid>
                            </Grid>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                            >
                                Create User
                            </Button>
                        </Box>
                    )}
                    {isSuccess && (
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'green',
                            textAlign: 'center',  // This will ensure the text is centered
                        }}>
                            <CheckCircleOutlineIcon sx={{ fontSize: 120 }} />
                            <Typography variant="h4" color="inherit" sx={{ textAlign: 'center' }}>
                                User Created! Redirecting...
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Container>
        </ThemeProvider>
    );
};

export default NewSetup;
