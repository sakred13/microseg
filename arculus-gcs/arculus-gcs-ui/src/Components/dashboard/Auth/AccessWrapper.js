import React, { useState, useEffect } from 'react';
import NoAccess from './NoAccess';// ... other imports ...
import Cookies from 'js-cookie';
import { API_URL } from '../../../config';

const AccessWrapper = (props) => {
    const [isAdmin, setIsAdmin] = useState(null);
    var pendingActions = props.pendingActions;
    const componentWithProps = React.cloneElement(props.component, { pendingActions });

    console.log('PA: ', props.pendingActions);
    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                const response = await fetch(`${API_URL}/api/authorizeAdmin?authToken=${encodeURIComponent(Cookies.get('jwtToken'))}`);

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
            {isAdmin ? componentWithProps : <NoAccess />}
        </React.Fragment>
    );
};

export default AccessWrapper;