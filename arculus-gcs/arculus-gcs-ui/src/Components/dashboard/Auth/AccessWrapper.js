import React, { useState, useEffect } from 'react';
import NoAccess from './NoAccess'; // ... other imports ...
import Cookies from 'js-cookie';
import { API_URL } from '../../../config';

const AccessWrapper = (props) => {
    const [isLegitimateUser, setIsLegitimateUser] = useState(false);
    const [userType, setUserType] = useState(null); // State to hold the user type
    const [userTypeLoaded, setUserTypeLoaded] = useState(false);
    const [error, setError] = useState(null);

    var pendingActions = props.pendingActions;
    const allowedUserTypes = props.allowedUserTypes;

    useEffect(() => {
        const checkUserStatus = async () => {
            try {
                const response = await fetch(`${API_URL}/auth/authorize?authToken=${encodeURIComponent(Cookies.get('jwtToken'))}`);
                if (response.ok) {
                    const data = await response.json();
                    const retrievedUserType = data.userType;
                    setUserType(retrievedUserType); // Store the user type in state

                    if (allowedUserTypes.includes(retrievedUserType)) {
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
    }, [allowedUserTypes]); // Dependency array includes allowedUserTypes

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    if (!userTypeLoaded) {
        return <div>Loading...</div>;
    }

    // Clone the child component and pass both pendingActions and userType as props
    const componentWithProps = React.cloneElement(props.component, { pendingActions, userType });

    return (
        <React.Fragment>
            {isLegitimateUser ? componentWithProps : <NoAccess />}
        </React.Fragment>
    );
};

export default AccessWrapper;