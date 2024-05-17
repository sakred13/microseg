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
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import HiveIcon from '@mui/icons-material/Hive';
import EdgesensorHighIcon from '@mui/icons-material/EdgesensorHigh';
import SecurityIcon from '@mui/icons-material/Security';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import PublicOffIcon from '@mui/icons-material/PublicOff';
import InfoIcon from '@mui/icons-material/Info';
import { API_URL } from '../config';
import { useState, useEffect } from 'react';
import ZtModeDropdown from '../Components/dashboard/ZtModeDropdown';
import { useLocation } from 'react-router-dom';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import Popover from '@mui/material/Popover';
import IncidentsDotPlot from '../Components/dashboard/Incidents/IncidentsDotPlot';

const drawerWidth = 260;

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
  const [userType, setUserType] = React.useState(null);
  const [pendingActions, setPendingActions] = useState({});
  const [pendingActionsCount, setPendingActionsCount] = useState(0);
  const [announcementCount, setAnnouncementCount] = useState(1); // State for announcement count
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const popoverOpen = Boolean(anchorEl);

  // Initialize ztMode from localStorage or default value
  const [ztMode, setZtMode] = useState(localStorage.getItem('ztMode') || 'no_zt');

  useEffect(() => {
    const ws = new WebSocket(`${API_URL.replace('http://', 'ws://').replace(':3001', ':3003')}/joinRequests`);
    ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      setPendingActions(data);
      setPendingActionsCount(Object.keys(data).length);
    });

    return () => {
      ws.close();
    };
  }, []);

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

    const checkUserStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/authorize?authToken=${encodeURIComponent(token)}`);

        if (response.ok) {
          const data = await response.json(); // Parse the response body
          setUserType(data.userType);
          setZtMode(data.mode);

          // Store ztMode in localStorage
          localStorage.setItem('ztMode', data.mode);
        } else if (response.status === 403) {
          setUserType(null);
        } else {
          throw new Error(`Error: ${response.status}`);
        }
      } catch (error) {
        console.error('Error checking user status:', error.message);
      }
    };

    checkUserStatus();
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

  // Pass pendingActions as a prop to the DeviceManagement component
  const componentWithProps = React.cloneElement(props.component, { pendingActions });

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
              ARCULUS GROUND CONTROL CLIENT
            </Typography>
            <ZtModeDropdown currentMode={ztMode} />
            <IconButton color="inherit" onClick={() => handleManageClick('/manageDevices')}>
              <Badge badgeContent={'' + pendingActionsCount} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton color="inherit" onClick={handlePopoverOpen}>
              <Badge badgeContent={announcementCount} color="error">
                <AnnouncementIcon />
              </Badge>
            </IconButton>
            <Popover
              open={popoverOpen}
              anchorEl={anchorEl}
              onClose={handlePopoverClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
            >
              <Box sx={{
                p: 2,
                minWidth: 350,
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <IncidentsDotPlot />
              </Box>
            </Popover>
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
            <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              {userType && ['Mission Creator', 'Mission Supervisor', 'Mission Viewer'].includes(userType) && (
                <ListItemButton onClick={() => handleManageClick('/dashboard')} selected={location.pathname === '/dashboard'} sx={{
                  backgroundColor: location.pathname === '/dashboard' ? '#f0f0f0' : 'transparent',
                  '&:hover': {
                    backgroundColor: '#f0f0f0',
                  },
                }}>
                  <ListItemIcon>
                    <DashboardIcon />
                  </ListItemIcon>
                  <ListItemText primary="Dashboard" />
                </ListItemButton>
              )}
              {userType && ['Mission Creator', 'Mission Supervisor', 'Mission Viewer'].includes(userType) && (
                <ListItemButton onClick={() => handleManageClick('/account')} selected={location.pathname === '/account'} sx={{
                  backgroundColor: location.pathname === '/account' ? '#f0f0f0' : 'transparent',
                  '&:hover': {
                    backgroundColor: '#f0f0f0',
                  },
                }}>
                  <ListItemIcon>
                    <AccountCircleIcon />
                  </ListItemIcon>
                  <ListItemText primary="Account" />
                </ListItemButton>
              )}
              {userType && ['Mission Creator'].includes(userType) && (
                <ListItemButton onClick={() => handleManageClick('/manageUsers')} selected={location.pathname === '/manageUsers'} sx={{
                  backgroundColor: location.pathname === '/manageUsers' ? '#f0f0f0' : 'transparent',
                  '&:hover': {
                    backgroundColor: '#f0f0f0',
                  },
                }}>

                  <ListItemIcon>
                    <PeopleIcon />
                  </ListItemIcon>
                  <ListItemText primary="Manage Users" />
                </ListItemButton>
              )}
              {userType && ['Mission Creator'].includes(userType) && (
                <ListItemButton onClick={() => handleManageClick('/manageDevices')} selected={location.pathname === '/manageDevices'} sx={{
                  backgroundColor: location.pathname === '/manageDevices' ? '#f0f0f0' : 'transparent',
                  '&:hover': {
                    backgroundColor: '#f0f0f0',
                  },
                }}>

                  <ListItemIcon>
                    <EdgesensorHighIcon />
                  </ListItemIcon>
                  <ListItemText primary="Manage Edge Devices" />
                </ListItemButton>
              )}
              {userType && ['Mission Creator', 'Mission Supervisor'].includes(userType) && (
                <ListItemButton onClick={() => handleManageClick('/downloadTools')} selected={location.pathname === '/downloadTools'} sx={{
                  backgroundColor: location.pathname === '/downloadTools' ? '#f0f0f0' : 'transparent',
                  '&:hover': {
                    backgroundColor: '#f0f0f0',
                  },
                }}>

                  <ListItemIcon>
                    <img src='/cluster.png' alt="Add Nodes" style={{ width: '24px', height: '24px' }} />
                  </ListItemIcon>
                  <ListItemText primary="Add Nodes" />
                </ListItemButton>
              )}
              {userType && ['Mission Creator', 'Mission Supervisor'].includes(userType) && (
                <ListItemButton onClick={() => handleManageClick('/managePolicies')} selected={location.pathname === '/managePolicies'} sx={{
                  backgroundColor: location.pathname === '/managePolicies' ? '#f0f0f0' : 'transparent',
                  '&:hover': {
                    backgroundColor: '#f0f0f0',
                  },
                }}>

                  <ListItemIcon>
                    <SecurityIcon />
                  </ListItemIcon>
                  <ListItemText primary="Manage Policies" />
                </ListItemButton>
              )}
              {userType && ['Mission Creator'].includes(userType) && (
                <ListItemButton onClick={() => handleManageClick('/planMissions')} selected={location.pathname === '/planMissions'} sx={{
                  backgroundColor: location.pathname === '/planMissions' ? '#f0f0f0' : 'transparent',
                  '&:hover': {
                    backgroundColor: '#f0f0f0',
                  },
                }}>
                  <ListItemIcon>
                    <AssignmentIcon />
                  </ListItemIcon>
                  <ListItemText primary="Plan Missions" />
                </ListItemButton>
              )}
              {userType && ['Mission Creator', 'Mission Supervisor', 'Mission Viewer'].includes(userType) && (
                <ListItemButton onClick={() => handleManageClick('/currentMissions')} selected={location.pathname === '/currentMissions'} sx={{
                  backgroundColor: location.pathname === '/currentMissions' ? '#f0f0f0' : 'transparent',
                  '&:hover': {
                    backgroundColor: '#f0f0f0',
                  },
                }}>
                  <ListItemIcon>
                    <WhatshotIcon />
                  </ListItemIcon>
                  <ListItemText primary="Mission Executions" />
                </ListItemButton>
              )}
              {userType && ['Mission Creator'].includes(userType) && (
                <ListItemButton onClick={() => handleManageClick('/honeypots')} selected={location.pathname === '/honeypots'} sx={{
                  backgroundColor: location.pathname === '/honeypots' ? '#f0f0f0' : 'transparent',
                  '&:hover': {
                    backgroundColor: '#f0f0f0',
                  },
                }}>

                  <ListItemIcon>
                    <HiveIcon />
                  </ListItemIcon>
                  <ListItemText primary="Deploy Honeypots" />
                </ListItemButton>
              )}
              {userType && ['Mission Creator', 'Mission Supervisor', 'Mission Viewer'].includes(userType) && (
                <ListItemButton onClick={() => handleManageClick('/attackMetrics')} selected={location.pathname === '/attackMetrics'} sx={{
                  backgroundColor: location.pathname === '/attackMetrics' ? '#f0f0f0' : 'transparent',
                  '&:hover': {
                    backgroundColor: '#f0f0f0',
                  },
                }}>

                  <ListItemIcon>
                    <BarChartIcon />
                  </ListItemIcon>
                  <ListItemText primary="Attack Metrics" />
                </ListItemButton>
              )}
              {userType && ['Mission Creator', 'Mission Supervisor'].includes(userType) && (
                <ListItemButton onClick={() => handleManageClick('/blacklist')} selected={location.pathname === '/blacklist'} sx={{
                  backgroundColor: location.pathname === '/blacklist' ? '#f0f0f0' : 'transparent',
                  '&:hover': {
                    backgroundColor: '#f0f0f0',
                  },
                }}>

                  <ListItemIcon>
                    <PublicOffIcon />
                  </ListItemIcon>
                  <ListItemText primary="Blacklist" />
                </ListItemButton>
              )}
            </Box>
            <Divider sx={{ my: 1 }} />
            <ListItemButton onClick={() => handleManageClick('/about')} selected={location.pathname === '/about'} sx={{
              backgroundColor: location.pathname === '/about' ? '#f0f0f0' : 'transparent',
              '&:hover': {
                backgroundColor: '#f0f0f0',
              },
            }}>
              <ListItemIcon>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="About Arculus" />
            </ListItemButton>
            <ListItemButton onClick={handleSignOut}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Sign Out" />
            </ListItemButton>
          </List>
          <Box sx={{ flexGrow: 1 }} />
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, overflow: 'auto', marginTop: '100px' }}>
          {componentWithProps}
        </Box>
      </Box>
    </ThemeProvider >
  );
}
