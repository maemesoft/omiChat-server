// Define Same value with serverless.yml
const custom = {
    playgroundEndpoint: {
        dev: '/graphql',
        product: '/product/graphql',
    },
    mysqlHost: {
        dev: 'localhost',
        product: 'localhost',
    },
    mysqlPort: {
        dev: '3309',
        product: '3306',
    },
    mysqlUser: {
        dev: 'omichat',
        product: 'omichat',
    },
    mysqlPass: {
        dev: 'omichat1!',
        product: 'omichat1!',
    },
    mysqlDatabase: {
        dev: 'omichat',
        product: 'omichat',
    },
    mysqlSync: {
        dev: 'true',
        product: 'true',
    },
    mysqlLog: {
        dev: 'all',
        product: 'all',
    },
};

// Define Environment Variables that need to run Jest
process.env.MYSQL_HOST = custom.mysqlHost.dev;
process.env.MYSQL_PORT = custom.mysqlPort.dev;
process.env.MYSQL_USER = custom.mysqlUser.dev;
process.env.MYSQL_PASS = custom.mysqlPass.dev;
process.env.MYSQL_DATABASE = custom.mysqlDatabase.dev;
process.env.MYSQL_SYNC = custom.mysqlSync.dev;
process.env.MYSQL_LOG = custom.mysqlLog.dev;
process.env.PLAYGROUND_ENDPOINT = custom.playgroundEndpoint.dev;
