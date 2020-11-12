const pgp = require('pg-promise')();

const getDb = (dbUrl) => pgp(dbUrl);

const mem = {};

module.exports = {
    init: ({ dbUrl }) => {
        let connection;
        connection = getDb(dbUrl);
        (async () => {
            try {
                await connection.query(
                    `CREATE TABLE IF NOT EXISTS auth_tokens (
                            username varchar(80) PRIMARY KEY,
                            token TEXT,
                            refresh_token varchar(80),
                            token_expires timestamp,
                            refresh_token_expires timestamp
                        );`
                );
            } catch (e) {
                console.log('Error while connecting to DB! Using in memory database');
            }
        })();

        return connection;
    },
    setTokensForUser: async (connection, user, token) => {
        try {
            await connection.query(
                `INSERT INTO auth_tokens (username, token)
            VALUES($1, $2) 
            ON CONFLICT (username) 
            DO
                UPDATE SET token = $2;`,
                [user, token]
            );
        } catch (e) {
            console.log('Error while connecting to DB! Using in memory database');
            mem[user] = token;
        }
    },
    getTokensForUser: async (connection, user) => {
        try {
            return await connection.one(`SELECT token from auth_tokens WHERE username = $1`, [user]);
        } catch (e) {
            console.log('Error while connecting to DB! Using in memory database');
            return { token: mem[user] };
        }
    },
};
