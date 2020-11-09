const pgp = require('pg-promise')();

const getDb = (dbUrl) => pgp(dbUrl);

module.exports = {
    init: ({ dbUrl }) => {
        const connection = getDb(dbUrl);
        connection.query(`CREATE TABLE IF NOT EXISTS auth_tokens (
            username varchar(80) PRIMARY KEY,
            token TEXT,
            refresh_token varchar(80),
            token_expires timestamp,
            refresh_token_expires timestamp
        );`);

        return connection;
    },
    setTokensForUser: (connection, user, token) => {
        connection.query(
            `INSERT INTO auth_tokens (username, token)
        VALUES($1, $2) 
        ON CONFLICT (username) 
        DO
            UPDATE SET token = $2;`,
            [user, token]
        );
    },
    getTokensForUser: (connection, user) => connection.one(`SELECT token from auth_tokens WHERE username = $1`, [user]),
};
