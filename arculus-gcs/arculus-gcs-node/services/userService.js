const { isUserOfType, getUserFromToken } = require('./authService');
const pool = require('../modules/arculusDbConnection');

exports.updateUser = (req, res) => {
    const { authToken, user, updated_username, email_id, role, domains } = req.body;

    const username = getUserFromToken(authToken);

    // Check if the user has an admin role
    isUserOfType(username, ['Mission Creator'], (roleErr, isAdmin) => {
        if (roleErr) {
            console.error(roleErr);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (!isAdmin) {
            return res.status(403).json({ message: 'Unauthorized: Only admin users can edit user details' });
        }

        // Fetch the corresponding role_id based on the provided role name
        pool.query('SELECT role_id FROM role WHERE role_name = ?', [role], (selectRoleErr, roleResults) => {
            if (selectRoleErr) {
                console.error(selectRoleErr);
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            if (roleResults.length === 0) {
                // No role found with the given role name
                return res.status(404).json({ message: 'Role not found' });
            }

            const role_id = roleResults[0].role_id;

            // Fetch the user record from the database using the provided username
            pool.query('SELECT * FROM user WHERE username = ?', [user], (selectErr, results) => {
                if (selectErr) {
                    console.error(selectErr);
                    return res.status(500).json({ message: 'Internal Server Error' });
                }

                if (results.length === 0) {
                    // No user found with the given username
                    return res.status(404).json({ message: 'User not found' });
                }

                // Update the user record with the new information, including the role_id and domains
                pool.query(
                    'UPDATE user SET username = ?, email = ?, role_id = ?, domains = ? WHERE username = ?',
                    [updated_username, email_id, role_id, domains, user],
                    (updateErr) => {
                        if (updateErr) {
                            console.error(updateErr);
                            return res.status(500).json({ message: 'Internal Server Error' });
                        }

                        return res.status(200).json({ message: 'User updated successfully' });
                    }
                );
            });
        });
    });
};

exports.deleteUser = (req, res) => {
    const { username, authToken } = req.query;
    const user = getUserFromToken(authToken);

    // Check if the user has an admin role
    isUserOfType(user, ['Mission Creator'], (roleErr, isAdmin) => {
        if (roleErr) {
            console.error(roleErr);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (!isAdmin) {
            return res.status(403).json({ message: 'Unauthorized: Only admin users can delete users' });
        }

        // Start a transaction to handle deletion from multiple tables
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting database connection:', err);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
            connection.beginTransaction(err => {
                if (err) {
                    console.error('Error beginning transaction:', err);
                    return res.status(500).json({ message: 'Internal Server Error' });
                }

                connection.query('DELETE FROM supervisor WHERE user_id = (SELECT user_id FROM user WHERE username = ?)', [username], (deleteErr) => {
                    if (deleteErr) {
                        connection.rollback(() => {
                            console.error('Error deleting from supervisor table:', deleteErr);
                            return res.status(500).json({ message: 'Internal Server Error' });
                        });
                    }

                    connection.query('DELETE FROM viewer WHERE user_id = (SELECT user_id FROM user WHERE username = ?)', [username], (deleteErr) => {
                        if (deleteErr) {
                            connection.rollback(() => {
                                console.error('Error deleting from viewer table:', deleteErr);
                                return res.status(500).json({ message: 'Internal Server Error' });
                            });
                        }

                        connection.query('DELETE FROM user WHERE username = ?', [username], (deleteErr) => {
                            if (deleteErr) {
                                connection.rollback(() => {
                                    console.error('Error deleting user:', deleteErr);
                                    return res.status(500).json({ message: 'Internal Server Error' });
                                });
                            }

                            connection.commit(err => {
                                if (err) {
                                    connection.rollback(() => {
                                        console.error('Error committing transaction:', err);
                                        return res.status(500).json({ message: 'Internal Server Error' });
                                    });
                                }
                                connection.release();
                                return res.status(200).json({ message: 'User deleted successfully' });
                            });
                        });
                    });
                });
            });
        });
    });
};

exports.getUsers = (req, res) => {
    const { authToken } = req.query;
    const username = getUserFromToken(authToken);

    pool.getConnection(function (err, connection) {
        if (err) throw err;

        connection.beginTransaction(function (err) {
            if (err) throw err;

            connection.query('SELECT user_id FROM user WHERE username = ? LIMIT 1', [username], function (err, userRows) {
                if (err) {
                    connection.rollback(function () {
                        throw err;
                    });
                }

                if (userRows.length == 0 || userRows == undefined || !userRows[0].user_id) {
                    res.status(400).send('User not found');
                    connection.rollback(function () {
                        connection.release();
                    });
                    return;
                }
                const userId = userRows[0].user_id;

                connection.query(`
                    SELECT u.username, u.email, u.user_id, r.role_name, u.domains
                    FROM user u
                    JOIN role r ON u.role_id = r.role_id
                `, function (err, rows) {
                    if (err) {
                        connection.rollback(function () {
                            throw err;
                        });
                    } else {
                        connection.release();
                        res.json(rows);
                    }
                });
            });
        });
    });
};

exports.getCurrentUser = (req, res) => {
    const { authToken } = req.query;
    const username = getUserFromToken(authToken);

    pool.getConnection(function (err, connection) {
        if (err) throw err;

        connection.beginTransaction(function (err) {
            if (err) throw err;

            connection.query('SELECT u.user_id, u.username, u.email, u.domains, r.role_name FROM user u join role r on u.role_id=r.role_id WHERE username = ? LIMIT 1', [username], function (err, userRows) {
                if (err) {
                    connection.rollback(function () {
                        throw err;
                    });
                }

                if (userRows.length == 0 || userRows == undefined || !userRows[0].user_id) {
                    res.status(400).send('User not found');
                    connection.rollback(function () {
                        connection.release();
                    });
                    return;
                }
                res.json(userRows[0]);
                return;
            });
        });
    });
};