const { isUserOfType, getUserFromToken } = require('./authService');

const pool = require('../modules/arculusDbConnection');

exports.getRoles = (req, res) => {
    const { authToken } = req.query;

    // Check if the user has an admin role
    isUserOfType(getUserFromToken(authToken), ['Mission Creator'], (roleErr, isAdmin) => {
        if (roleErr) {
            console.error(roleErr);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (isAdmin) {
            // Query to get task names
            pool.query('SELECT role_name FROM role', (queryErr, results) => {
                if (queryErr) {
                    console.error(queryErr);
                    return res.status(500).json({ message: 'Internal Server Error' });
                }

                const roleNames = results.map(result => result.role_name);
                return res.status(200).json({ roleNames });
            });
        } else {
            return res.status(403).json({ message: 'Unauthorized: Only users with admin role can perform this action' });
        }
    });
};