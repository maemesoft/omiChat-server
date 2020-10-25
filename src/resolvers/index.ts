import UserResolver from './user';

// If delete any type in resolvers const, cause type error
const resolvers: any = [UserResolver];

export default resolvers;
