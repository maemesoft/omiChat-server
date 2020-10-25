import { OmajuContext } from '../../utils/userAuthChecker';
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { User } from '../../entities/User';
import { getAccountIdExist, getPhoneNumExist } from './userExist';
import database from '../../utils/database';
import bcrypt from 'bcryptjs';

@Resolver()
export default class UserResolver {
    // @Query((type) => User)
    // public async getUser(@Arg('id', (type) => Int) id: number): Promise<User> {
    //     return await database().then(async (connection) => {
    //         const user = await getRepository(User).findOne({
    //             where: { id: id },
    //             relations: ['userProfile', 'character'],
    //         });

    //         await connection.close();
    //         return user;
    //     });
    // }

    @Query((type) => String)
    public async getAccountIdExist(
        @Arg('accountID', (type) => String) accountID: string
    ): Promise<String> {
        try {
            return (await getAccountIdExist(accountID)).accountID;
        } catch (e) {
            return 'Not Found';
        }
    }

    @Query((type) => String)
    public async getPhoneNumExist(
        @Arg('phoneNum', (type) => String) phoneNum: string
    ): Promise<String> {
        try {
            return (await getPhoneNumExist(phoneNum)).phoneNum;
        } catch (e) {
            return 'Not Found';
        }
    }

    @Authorized()
    @Query((type) => String)
    public async getCurrentPasswordVerify(
        @Ctx() ctx: OmajuContext,
        @Arg('currentPassword') currentPassword: string
    ): Promise<String> {
        if (bcrypt.compareSync(currentPassword, ctx.user.password)) {
            return 'Success';
        } else {
            throw Error('Wrong Password');
        }
    }

    @Authorized()
    @Mutation((type) => User)
    public async setChangePassword(
        @Ctx() ctx: OmajuContext,
        @Arg('newPassword') newPassword: string
    ): Promise<User> {
        // Encrypt new Password
        // Generate Salt and hash password with salt
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(newPassword, salt);

        // Change password and save it
        ctx.user.password = hashedPassword;

        // return Current User Info
        return await database().then(async (connection) => {
            return ctx.user
                .save()
                .then(async (res) => {
                    await connection.close();
                    return res;
                })
                .catch(async (err) => {
                    await connection.close();
                    throw Error('Error Occured While Updating');
                });
        });
    }

    @Authorized()
    @Mutation((type) => User)
    public async setChangeNickname(
        @Ctx() ctx: OmajuContext,
        @Arg('nickname') nickname: string
    ): Promise<User> {
        // Change current user's nickname and Save
        ctx.user.userProfile.nickname = nickname;

        await database().then(async (connection) => {
            await ctx.user.userProfile.save();
            await connection.close();
        });

        // return Current User Info
        return ctx.user;
    }
}
