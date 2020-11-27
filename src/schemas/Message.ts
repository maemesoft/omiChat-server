import { getModelForClass, prop, Ref } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class MessageClass {
    // The room id - Identify the room the message belongs
    @prop({ required: true })
    @Field()
    roomName: string;

    // The textual message
    @prop({ required: true })
    @Field()
    msg: string;

    // The message time stamp (date of creation on client)
    @prop({ default: () => Date.now() })
    @Field()
    createdAt?: Date;

    // The user that sent the message
    @Field()
    @prop({ required: true })
    ownerUser: string;

    @prop()
    @Field()
    _updatedAt?: Date;

    @prop()
    @Field()
    editedAt?: Date;

    // User Username
    @Field()
    @prop({ required: true })
    username: string;
}

const Message = getModelForClass(MessageClass);
export default Message;
