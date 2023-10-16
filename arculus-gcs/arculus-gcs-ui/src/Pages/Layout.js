import * as React from 'react';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import HiveIcon from '@mui/icons-material/Hive';
import EdgesensorHighIcon from '@mui/icons-material/EdgesensorHigh';
import SecurityIcon from '@mui/icons-material/Security';
import { API_URL } from '../config';

const drawerWidth = 240;
const pendingActions = ["pendingAction1", "pendingAction2", "pendingAction3", "pendingAction4", "pendingAction5"];
const pendingActionsCount = pendingActions.length;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: 'border-box',
      ...(!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(9),
        },
      }),
    },
  }),
);

const defaultTheme = createTheme();

export function Layout(props) {
  const [open, setOpen] = React.useState(true);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const navigate = useNavigate();

  const handleSignOut = () => {
    Cookies.remove('jwtToken');
    navigate('/signIn');
  };

  useEffect(() => {
    const token = Cookies.get('jwtToken');
    if (!token) {
      navigate('/signIn');
      return;
    }

    const checkAdminStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/api/authorizeAdmin?authToken=${encodeURIComponent(token)}`);

        if (response.ok) {
          setIsAdmin(true);
        } else if (response.status === 403) {
          setIsAdmin(false);
        } else {
          throw new Error(`Error: ${response.status}`);
        }
      } catch (error) {
        console.error('Error checking admin status:', error.message);
      }
    };


    checkAdminStatus();
  }, [navigate]);

  const handleManageClick = (page) => {
    navigate(page);
  };

  const toggleDrawer = () => {
    setOpen(!open);
  };

  if (!Cookies.get('jwtToken')) {
    navigate('/signIn');
    return null;
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="absolute" open={open}>
          <Toolbar
            sx={{
              pr: '24px',
            }}
          >
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{
                marginRight: '36px',
                ...(open && { display: 'none' }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <img
              src="logo.png"
              alt="VIMAN Logo"
              style={{ marginRight: '10px', maxWidth: '30px', maxHeight: '30px' }}
            />
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              VIMAN Ground Control Client
            </Typography>
            <IconButton color="inherit">
              <Badge badgeContent={pendingActionsCount} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" open={open}>
          <Toolbar
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              px: [1],
            }}
          >
            {open && <Typography variant="h6" align="center">Welcome {Cookies.get('user')}</Typography>}
            <IconButton onClick={toggleDrawer}>
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>
          <Divider />
          <List component="nav">
            <ListItemButton onClick={() => handleManageClick('/dashboard')}>
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>
            <ListItemButton>
              <ListItemIcon>
                <AccountCircleIcon />
              </ListItemIcon>
              <ListItemText primary="Account" />
            </ListItemButton>
            {isAdmin && (
              <ListItemButton onClick={() => handleManageClick('/manageUsers')}>
                <ListItemIcon>
                  <PeopleIcon />
                </ListItemIcon>
                <ListItemText primary="Manage Users" />
              </ListItemButton>
            )}
            {isAdmin && (
              <ListItemButton onClick={() => handleManageClick('/manageDevices')}>
                <ListItemIcon>
                  <EdgesensorHighIcon />
                </ListItemIcon>
                <ListItemText primary="Manage Edge Devices" />
              </ListItemButton>
            )}
            {isAdmin && (
              <ListItemButton onClick={() => handleManageClick('/managePolicies')}>
                <ListItemIcon>
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText primary="Manage Policies" />
              </ListItemButton>
            )}
            {isAdmin && (
              <ListItemButton onClick={() => handleManageClick('/noAccess')}>
                <ListItemIcon>
                  <HiveIcon />
                </ListItemIcon>
                <ListItemText primary="Deploy Honeypots" />
              </ListItemButton>
            )}
            <ListItemButton>
              <ListItemIcon>
                <BarChartIcon />
              </ListItemIcon>
              <ListItemText primary="Metrics" />
            </ListItemButton>
            <ListItemButton onClick={handleSignOut}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Sign Out" />
            </ListItemButton>
          </List>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ flexGrow: 1 }} />
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, height: '100vh', overflow: 'auto', marginTop: '100px' }}>
          {props.component}
        </Box>
      </Box>
    </ThemeProvider>
  );
}