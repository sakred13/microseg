import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { API_URL } from '../config';

function SignIn() {
  const [jwtToken, setJwtToken] = useState(null);
  const [errorText, setErrorText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (jwtToken) {
      setTimeout(() => {
        navigate('/loggedIn');
      }, 0);
    }
  }, [jwtToken, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const requestBody = {
      username: data.get('username'),
      password: data.get('password'),
    };

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (response.ok) {
        setJwtToken(result.jwtToken);
        Cookies.set('jwtToken', result.jwtToken);
        Cookies.set('user', result.user);
        setErrorText('');
      } else {
        if (response.status === 401) {
          setErrorText('Invalid Credentials');
        } else {
          setErrorText(result.message);
        }
      }
    } catch (error) {
      console.error('Error during login:', error.message);
      setErrorText('An unexpected error occurred.');
    }
  };

  return (
    <ThemeProvider theme={createTheme()}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <img src="titled-logo.png" alt="Logo" style={{ width: '100px', height: '100px' }} />
          <img src="CERI-Logo.png" alt="Logo" style={{ width: '317px', height: '100px', marginLeft: '16px' }} />
        </Box>

        <Box
          sx={{
            marginTop: 7, // Adjusted marginTop
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
            />
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
            {errorText && (
              <Typography variant="body2" color="error" align="center">
                {errorText}
              </Typography>
            )}
            <Grid container>
              <Grid item xs>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Box mt={8}>
          <Typography variant="body2" color="text.secondary" align="center">
            {/* {'Copyright © '} */}
            <Link color="inherit" href="https://engineering.missouri.edu/departments/eecs/">
              EECS Dept., University of Missouri
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default SignIn;
