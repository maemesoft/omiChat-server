import bcrypt from 'bcryptjs';
import { getRepository } from 'typeorm';
import { User } from '../../entities/User';
import { Profile } from '../../entities/Profile';
import database from '../../utils/database';
import Axios from 'axios';
import config from '../../config';

/**
 * @description 이메일을 이용하여 회원가입을 진행합니다. 만약 사용하고자 하는 이메일, 닉네임이 존재할 경우 Error를 반환합니다
 * @returns {Error | User}
 * @param email 회원가입시 사용할 이메일을 입력합니다
 * @param password 회원가입시 사용할 비밀번호를 입력합니다
 * @param nickname 회원가입시 사용할 닉네임을 입력합니다
 * @param phoneNum 회원가입시 사용할 전화번호를 입력합니다
 */
export default async function emailRegister(
    email: string,
    password: string,
    nickname: string,
    phoneNum: string
) {
    return await database().then(async (connection) => {
        // 이메일이 사용중인지 검사합니다
        // 만약 이메일아 사용중인 경우 Error를 throw합니다
        await getRepository(User)
            .find({ accountID: email })
            .then(async (res) => {
                if (res.length !== 0) {
                    await connection.close();
                    throw await Error(`ID Exist`);
                }
            });

        // 비밀번호를 암호화합니다
        // salt를 생성하고, 이를 이용하여 비밀번호를 Hash합니다
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        // 이메일과 닉네임을 모두 사용할 수 있다면 회원가입을 진행합니다
        // 우선 유저 정보를 생성합니다
        // 비밀번호는 위에서 bcrypt를 이용하여 Hash한 비밀번호를 삽입합니다
        const user = await User.create({
            accountID: email,
            password: hashedPassword,
            phoneNum: phoneNum,
        }).save();

        // 유저의 프로필 정보를 생성하고, 유저와 연결합니다
        await Profile.create({
            nickname: nickname,
            nicknameModifyDate: new Date(),
            user: user,
        }).save();

        // 유저정보가 성공적으로 등록되었는지 확인합니다
        // 만약 유저정보를 찾지 못한다면 에러를 반환합니다
        const result = await getRepository(User)
            .findOne({
                where: { accountID: email },
                relations: ['userProfile'],
            })
            .then((res) => {
                return res ? res : new Error('User Not Found');
            });

        try {
            const username = String(user.id);

            const userCreateResult = await Axios.post(
                `${config['RocketChat-Host']}/api/v1/users.create`,
                {
                    email: email,
                    name: nickname,
                    password: hashedPassword,
                    username: username,
                },
                {
                    headers: {
                        'X-Auth-Token': config['X-Auth-Token'],
                        'X-User-Id': config['X-User-Id'],
                        'Content-type': 'application/json',
                    },
                }
            );

            const userCreateTokenResult = await Axios.post(
                `${config['RocketChat-Host']}/api/v1/users.createToken`,
                {
                    username: username,
                },
                {
                    headers: {
                        'X-Auth-Token': config['X-Auth-Token'],
                        'X-User-Id': config['X-User-Id'],
                        'Content-type': 'application/json',
                    },
                }
            );

            const chatToken = userCreateTokenResult.data.data.authToken;
            const chatUserID = userCreateTokenResult.data.data.userId;
            user.chatToken = chatToken;
            user.chatUserID = chatUserID;
            await user.save();
        } catch (e) {
            console.log(e);
        }

        await connection.close();

        return result;
    });
}
