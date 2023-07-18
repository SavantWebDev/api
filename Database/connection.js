const knex = require('knex')({
    client: 'pg',
    connection: {
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE,
        timezone: '-03:00',
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    pool: {
        afterCreate: function(connection, callback) {
          connection.query('SET timeZone = "America/Sao_Paulo";', function(err) {
            callback(err, connection);
          });
        }
    }
    /* migrations: {
        directory: __dirname + "/db/migrations"
    },
    seeds: {
        directory: __dirname + "/db/seeds"
    } */
})

module.exports = knex