import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import {
  BrowserRouter,
  Route, 
  Routes
} from 'react-router-dom'
import SignInPage from './Pages/SignIn';
import Dash from './Components/Dash';
import Routing from './Pages/Routing';
import { Layout } from './Pages/Layout';
import ManageUsers from './Components/dashboard/UserManagement/ManageUsers';
import DeviceManagement from './Components/dashboard/DeviceManagement/DeviceManagement';
import NoAccess from './Components/dashboard/Auth/NoAccess';
import AccessWrapper from './Components/dashboard/Auth/AccessWrapper';

function App() {

  return (
    <BrowserRouter>
      <Routes>
          <Route path='/'   element={<Routing/>} />
          <Route path='/signIn'   element={<SignInPage/>} />
          <Route path='/loggedIn'   element={<div><Dash/></div>} />
          <Route path='/dashboard'   element={<div><Dash/></div>} />
          <Route path='/manageUsers'   element={<Layout component={<AccessWrapper component={<ManageUsers/>}/>}/>}/>
          <Route path='/manageDevices'   element={<Layout component={<AccessWrapper component={<DeviceManagement/>}/>}/>}/>
          <Route path='/managePolicies'   element={<Layout component={<AccessWrapper component={<DeviceManagement/>}/>}/>}/>
          <Route path='/noAccess'   element={<Layout component={<NoAccess/>}/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
