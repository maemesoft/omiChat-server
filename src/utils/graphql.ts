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
import * as assert from 'assert';
import { ulid } from 'ulid';

// serverless offline support
const dynamoDbClient = new DynamoDB.DocumentClient({
    // use serverless-dynamodb endpoint in offline mode
    ...(process.env.IS_OFFLINE
        ? {
              endpoint: 'http://localhost:8000',
          }
        : {}),
});

// 메시지를 브로드캐스트 할 수 있으려면 Event store가 필요합니다. (publish events)
// 서버는 비동기식 이벤트 작업에 필요한 많은 메시지를 수신할 수 있기 때문에
// 실제 이벤트는 mutation에서 직접 게시되지 않고 서버의 이벤트 소스로 작동하는 기본 데이터 저장소에 저장됩니다.
// 우리는 DynamoDB를 영구 저장소로 사용하기로 결정했기 때문에 이를 이벤트 소스로 사용할 것입니다.
const eventStore = new DynamoDBEventStore({ dynamoDbClient });

const pubSub = new PubSub({ eventStore });

// [ https://github.com/michalkvasnicak/aws-lambda-graphql ]
// GraphQL 서버는 람다가 상태를 저장하지 않기 때문에 연결과 구독을 저장하는 방법을 알아야합니다.
// 이를 위해 Connection manager와 Subscription manager 인스턴스를 만들어야합니다.
//
// ==========================================================================================================
//
// By default subscriptions and connections use TTL of 2 hours.
// This can be changed by `ttl` option in DynamoDBSubscriptionManager and DynamoDBConnectionManager.
//
// ttl accepts a number in seconds (default is 7200 seconds) or
// false to turn it off.
//
// It's your responsibility to set up TTL on your connections and subscriptions tables.
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

// type MessageType = 'greeting' | 'test';

// type Message = {
//     id: string;
//     text: string;
//     type: MessageType;
// };

// type SendMessageArgs = {
//     text: string;
//     type: MessageType;
// };

// 주어진 스키마에서 우리는 브로드캐스팅된 메시지를 어떻게든 게시하고 처리해야한다는 것을 이미 알고 있습니다.
// For that purpose we must create a PubSub instance that uses our DynamoDB event store as underlying storage for events.
// const typeDefs = /* GraphQL */ `
//     enum MessageType {
//         greeting
//         test
//     }
//     type Message {
//         id: ID!
//         text: String!
//         type: MessageType!
//     }
//     type Mutation {
//         sendMessage(text: String!, type: MessageType = greeting): Message!
//     }
//     type Query {
//         serverTime: Float!
//     }
//     type Subscription {
//         messageFeed(type: MessageType): Message!
//     }
// `;

// const resolvers = {
//     Mutation: {
//         async sendMessage(rootValue: any, { text, type }: SendMessageArgs) {
//             assert.ok(text.length > 0 && text.length < 100);
//             const payload: Message = { id: ulid(), text, type };

//             await pubSub.publish('NEW_MESSAGE', payload);

//             return payload;
//         },
//     },
//     Query: {
//         serverTime: () => Date.now(),
//     },
//     Subscription: {
//         messageFeed: {
//             resolve: (rootValue: Message) => {
//                 // root value is the payload from sendMessage mutation
//                 return rootValue;
//             },
//             subscribe: withFilter(
//                 pubSub.subscribe('NEW_MESSAGE'),
//                 (rootValue: Message, args: { type: null | MessageType }) => {
//                     // this can be async too :)
//                     if (args.type == null) {
//                         return true;
//                     }

//                     return args.type === rootValue.type;
//                 }
//             ),
//         },
//     },
// };

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
    // resolvers,
    // typeDefs,

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
