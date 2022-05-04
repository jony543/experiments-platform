import express from "express";
import { Collections } from "../services/collections";
import { randomBytes, pbkdf2Sync } from 'crypto';
import { Collection } from "mongodb";
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { omit, pick } from 'lodash';
import { User } from "../types/models";
import { AuthParams } from "../types/api";

const hashPassword = (password: string, salt?: string) => {
    const passwordSalt = salt || randomBytes(16).toString('hex');
    const passwordHash = pbkdf2Sync(password, passwordSalt, 1000, 64, `sha512`).toString(`hex`);
    return { passwordSalt, passwordHash };
};

const setAuthCookieAndReturnUser = (res: express.Response, user: User) => {
    const token = jwt.sign(
        pick(user, '_id', 'usernmae'),
        process.env.SECRET_KEY,
        {
            expiresIn: "2h",
        }
    );
    res.cookie('auth', token, { httpOnly: true, sameSite: true, secure: false }); // TODO - set secure to false onlt in dev env
    res.json(omit(user, '_id', 'passwordHash', 'passwordSalt'));
};

export const verifyMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const decoded = verifyAuthCookie(req);
    if (decoded) {
       req.userId = decoded['_id'];
    } else {
        return res.status(401).send();
    }
}

export const verifyAuthCookie = (req: express.Request) => {
    try {
        const {auth: token} = req.cookies || {};
        return token && jwt.verify(token, process.env.SECRET_KEY)
    } catch (err) {
        if (err instanceof TokenExpiredError) {
            return false;
        }
        throw err;
    }
}

const authRouter = express.Router();
authRouter.post('/login', async (req, res) => {
    const { username, password } = req.body as AuthParams;
    let user = await Collections.Users.findOne({ username });
    if (!user) {
        await new Promise(res => setTimeout(res, 2941));
        return res.status(401).send();
    }
    const { passwordHash } = hashPassword(password, user.passwordSalt);
    if (user.passwordHash != passwordHash)
        return res.status(401).send();
    return setAuthCookieAndReturnUser(res, user);
});

authRouter.post('/register', async (req, res) => {
    const { username, password } = req.body as AuthParams;
    let user = await Collections.Users.findOne({ username });
    if (user)
        throw new Error('username_exits');
    const { passwordSalt, passwordHash } = hashPassword(password);
    const { insertedId } = await Collections.Users.insertOne({ username, passwordHash, passwordSalt });
    user = await Collections.Users.findOne({ _id: insertedId });
    return setAuthCookieAndReturnUser(res, user);
});

export default authRouter;