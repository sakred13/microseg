import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HiveIcon from '@mui/icons-material/Hive';
import EdgesensorHighIcon from '@mui/icons-material/EdgesensorHigh';

export const mainListItems = (
  <React.Fragment>
    <ListItemButton>
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
    <ListItemButton>
      <ListItemIcon>
        <PeopleIcon />
      </ListItemIcon>
      <ListItemText primary="Manage Users" />
    </ListItemButton>
    <ListItemButton>
      <ListItemIcon>
        <BarChartIcon />
      </ListItemIcon>
      <ListItemText primary="Metrics" />
    </ListItemButton>
    <ListItemButton>
      <ListItemIcon>
        <HiveIcon />
      </ListItemIcon>
      <ListItemText primary="Deploy Honeypots" />
    </ListItemButton>
    <ListItemButton>
      <ListItemIcon>
        <EdgesensorHighIcon />
      </ListItemIcon>
      <ListItemText primary="Manage Edge Devices" />
    </ListItemButton>
  </React.Fragment>
);

export const secondaryListItems = (
  <React.Fragment>
    <ListSubheader component="div" inset>
      Saved reports
    </ListSubheader>
    <ListItemButton>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary="Current month" />
    </ListItemButton>
    <ListItemButton>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary="Last quarter" />
    </ListItemButton>
    <ListItemButton>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary="Year-end sale" />
    </ListItemButton>
  </React.Fragment>
);

