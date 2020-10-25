import { Context } from 'aws-lambda';
import { AuthChecker } from 'type-graphql';
import { tokenVerify } from '../resolvers/auth/tokenussue';

// Import Typeorm dependencies
import { User } from '../entities/User';
import database from './database';

// Custom Context for Omaju
export interface OmajuContext extends Context {
    headers: any;
    event: any;
    context: any;
    user: User;
}

// User AuthChecker function must returns
export const userAuthChecker: AuthChecker<OmajuContext> = async ({
    root,
    args,
    context,
    info,
}) => {
    // Find Authorization Token from Header
    const token =
        context.headers.authorization || context.headers.Authorization;
    if (!token) return false;

    // Verify Token with tokenVerify function
    // If result is Error, return false
    const tokenInfo: any = tokenVerify(token);
    if (tokenInfo instanceof Error) {
        return false;
    }

    const user = await database().then(async (connection) => {
        // If Token Verify has successed
        // Find current user with given userId
        const user = await User.findOne({
            where: { id: tokenInfo.userId },
            relations: ['userProfile', 'character', 'character.surveyAnswer'],
        });

        await connection.close();

        return user;
    });

    // Save current user to context.user
    context.user = user;

    return true;
};
