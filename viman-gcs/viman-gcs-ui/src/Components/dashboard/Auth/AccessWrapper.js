import React, { useState, useEffect } from 'react';
import NoAccess from './NoAccess';// ... other imports ...
import DeviceManagement from '../DeviceManagement/DeviceManagement';
import Cookies from 'js-cookie';

const AccessWrapper = (props) => {
    const [isAdmin, setIsAdmin] = useState(null);

    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/authorizeAdmin?authToken=${encodeURIComponent(Cookies.get('jwtToken'))}`);

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
    }, []);  // Run this effect only once when the component mounts

    if (isAdmin === null) {
        // Still loading, you can render a loading spinner or some indication
        return <div>Loading...</div>;
    }

    return (
        <React.Fragment>
            {isAdmin ? props.component : <NoAccess />}
        </React.Fragment>
    );
};

export default AccessWrapper;
