const pgp = require('pg-promise')();

const getDb = (dbUrl) => pgp(dbUrl);

module.exports = ({ dbUrl }) => ({
    init: () => {
        getDb(dbUrl).query(`CREATE TABLE IF NOT EXISTS auth_tokens (
            username varchar(80) PRIMARY KEY,
            token varchar(80),
            refresh_token varchar(80),
            token_expires timestamp,
            refresh_token_expires timestamp
        );`);
    },
    setTokensForUser: (user, token) => {
        getDb(dbUrl).query(
            `INSERT INTO auth_tokens (username, token)
        VALUES($1, $2) 
        ON CONFLICT (username) 
        DO
            UPDATE SET token = $2;`,
            [user, token]
        );
    },
    getTokensForUser: (user) => getDb(dbUrl).one(`SELECT token from auth_tokens WHERE username = $1`, [user]),
});
