import { roomName } from '.';
import Rooms from '../../schemas/Rooms';

export async function chatIMCreate(
    myUserID: number,
    otherUserID: number
): Promise<any> {
    const room = new Rooms({
        type: 'Direct',
        usernames: [myUserID, otherUserID],
        name: roomName(myUserID, otherUserID),
    });
    await room.save();

    // const result = {
    //     type: room.type,
    //     name: room.name,
    //     usernames: room.usernames,
    //     createdAt: room.createdAt,
    // };

    return room;
}

export async function chatIMExist(roomName: string): Promise<Boolean> {
    console.log(Rooms.findOne().where('name').equals(roomName));
    return false;
}
