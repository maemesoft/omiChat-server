import { getModelForClass, prop, Ref } from '@typegoose/typegoose';
import { Field, Int, ObjectType } from 'type-graphql';

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
    @Field((type) => Int)
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
    @Field((type) => [String])
    @prop({ type: () => [String] })
    usernames?: string[];

    // Owner User
    @Field()
    @prop()
    ownerUser?: string;
}

const Rooms = getModelForClass(RoomsClass);
export default Rooms;
