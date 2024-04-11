import React, { useState, useEffect } from 'react';
import NoAccess from './NoAccess'; // ... other imports ...
import Cookies from 'js-cookie';
import { API_URL } from '../../../config';

const AccessWrapper = (props) => {
    const [isLegitimateUser, setIsLegitimateUser] = useState(false);
    const [userTypeLoaded, setUserTypeLoaded] = useState(false); // Track if user type has been loaded
    const [error, setError] = useState(null);

    var pendingActions = props.pendingActions;
    const componentWithProps = React.cloneElement(props.component, { pendingActions });
    const allowedUserTypes = props.allowedUserTypes;

    useEffect(() => {
        const checkUserStatus = async () => {
            try {
                const response = await fetch(`${API_URL}/auth/authorize?authToken=${encodeURIComponent(Cookies.get('jwtToken'))}`);

                if (response.ok) {
                    const data = await response.json();
                    const userType = data.userType;

                    if (allowedUserTypes.includes(userType)) {
                        setIsLegitimateUser(true);
                    } else {
                        setIsLegitimateUser(false);
                    }
                } else {
                    throw new Error(`Error: ${response.status}`);
                }
            } catch (error) {
                setError(error);
            } finally {
                setUserTypeLoaded(true); // Mark that user type has been loaded whether there was an error or not
            }
        };

        checkUserStatus();
    }, [allowedUserTypes]); // Include allowedUserTypes in the dependency array

    if (error) {
        // Handle error condition
        return <div>Error: {error.message}</div>;
    }

    if (!userTypeLoaded) {
        // Still loading user type, you can render a loading spinner or some indication
        return <div>Loading...</div>;
    }

    return (
        <React.Fragment>
            {isLegitimateUser ? componentWithProps : <NoAccess />}
        </React.Fragment>
    );
};

export default AccessWrapper;
