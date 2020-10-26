import bcrypt from 'bcryptjs';
import database from '../../utils/database';
import { getRepository } from 'typeorm';
import { User } from '../../entities/User';

/**
 * @description 이메일을 이용하여 로그인을 진행합니다.
 * @returns {Error | User}
 * @param email 로그인에 사용할 이메일을 입력합니다.
 * @param password 로그인에 사용할 비밀번호를 입력합니다.
 */
export default async function emailLogin(email: string, password: string) {
    return await database().then(async (connection) => {
        // 입력한 회원정보에 해당하는 값이 있는지 찾습니다
        const result = await getRepository(User)
            .findOne({
                where: { accountID: email },
                relations: ['userProfile'],
            })
            .then(async (res) => {
                // 만약 회원정보가 존재하지 않으면 ID Fail Error를 throw합니다
                if (!res) {
                    await connection.close();
                    throw Error('ID Fail');
                }

                // 만약 비밀번호가 일치하지 않으면 PW Fail Error를 throw합니다
                if (!bcrypt.compareSync(password, res.password)) {
                    await connection.close();
                    throw Error('PW Fail');
                }

                // ID PW 모두 일치하는 경우, 유저의 정보를 반환합니다
                return res;
            });

        await connection.close();

        // 현재 유저의 유저정보를 반환합니다
        return result;
    });
}
