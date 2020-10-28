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
    setTokensForUser: (user, token, refreshToken) => {
        const currDate = new Date();
        const tokenExpires = new Date(currDate.setDate(currDate.getDate() + 8));
        const refreshTokenExpires = new Date(currDate.setMonth(currDate.getMonth() + 9)).getTime();
        getDb(dbUrl).one(
            `INSERT INTO auth_tokens (username, token, refresh_token, token_expires, refresh_token_expires)
        VALUES($1, $2, $3, $4, $5) 
        ON CONFLICT (username) 
        DO
            UPDATE SET token = $2,
            refresh_token = $3,
            token_expires = $4,
            refresh_token_expires = $5;`,
            [user, token, refreshToken, tokenExpires, refreshTokenExpires]
        );
    },
    getTokensForUser: (user) => getDb(dbUrl).one(`SELECT token from auth_tokens WHERE username = $1`, [user]),
});
