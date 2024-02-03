const { isAdminUser, getUserFromToken } = require('./authService');
const pool = require('../modules/arculusDbConnection');

// GET API to retrieve blacklisted IP addresses
exports.getBlacklist = (req, res) => {
    const { authToken, records } = req.query;

    // Check if the user has an admin role
    isAdminUser(getUserFromToken(authToken), (roleErr, isAdmin) => {
        if (roleErr) {
            console.error(roleErr);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (isAdmin) {
            // Query to get blacklisted IP addresses
            pool.query('SELECT ip_address FROM blacklist LIMIT ?', [parseInt(records, 10)], (queryErr, results) => {
                if (queryErr) {
                    console.error(queryErr);
                    return res.status(500).json({ message: 'Internal Server Error' });
                }

                const blacklistedIPs = results.map(result => result.ip_address);
                return res.status(200).json({ blacklistedIPs });
            });
        } else {
            return res.status(403).json({ message: 'Unauthorized: Only users with admin role can perform this action' });
        }
    });
};

// DELETE API to remove IP addresses from the blacklist
exports.removeFromBlacklist = (req, res) => {
    const { authToken } = req.query;
    const { ipAddresses } = req.body;

    // Check if the user has an admin role
    isAdminUser(getUserFromToken(authToken), (roleErr, isAdmin) => {
        if (roleErr) {
            console.error(roleErr);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (isAdmin) {
            // Split the comma-separated IP addresses
            const ipArray = ipAddresses.split(',');

            // Query to remove IP addresses from the blacklist
            pool.query('DELETE FROM blacklist WHERE ip_address IN (?)', [ipArray], (queryErr) => {
                if (queryErr) {
                    console.error(queryErr);
                    return res.status(500).json({ message: 'Internal Server Error' });
                }

                return res.status(200).json({ message: 'Successfully removed from blacklist' });
            });
        } else {
            return res.status(403).json({ message: 'Unauthorized: Only users with admin role can perform this action' });
        }
    });
};