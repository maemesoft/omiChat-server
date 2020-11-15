import { OmajuContext } from '../../utils/userAuthChecker';
import { Arg, Authorized, Ctx, Mutation, Resolver } from 'type-graphql';
import { chatIMCreate } from './chatIM';
import { chatSendMessage } from './chat';

export const roomName = (myUserID, otherUserID) => {
    return myUserID > otherUserID
        ? `${otherUserID}-${myUserID}`
        : `${myUserID}-${otherUserID}`;
};

@Resolver()
export default class ChatResolver {
    @Authorized()
    @Mutation()
    public async IMCreate(
        @Ctx() ctx: OmajuContext,
        @Arg('otherUserID', (type) => Number) otherUserID: number
    ): Promise<any> {
        const myUserID = ctx.user.id;
        return await chatIMCreate(myUserID, otherUserID);
    }

    @Authorized()
    @Mutation()
    public async sendMessage(
        @Ctx() ctx: OmajuContext,
        @Arg('otherUserID', (type) => Number) otherUserID: number,
        @Arg('msg', (type) => String) msg: string
    ): Promise<any> {
        const myUserID = ctx.user.id;
        return await chatSendMessage(
            roomName(myUserID, otherUserID),
            msg,
            myUserID
        );
    }
}
