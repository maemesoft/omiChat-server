import AuthResolver from './auth';
import UserResolver from './user';

// If delete any type in resolvers const, cause type error
const resolvers: any = [UserResolver, AuthResolver];

export default resolvers;
