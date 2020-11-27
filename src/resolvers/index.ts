import AuthResolver from './auth';
import ChatResolver from './chat';
import UserResolver from './user';

// If delete any type in resolvers const, cause type error
const resolvers: any = [UserResolver, AuthResolver, ChatResolver];

export default resolvers;
