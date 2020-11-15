import { getModelForClass, prop, Ref } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class u {
    // User Username
    @Field()
    @prop()
    username?: string;
}

@ObjectType()
export class RoomsClass {
    // Room Type
    // Channel
    // Direct
    // Group (Private)
    // Visitor
    @Field()
    @prop({ required: true })
    type: string;

    // Room Creation Timestamp
    @Field()
    @prop({ default: () => Date.now() })
    createdAt?: Date;

    // Room Name
    // type:Direct -> empty
    @Field()
    @prop()
    name?: string;

    // Last Message Timestamp
    @Field()
    @prop()
    lastMessageTime?: Date;

    // Messages Counter
    @Field()
    @prop()
    msgs?: number;

    // If users can leave room
    @Field()
    @prop()
    cl?: boolean;

    // Read Only
    @Field()
    @prop()
    ro?: boolean;

    // Room Users
    @Field()
    @prop({ type: () => [String] })
    usernames?: string[];

    // Owner User
    @Field((type) => u)
    @prop({ ref: () => u })
    ownerUser?: Ref<u>;
}

const Rooms = getModelForClass(RoomsClass);
export default Rooms;
