import * as React from 'react';
import { Dashboard } from './dashboard/Dashboard';
import { Layout } from '../Pages/Layout';

function Dash() {

  return (
    <div><Layout component={<Dashboard/>}/></div>
  );
}

export default Dash;
