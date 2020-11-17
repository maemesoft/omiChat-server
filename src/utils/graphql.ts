import {
    DynamoDBEventProcessor,
    DynamoDBConnectionManager,
    DynamoDBEventStore,
    DynamoDBSubscriptionManager,
    PubSub,
    Server,
    withFilter,
} from 'aws-lambda-graphql';
import { ApiGatewayManagementApi, DynamoDB } from 'aws-sdk';
import resolvers from '../resolvers';
import { GraphQLSchema } from 'graphql';
import { buildSchemaSync } from 'type-graphql';
import { userAuthChecker } from './userAuthChecker';

// serverless offline support
const dynamoDbClient = new DynamoDB.DocumentClient({
    // use serverless-dynamodb endpoint in offline mode
    ...(process.env.IS_OFFLINE
        ? {
              endpoint: 'http://localhost:8000',
          }
        : {}),
});

const eventStore = new DynamoDBEventStore({ dynamoDbClient });
const pubSub = new PubSub({ eventStore });
const subscriptionManager = new DynamoDBSubscriptionManager({ dynamoDbClient });
const connectionManager = new DynamoDBConnectionManager({
    // this one is weird but we don't care because you'll use it only if you want to use serverless-offline
    // why is it like that? because we are extracting api gateway endpoint from received events
    // but serverless offline has wrong stage and domainName values in event provided to websocket handler
    // so we need to override the endpoint manually
    // please do not use it otherwise because we need correct endpoint, if you use it similarly as dynamoDBClient above
    // you'll end up with errors
    apiGatewayManager: process.env.IS_OFFLINE
        ? new ApiGatewayManagementApi({
              endpoint: 'http://localhost:3001',
          })
        : undefined,
    dynamoDbClient,
    subscriptions: subscriptionManager,
});

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

// If schema is not exist, then createSchema and assign it
if (!schema) {
    schema = createSchema();
}

const server = new Server({
    connectionManager,
    eventProcessor: new DynamoDBEventProcessor(),
    schema: schema,
    subscriptionManager,
    introspection: true,
    // use serverless-offline endpoint in offline mode
    ...(process.env.IS_OFFLINE
        ? {
              playground: {
                  subscriptionEndpoint: 'ws://localhost:3001',
              },
          }
        : {}),
});

export const handleHttp = server.createHttpHandler();
export const handleWebSocket = server.createWebSocketHandler();
export const handleDynamoDBStream = server.createEventHandler();
