const fs = require('fs-extra');
const axios = require('axios');

const { isAdminUser, getUserFromToken } = require('./authService');
const proxyConfig = JSON.parse(fs.readFileSync('configs/proxy_config.json'));

exports.honeyPotApi = async (req, res) => {
    try {
        const { authToken, ...queryParams } = req.query; // Destructure authToken and collect the rest in queryParams

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
                // const honeypotApiUrl = 'https://dummy.restapiexample.com/api/v1/create'
                console.log("honey: ", honeypotApiUrl);

                // Make a request to the honeypot API, forwarding the HTTP method and query parameters
                try {
                    const response = await axios({
                        method: req.method,
                        url: honeypotApiUrl,
                        params: queryParams, // Pass query parameters to the honeypot service
                        headers: {
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



// let honeyPotToken = null; // Initialize honeyPotToken as null

// // Function to fetch the honeypot authorization token
// const fetchAuthToken = async () => {
//   try {
//     const response = await axios.post(honeypotApiUrl, { proxyConfig.username, proxyConfig.password });
//     honeyPotToken = response.data.authToken; // Store the honeyPotToken in the variable
//     console.log('Honeypot authorization token fetched and stored:', honeyPotToken);
//   } catch (error) {
//     console.error('Error fetching honeypot authorization token:', error.message);
//   }
// };

// // Schedule the cron job to run every 30 minutes
// cron.schedule('*/30 * * * *', fetchAuthToken);

