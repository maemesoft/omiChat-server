import * as TypeORM from 'typeorm';
import entities from '../entities';

const database = async () => {
    let connection;

    try {
        connection = await TypeORM.getConnection();

        //If successfully get connection, but it is closed
        //Recreate Database Connection and Return it
        if (connection.isConnected === false) {
            connection = await TypeORM.createConnection({
                name: 'default',
                type: 'mysql',
                //URL indicates mysql url
                //URL should be formatted like "mysql://{UserName}:{PassWord}@{HostURL}:{Port}/{Database}"
                url: `mysql://${process.env.MYSQL_USER}:${process.env.MYSQL_PASS}@${process.env.MYSQL_HOST}:${process.env.MYSQL_PORT}/${process.env.MYSQL_DATABASE}`,
                database: process.env.MYSQL_DATABASE,
                entities: entities,
                synchronize: Boolean(process.env.MYSQL_SYNC),
                logger: 'advanced-console',
                logging: false,
            });
        }
    } catch (err) {
        connection = await TypeORM.createConnection({
            name: 'default',
            type: 'mysql',
            url: `mysql://${process.env.MYSQL_USER}:${process.env.MYSQL_PASS}@${process.env.MYSQL_HOST}:${process.env.MYSQL_PORT}/${process.env.MYSQL_DATABASE}`,
            database: process.env.MYSQL_DATABASE,
            entities: entities,
            synchronize: Boolean(process.env.MYSQL_SYNC),
            logger: 'advanced-console',
            logging: false,
        });
    }

    //We can use database connection with
    //await databaseConnection.then((connection) => {...})
    return connection;
};

export default database;
