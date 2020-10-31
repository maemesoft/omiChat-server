import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { User } from '../../entities/User';
import { OmajuContext } from '../../utils/userAuthChecker';
import emailLogin from './emailLogin';
import emailRegister from './emailRegister';
import { tokenIssue } from './tokenussue';

@Resolver()
export default class AuthResolver {
    @Authorized()
    @Query((type) => String)
    public async getAuthVerify(@Ctx() ctx: OmajuContext): Promise<User> {
        return ctx.user;
    }

    /**
     * @description 이메일을 이용하여 로그인을 진행합니다.
     * @returns {String | Error}
     * @param email 로그인에 사용할 이메일을 입력합니다.
     * @param password 로그인에 사용할 비밀번호를 입력합니다.
     */
    @Query((type) => String)
    public async getLogin(
        @Arg('email') email: string,
        @Arg('password') password: string
    ): Promise<String | Error> {
        const result = await emailLogin(email, password);

        if (result instanceof Error) {
            return result;
        }

        // result에 포함된 id를 이용하여 Token을 발급합니다
        const token = tokenIssue(result.id);
        return token;
    }

    /**
     * @description 이메일을 이용하여 회원가입을 진행합니다. 만약 사용하고자 하는 이메일, 닉네임이 존재할 경우 Error를 반환합니다
     * @returns {String | Error}
     * @param email 회원가입시 사용할 이메일을 입력합니다
     * @param password 회원가입시 사용할 비밀번호를 입력합니다
     * @param nickname 회원가입시 사용할 닉네임을 입력합니다
     * @param phoneNum 회원가입시 사용할 전화번호를 입력합니다
     */
    @Mutation((type) => String)
    public async setRegister(
        @Arg('email') email: string,
        @Arg('password') password: string,
        @Arg('nickname') nickname: string,
        @Arg('phoneNum') phoneNum: string
    ): Promise<String | Error> {
        const result = await emailRegister(email, password, nickname, phoneNum);

        if (result instanceof Error) {
            return result;
        }

        // result에 포함된 id를 이용하여 Token을 발급합니다
        const token = tokenIssue(result.id);
        return token;
    }
}
