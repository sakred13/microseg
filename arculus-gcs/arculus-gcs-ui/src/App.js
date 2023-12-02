import React, { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Route,
  Routes
} from 'react-router-dom'
import SignInPage from './Pages/SignIn';
import Routing from './Pages/Routing';
import { Layout } from './Pages/Layout';
import ManageUsers from './Components/dashboard/UserManagement/ManageUsers';
import DeviceManagement from './Components/dashboard/DeviceManagement/DeviceManagement';
import AccessWrapper from './Components/dashboard/Auth/AccessWrapper';
import MissionPlanner from './Components/dashboard/MissionPlanning/MissionPlanner';
import HoneypotDashboard from './Components/dashboard/HoneyNet/HoneypotDashboard';
import IntroDashboard from './Components/dashboard/IntroDashboard';
import MetricsDashboard from './Components/dashboard/HoneyNet/MetricsDashboard';
import { DashboardProvider } from './Components/dashboard/HoneyNet/DashboardContext';
import DeviceManagementTopology from './Components/dashboard/DeviceManagement/DeviceManagementTopology';
import DownloadTools from './Components/DownloadTools';

function App() {

  return (
    <BrowserRouter>
      <DashboardProvider>
        <Routes>
          <Route path='/' element={<Routing />} />
          <Route path='/signIn' element={<SignInPage />} />
          <Route path='/downloadTools' element={<DownloadTools />} />
          <Route path='/loggedIn' element={<Layout component={<AccessWrapper component={<IntroDashboard />} />} />} />
          <Route path='/dashboard' element={<Layout component={<AccessWrapper component={<IntroDashboard />} />} />} />
          <Route path='/manageUsers' element={<Layout component={<AccessWrapper component={<ManageUsers />} />} />} />
          <Route path='/manageDevices' element={<Layout component={<AccessWrapper component={<DeviceManagement />} />} />} />
          <Route path='/managePolicies' element={<Layout component={<AccessWrapper component={<DeviceManagementTopology />} />} />} />
          <Route path='/planMissions' element={<Layout component={<AccessWrapper component={<MissionPlanner />} />} />} />
          <Route path='/honeypots' element={<Layout component={<AccessWrapper component={<HoneypotDashboard />} />} />} />
          <Route path='/attackMetrics' element={<Layout component={<AccessWrapper component={<MetricsDashboard />} />} />} />

        </Routes>
      </DashboardProvider>
    </BrowserRouter>
  );
}

export default App;
