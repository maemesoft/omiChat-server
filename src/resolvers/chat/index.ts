import { OmajuContext } from '../../utils/userAuthChecker';
import {
    Arg,
    Authorized,
    Ctx,
    Int,
    Mutation,
    Query,
    Resolver,
} from 'type-graphql';
import { chatIMCreate, chatIMExist } from './chatIM';
import { chatSendMessage } from './chat';
import { RoomsClass } from '../../schemas/Rooms';
import { MessageClass } from '../../schemas/Message';

export const roomName = (myUserID, otherUserID) => {
    return myUserID > otherUserID
        ? `${otherUserID}-${myUserID}`
        : `${myUserID}-${otherUserID}`;
};

@Resolver()
export default class ChatResolver {
    @Authorized()
    @Mutation((type) => RoomsClass)
    public async IMCreate(
        @Ctx() ctx: OmajuContext,
        @Arg('otherUserID', (type) => Int) otherUserID: number
    ): Promise<any> {
        const myUserID = ctx.user.id;
        return await chatIMCreate(myUserID, otherUserID);
    }

    @Authorized()
    @Query((type) => Boolean)
    public async IMExist(
        @Ctx() ctx: OmajuContext,
        @Arg('otherUserID', (type) => Int) otherUserID: number
    ): Promise<any> {
        const myUserID = ctx.user.id;
        return await chatIMExist(roomName(myUserID, otherUserID));
    }

    @Authorized()
    @Mutation((type) => MessageClass)
    public async sendMessage(
        @Ctx() ctx: OmajuContext,
        @Arg('otherUserID', (type) => Int) otherUserID: number,
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
