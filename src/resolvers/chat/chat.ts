import Message from '../../schemas/Message';

export async function chatSendMessage(roomName, msg, ownerUser): Promise<any> {
    const message = new Message({
        roomName: roomName,
        msg: msg,
        ownerUser: ownerUser,
    });
    message.save();

    const result = {
        roomName: message.roomName,
        msg: message.msg,
        createdAt: message.createdAt,
        ownerUser: message.ownerUser,
    };

    return result;
}
