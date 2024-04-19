const { isUserOfType, getUserFromToken } = require('./authService');
const pool = require('../modules/arculusDbConnection');

exports.getTasks = (req, res) => {
    const { authToken } = req.query;

    try {
        const username = getUserFromToken(authToken);
        if (username === 'Unauthorized') {
            return res.status(403).json({ message: 'Unauthorized: Invalid token' });
        }

        isUserOfType(username, ['Mission Creator'], (err, isAdmin) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            if (isAdmin) {
                pool.query('SELECT task_name FROM task', (err, results) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ message: 'Internal Server Error' });
                    }
                    const taskNames = results.map(result => result.task_name);
                    return res.status(200).json({ taskNames });
                });
            } else {
                return res.status(403).json({ message: 'Unauthorized: Only users with admin role can perform this action' });
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

