const fs = require('fs-extra');
const axios = require('axios');

const { isUserOfType, getUserFromToken } = require('./authService');
const proxyConfig = JSON.parse(fs.readFileSync('configs/honeypot_config.json'));

exports.honeyPotApi = async (req, res) => {
    try {
        const { authToken, ...queryParams } = req.query; // Destructure authToken and collect the rest in queryParams
        console.log('WebToken: ', authToken);
        // Check if the user has an admin role
        isUserOfType(getUserFromToken(authToken), ['Mission Creator'], async (roleErr, isAdmin) => {
            if (roleErr) {
                console.error(roleErr);
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            if (isAdmin) {
                // Extract the path after '/honeypot-api/' to use in the proxy URL
                const apiPath = req.params[0];

                // Create the full URL to the honeypot service API
                const honeypotApiUrl = `http://${proxyConfig.honeyNetDomain}/${apiPath}`;
                console.log("honey: ", honeypotApiUrl);

                // Make a request to the honeypot API, forwarding the HTTP method and query parameters
                try {
                    const response = await axios({
                        method: req.method,
                        url: honeypotApiUrl,
                        params: queryParams, // Pass query parameters to the honeypot service
                        headers: {
                            apikey: proxyConfig.apikey
                            // Other headers as needed to mimic the dashboard request
                        },
                        data: req.body, // Include request body if present (for POST and PUT requests)
                    });

                    // Forward the honeypot service response to the client
                    res.status(response.status).json(response.data);
                } catch (error) {
                    // Handle errors from the external API
                    console.error('Error calling honeypot API:', error);

                    // Return the error response to the client
                    res.status(error.response ? error.response.status : 500).json({ error: 'Proxy error' });
                }
            } else {
                return res.status(403).json({ message: 'Unauthorized: Only users with admin role can access the honeypot API' });
            }
        });
    } catch (error) {
        console.error('Error calling honeypot API:', error);
        res.status(500).json({ error: 'Proxy error' });
    }
};

