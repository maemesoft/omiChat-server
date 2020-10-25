import { JWK } from 'jose';

const jwt = '7856467hb5554432675443';
const jwe = '7nj866y546y45tf3454f536b5';

const secret = {
    token: JWK.asKey(jwt),
    encryption: JWK.asKey(jwe),
};

export default secret;
