const { isUserOfType, getUserFromToken } = require('./authService');
const pool = require('../modules/arculusDbConnection');

exports.getTasks = (req, res) => {
    const { authToken } = req.query;

    // Check if the user has an admin role
    isUserOfType(getUserFromToken(authToken), ['Mission Creator'], (roleErr, isAdmin) => {
        if (roleErr) {
            console.error(roleErr);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (isAdmin) {
            // Query to get task names
            pool.query('SELECT task_name FROM task', (queryErr, results) => {
                if (queryErr) {
                    console.error(queryErr);
                    return res.status(500).json({ message: 'Internal Server Error' });
                }

                const taskNames = results.map(result => result.task_name);
                return res.status(200).json({ taskNames });
            });
        } else {
            return res.status(403).json({ message: 'Unauthorized: Only users with admin role can perform this action' });
        }
    });
};

