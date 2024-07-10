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
import Blacklist from './Components/dashboard/DeviceManagement/Blacklist';
import { DashboardProvider } from './Components/dashboard/HoneyNet/DashboardContext';
import DownloadTools from './Components/DownloadTools';
import UtilizationGraphs from './Components/dashboard/UtilizationGraphs';
import CurrentMissions from './Components/dashboard/MissionPlanning/CurrentMissions';
import ManagePolicies from './Components/dashboard/PolicyManagement/ManagePolicies';
import AccountDashboard from './Components/dashboard/UserManagement/AccountDashboard';
import NewSetup from './Pages/NewSetup';

function App() {

  return (
    <BrowserRouter>
      <DashboardProvider>
        <Routes>
          <Route path='/' element={<Routing />} />
          <Route path='/signIn' element={<SignInPage />} />
          <Route path='/newSetup' element={<NewSetup />} />
          <Route path='/downloadTools' element={<Layout component={<AccessWrapper allowedUserTypes={['Mission Creator', 'Mission Supervisor']} component={<DownloadTools />} />} />}/>
          <Route path='/loggedIn' element={<Layout component={<AccessWrapper allowedUserTypes={['Mission Creator', 'Mission Supervisor', 'Mission Viewer']} component={<IntroDashboard />} />} />} />
          <Route path='/about' element={<Layout component={<AccessWrapper allowedUserTypes={['Mission Creator', 'Mission Supervisor', 'Mission Viewer']} component={<IntroDashboard />} />} />} />
          <Route path='/manageUsers' element={<Layout component={<AccessWrapper allowedUserTypes={['Mission Creator']} component={<ManageUsers />} />} />} />
          <Route path='/manageDevices' element={<Layout component={<AccessWrapper allowedUserTypes={['Mission Creator']} component={<DeviceManagement />} />} />} />
          <Route path='/managePolicies' element={<Layout component={<AccessWrapper allowedUserTypes={['Mission Creator', 'Mission Supervisor']} component={<ManagePolicies />} />} />} />
          <Route path='/planMissions' element={<Layout component={<AccessWrapper allowedUserTypes={['Mission Creator']} component={<MissionPlanner />} />} />} />
          <Route path='/currentMissions' element={<Layout component={<AccessWrapper allowedUserTypes={['Mission Creator', 'Mission Supervisor', 'Mission Viewer']} component={<CurrentMissions />} />} />} />
          <Route path='/honeypots' element={<Layout component={<AccessWrapper allowedUserTypes={['Mission Creator']} component={<HoneypotDashboard />} />} />} />
          <Route path='/attackMetrics' element={<Layout component={<AccessWrapper allowedUserTypes={['Mission Creator', 'Mission Supervisor', 'Mission Viewer']} component={<MetricsDashboard />} />} />} />
          <Route path='/blacklist' element={<Layout component={<AccessWrapper allowedUserTypes={['Mission Creator', 'Mission Supervisor']} component={<Blacklist />} />} />} />
          <Route path='/dashboard' element={<Layout component={<AccessWrapper allowedUserTypes={['Mission Creator', 'Mission Supervisor', 'Mission Viewer']} component={<UtilizationGraphs />} />} />} />
          <Route path='/account' element={<Layout component={<AccessWrapper allowedUserTypes={['Mission Creator', 'Mission Supervisor', 'Mission Viewer']} component={<AccountDashboard />} />} />} />

        </Routes>
      </DashboardProvider>
    </BrowserRouter>
  );
}

export default App;
