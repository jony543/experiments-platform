import express from "express";
import { findOne, getCollection, insertOne } from "../services/collections";
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

export const setWorkerCookie = (res: express.Response, worker: Worker) => {
    const token = jwt.sign(
        pick(worker, '_id', 'name'),
        process.env.SECRET_KEY,
        {
            expiresIn: "2h",
        }
    );
    res.cookie('worker', token, { httpOnly: true, sameSite: true, secure: false }); // TODO - set secure to false onlt in dev env
}

export const verifyUserMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const decoded = verifyAuthCookie('auth', req);
    if (decoded) {
       req.userId = decoded['_id'];
       next();
    } else {
        return res.status(401).send();
    }
}

export const verifyWorkerMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const decoded = verifyAuthCookie('worker', req);
    if (decoded) {
       req.workerId = decoded['_id'];
    }
    next();
}

export const verifyAuthCookie = (cookieName: string, req: express.Request) => {
    try {
        const {[cookieName]: token} = req.cookies || {};
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

    let user = await findOne('users', {username});
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
    let user = await findOne('users',{ username });
    if (user)
        throw new Error('username_exits');
    const { passwordSalt, passwordHash } = hashPassword(password);
    user = await insertOne('users', { username, passwordHash, passwordSalt } as User);
    return setAuthCookieAndReturnUser(res, user);
});

export default authRouter;