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
export class RoomsClass {
    // Room Id
    @Field()
    @prop()
    _id?: string;

    // Room Type
    // c = channel
    // d = direct
    // p (change to g) = group
    // v = visitor
    @Field()
    @prop()
    t?: string;

    // Room Creation Timestamp
    @Field()
    @prop()
    ts?: Date;

    // Room Name (t:d -> empty)
    @Field()
    @prop()
    name?: string;

    // Last Message Timestamp
    @Field()
    @prop()
    lm?: Date;

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
    u?: Ref<u>;
}

const Rooms = getModelForClass(RoomsClass);
export default Rooms;
