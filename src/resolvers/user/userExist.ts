import { User } from '../../entities/User';
import { getRepository } from 'typeorm';
import database from '../../utils/database';

export async function getAccountIdExist(accountID: string): Promise<User> {
    let result: Promise<User>;

    await database().then(async (connection) => {
        result = await getRepository(User)
            .findOne({ where: { accountID: accountID } })
            .then((res) => {
                if (!res) {
                    throw new Error('Not Found');
                }
                return res;
            })
            .catch((e) => {
                return e;
            });
        await connection.close();
    });
    // console.log(accountID);
    return result;
}

export async function getPhoneNumExist(phoneNum: string): Promise<User> {
    let result;

    await database().then(async (connection) => {
        result = await getRepository(User)
            .findOne({ phoneNum: phoneNum })
            .then((res) => {
                return res;
            })
            .catch((e) => {
                return e;
            });
        await connection.close();
    });
    return result;
}
