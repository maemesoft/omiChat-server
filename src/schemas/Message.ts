import { getModelForClass, prop, Ref } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class u {
    // User Id
    @Field()
    @prop()
    _id?: string;

    // User Username
    @Field()
    @prop()
    username?: string;
}

@ObjectType()
export class MessageClass {
    // The message id
    @prop()
    @Field()
    _id?: string;

    // The room id - Identify the room the message belongs
    @prop()
    @Field()
    rid?: string;

    // The textual message
    @prop()
    @Field()
    msg?: string;

    // The message time stamp (date of creation on client)
    @prop()
    @Field()
    ts?: Date;

    // The user that sent the message
    @Field((type) => u)
    @prop({ ref: () => u })
    u?: Ref<u>;

    @prop()
    @Field()
    _updatedAt?: Date;

    @prop()
    @Field()
    editedAt?: Date;

    @Field((type) => u)
    @prop({ ref: () => u })
    editedBy?: Ref<u>;
}

const Message = getModelForClass(MessageClass);
export default Message;
