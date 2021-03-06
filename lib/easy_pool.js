var pool_module = require('generic-pool');
var path        = require('path');
var mysql       = require('mysql');

/** @ignore */
var pool = {
    /** @ignore */
    create: function (settings) {
        return pool_module.Pool({
            name : 'mysql_' + settings.database,

            create : function (callback) {
                var client = mysql.createClient(settings);
                callback(null, client);
            },

            destroy : function (client) {
                client.end();
            },

            max : settings.pool_size || 10,

            idleTimeoutMillis : settings.idle_timeout || 5000,

            log : settings.log || false

        });
    }
};

/** @namespace */
var easy_pool = (function () {
    var cached_pool = {};

    /**
     * @function
     * @param {object} settings - A settings object.
     * Settings properties:
     * <br><pre>
     *   user         : (required) - MySQL database user.
     *   database     : (required) - MySQL database to connect to.
     *   password     : (optional) - default: null
     *   host         : (optional) - default: localhost
     *   port         : (optional) - default: 3306
     *   pool_size    : (optional) - default: 10
     *   idle_timeout : (optional) - Timeout in milliseconds. default: 5000
     *   log          : (optional) - If true, log to console. If a function is passed in,
     *                               use that function for logging.
     *                               default: false.
     * </pre>
     *
     * @returns {object} a node-pool (generic-pool) Pool object.
     * @see <a href='https://github.com/coopernurse/node-pool'>node-pool</a>.
     */
    function fetch(settings) {
        var key = settings.host + '_' + settings.database;
        if (cached_pool && cached_pool[key]) {
            return cached_pool[key];
        }
        cached_pool[key] = pool.create(settings);
        console.log('creatng pool');
        return cached_pool[key];
    }

    return {
        fetch: fetch
    };
}());

module.exports = easy_pool;
