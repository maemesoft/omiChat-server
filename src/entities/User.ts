import {
    Entity,
    BaseEntity,
    Column,
    CreateDateColumn,
    PrimaryGeneratedColumn,
    JoinColumn,
    OneToOne,
    ManyToMany,
} from 'typeorm';
import { Profile } from './Profile';
import { Field, Int, ObjectType } from 'type-graphql';

@Entity()
@ObjectType({ description: 'User Account' })
export class User extends BaseEntity {
    // PK, Omaju's User own user id
    @Field((type) => Int)
    @PrimaryGeneratedColumn()
    public readonly id: number;

    @Field()
    @Column()
    public accountID: string;

    // Actual User's Signing Password
    // It will be user's own password
    @Column()
    public password: string;

    // User's Phone Number
    @Field()
    @Column()
    public phoneNum: string;

    // User's Reigster Date
    @Field()
    @CreateDateColumn()
    public joinDate: Date;

    // User's suspected Case IDs
    @Field((type) => [String])
    @Column('simple-array', { nullable: true })
    public suspectedCase: string[];

    // Indicate the User's Profile Entity
    // Profile contains nickname, nickname Edit Date etc.
    @Field((type) => Profile)
    @JoinColumn()
    @OneToOne((type) => Profile, (userProfile) => userProfile.user, {
        onDelete: 'CASCADE',
    })
    public userProfile: Profile;
}
