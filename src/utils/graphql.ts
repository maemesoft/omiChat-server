import 'reflect-metadata';
import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
    Callback,
    Context,
} from 'aws-lambda';
import { GraphQLSchema } from 'graphql';
import { buildSchemaSync } from 'type-graphql';
import { ApolloServer } from 'apollo-server-lambda';
import { userAuthChecker } from './userAuthChecker';
import resolvers from '../resolvers';

// Variable that store created GraphQLSchema
let schema: GraphQLSchema;

/**
 * @description 서버의 GraphQL Schema를 만들어 반환하는 함수입니다.
 * @returns {Promise<GraphQLSchema>}
 */
export const createSchema = () => {
    (global as any).schema =
        (global as any).schema ||
        buildSchemaSync({
            resolvers,
            validate: false,
            authChecker: userAuthChecker,
        });

    const schema = (global as any).schema;
    return schema;
};

/**
 * @description schema를 이용하여 GraphQL Handler를 생성, 반환하는 함수입니다.
 * @returns {function(event: APIGatewayProxyEvent, context: Context, callback: Callback<APIGatewayProxyResult>) => void}
 */
export async function createHandler() {
    // If schema is not exist, then createSchema and assign it
    if (!schema) {
        schema = createSchema();
    }

    // To See more about ApolloServer's Constructor Parameter
    // See the Documentation below
    // https://www.apollographql.com/docs/apollo-server/api/apollo-server/
    const server = new ApolloServer({
        schema: schema,

        // To work playground properly, we muse define endpoint here
        // Environment Variable "PLAYGROUND_ENDPOINT" is defined under environment in serverless.yml
        playground: {
            endpoint: `${process.env.PLAYGROUND_ENDPOINT}`,
        },

        introspection: true,

        // Context is a object that passed to every resolver that executes for a particular operation
        // This enables resolvers to share helpful context, such as a database connection
        // Make Server Connection with
        context: function context({ event, context }) {
            context.callbackWaitsForEmptyEventLoop = false;

            // The return value of context will be passed to every resolver calls
            // To pass HTTP header properly to resolver, we need to return value below
            return {
                headers: event.headers,
                event: event,
                context: context,
            };
        },
    });

    return server.createHandler({ cors: { origin: '*', credentials: false } });
}

export function handler(
    event: APIGatewayProxyEvent,
    context: Context,
    callback: Callback<APIGatewayProxyResult>
) {
    context.callbackWaitsForEmptyEventLoop = false;

    // Get serverHandler from createHandler
    // Execute serverHandler function with given event, context, callback
    createHandler().then((handler) => {
        return handler(event, context, callback);
    });
}
