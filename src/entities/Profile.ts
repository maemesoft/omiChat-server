import { Field, Int, ObjectType } from 'type-graphql';
import {
    BaseEntity,
    Column,
    Entity,
    PrimaryGeneratedColumn,
    OneToOne,
} from 'typeorm';
import { User } from './User';

@ObjectType()
@Entity()
export class Profile extends BaseEntity {
    // Profile Entity's PK
    @Field((type) => Int)
    @PrimaryGeneratedColumn()
    public readonly id: number;

    // Indicate User's Nickname(e.g. YesterdayKite)
    @Field()
    @Column()
    public nickname: string;

    // Store the user's last nickname change date
    // Changing nickname will be restricted for specified duration
    // It will be used to check that user has passed the duration
    @Field()
    @Column({ type: 'date' })
    public nicknameModifyDate: Date;

    // Link with User Entity
    @Field((type) => User)
    @OneToOne((type) => User, (user) => user.userProfile)
    public user: User;
}
