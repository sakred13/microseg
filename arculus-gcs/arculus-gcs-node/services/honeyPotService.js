const fs = require('fs-extra');
const axios = require('axios');

const { isUserOfType, getUserFromToken } = require('./authService');
const honeypotConfig = JSON.parse(fs.readFileSync('configs/honeypot_config.json'));
const deployedHoneypots = [];

exports.createHoneyPot = async (req, res) => {
    try {
        const { authToken } = req.query;

        // Check if the user has an admin role
        isUserOfType(getUserFromToken(authToken), ['Mission Creator'], async (roleErr, isAdmin) => {
            if (roleErr) {
                console.error(roleErr);
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            if (isAdmin) {
                const { honeypotTarget, honeypotType } = req.query;

                // Check if the request is a duplicate by comparing with deployedHoneypots
                const isDuplicate = deployedHoneypots.some((honeypot) =>
                    honeypot.honeypotTarget === honeypotTarget && honeypot.honeypotType === honeypotType
                );

                if (isDuplicate) {
                    // Send a response indicating that it's a duplicate request
                    return res.status(400).json({ message: 'Duplicate request: Honeypot already deployed with the same target and type' });
                }

                // Create the full URL to the honeypot service API
                const honeypotApiUrl = `http://${honeypotTarget}:5000/deployHoneyPot`;
                console.log("honey: ", honeypotApiUrl);

                // Make a request to the honeypot API, forwarding the HTTP method and query parameters
                try {
                    const response = await axios({
                        method: req.method,
                        url: honeypotApiUrl,
                        headers: {
                            // Other headers as needed to mimic the dashboard request
                        },
                        data: {
                            url: honeypotConfig.url,
                            deployKey: honeypotConfig.deployKey,
                            potType: honeypotType
                        }, // Include request body if present (for POST and PUT requests)
                    });

                    // Check if the API call was successful
                    if (response.status === 200) {
                        // Store the details of the deployed honeypot in the global variable
                        const deployedHoneypot = {
                            honeypotTarget,
                            honeypotType,
                            // You can add more details here if needed
                        };
                        deployedHoneypots.push(deployedHoneypot);
                        console.log("Deployed: ", deployedHoneypots);
                    }

                    // Forward the honeypot service response to the client
                    res.status(response.status).json(response.data);
                } catch (error) {
                    // Handle errors from the external API
                    console.error('Error calling honeypot API:', error);

                    // Return the error response to the client
                    res.status(error.response ? error.response.status : 500).json({ error: 'Internal Server Error' });
                }
            } else {
                return res.status(403).json({ message: 'Unauthorized: Only users with admin role can access the honeypot API' });
            }
        });
    } catch (error) {
        console.error('Error calling honeypot API:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.undeployHoneypot = async (req, res) => {
    try {
        const { authToken } = req.query;

        // Check if the user has an admin role
        isUserOfType(getUserFromToken(authToken), ['Mission Creator'], async (roleErr, isAdmin) => {
            if (roleErr) {
                console.error(roleErr);
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            if (isAdmin) {
                const { honeypotTarget, honeypotType } = req.query;

                // Find the deployed honeypot based on the target and type
                const deployedHoneypotIndex = deployedHoneypots.findIndex((honeypot) =>
                    honeypot.honeypotTarget === honeypotTarget && honeypot.honeypotType === honeypotType
                );

                if (deployedHoneypotIndex === -1) {
                    return res.status(404).json({ message: 'Honeypot not found' });
                }

                // Create the full URL to the honeypot service API
                const honeypotApiUrl = `http://${honeypotTarget}:5000/undeployHoneypot`;

                // Make a request to the honeypot API to undeploy the honeypot
                try {
                    const response = await axios({
                        method: 'DELETE',
                        url: honeypotApiUrl,
                        headers: {
                            // Other headers as needed to mimic the dashboard request
                        },
                        data: {
                            url: honeypotConfig.url,
                            potType: honeypotType
                        },
                    });

                    // Check if the API call was successful
                    if (response.status === 200) {
                        // Remove the deployed honeypot from the global variable
                        deployedHoneypots.splice(deployedHoneypotIndex, 1);
                        console.log("Undeployed: ", deployedHoneypots);
                    }

                    // Forward the honeypot service response to the client
                    res.status(response.status).json(response.data);
                } catch (error) {
                    // Handle errors from the external API
                    console.error('Error calling honeypot API:', error);

                    // Return the error response to the client
                    res.status(error.response ? error.response.status : 500).json({ error: 'Internal Server Error' });
                }
            } else {
                return res.status(403).json({ message: 'Unauthorized: Only users with admin role can undeploy honeypots' });
            }
        });
    } catch (error) {
        console.error('Error calling honeypot API:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getDeployedHoneypots = async (req, res) => {
    try {
        const { authToken } = req.query;

        // Check if the user has an admin role
        isUserOfType(getUserFromToken(authToken), ['Mission Creator'], (roleErr, isAdmin) => {
            if (roleErr) {
                console.error(roleErr);
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            if (isAdmin) {
                // Return the deployed honeypots if the user is an admin
                return res.status(200).json({ deployedHoneypots });
            } else {
                return res.status(403).json({ message: 'Unauthorized: Only users with admin role can access the deployed honeypots' });
            }
        });
    } catch (error) {
        console.error('Error getting deployed honeypots:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

