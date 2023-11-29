const fs = require('fs-extra');

const { isAdminUser, getUserFromToken } = require('./authService');
const proxyConfig = JSON.parse(fs.readFileSync('configs/proxy_config.json'));

exports.honeyPotApi = async (req, res) => {
    try {
        const { authToken } = req.query;

        // Check if the user has an admin role
        isAdminUser(getUserFromToken(authToken), async (roleErr, isAdmin) => {
            if (roleErr) {
                console.error(roleErr);
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            if (isAdmin) {
                // Extract the path after '/honeypot-api/' to use in the proxy URL
                const apiPath = req.params[0];

                // Create the full URL to the honeypot service API
                const honeypotApiUrl = `${proxyConfig.honeyNetDomain}/${apiPath}`;

                // Make a request to the honeypot API, forwarding the HTTP method
                const response = await axios({
                    method: req.method,
                    url: honeypotApiUrl,
                    headers: {
                        'Authorization': 'Bearer YOUR_API_KEY', // Add any required headers here
                        // Other headers as needed to mimic the dashboard request
                    },
                    data: req.body, // Include request body if present (for POST and PUT requests)
                });

                // Forward the honeypot service response to the client
                res.status(response.status).json(response.data);
            } else {
                return res.status(403).json({ message: 'Unauthorized: Only users with admin role can access the honeypot API' });
            }
        });
    } catch (error) {
        console.error('Error calling honeypot API:', error);
        res.status(500).json({ error: 'Proxy error' });
    }
};

