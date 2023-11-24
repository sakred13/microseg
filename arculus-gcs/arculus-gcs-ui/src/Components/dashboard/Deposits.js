import * as React from 'react';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Title from './Title';

function preventDefault(event) {
  event.preventDefault();
}

export default function Deposits() {
  return (
    <React.Fragment>
      <Title>Recent Attacks</Title>
      <Typography component="p" variant="h4">
        3,024
      </Typography>
      <Typography color="text.secondary" sx={{ flex: 1 }}>
        on 24 November, 2023
      </Typography>
      <div>
        <Link color="primary" href="#" onClick={preventDefault}>
          View Blacklisted IPs
        </Link>
      </div>
    </React.Fragment>
  );
}
