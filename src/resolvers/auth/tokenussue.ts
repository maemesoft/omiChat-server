import { JWT, JWE } from 'jose';
import secret from '../../utils/secret';

/**
 * @description 주어진 정보를 이용하여 User Token을 발급합니다
 * @param {number} id 회원 구분용으로 Payload에 포함할 오마주의 User.id입니다
 * @return {string} 유저의 정보가 담긴 jwe 토큰입니다
 */
export function tokenIssue(id: number) {
    // Token에 전달할 payload를 생성합니다
    const payload = {
        userId: id,
    };

    // Client에 전달할 Token을 생성하며, 만료기한은 2개월 입니다
    const token = JWT.sign(payload, secret.token, {
        issuer: 'omichat_maemesoft',
        expiresIn: '60d',
    });

    // Token을 JWE로 암호화합니다
    const encryptedToken = JWE.encrypt(token, secret.encryption);

    // 암호화된 JWE를 반환합니다
    return encryptedToken;
}

/**
 * @description 토큰을 Decrypt 및 검증하여 결과를 반환합니다.
 * @param {string} token 검증에 사용할 Token입니다. tokenIssue을 통해 발급한 token을 입력합니다
 * @returns {Object | Error} 토큰 검증에 성공했을 경우 Object를, 실패할 경우는 Error를 반환합니다
 */
export function tokenVerify(token: string) {
    try {
        // Decrypt JWE and verify decrypted token with secret
        // If it throw any errors, token is vaild
        // Then return the verify result
        const decryptToken = JWE.decrypt(token, secret.encryption);
        const verifiedJWT = JWT.verify(decryptToken.toString(), secret.token);
        return verifiedJWT;
    } catch (e) {
        return new Error('Token Verification Failed');
    }
}
