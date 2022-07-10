import { pbkdf2Sync, randomBytes } from 'crypto';
import express from "express";
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { omit, pick } from 'lodash';
import { findOne, get, insertOne, updateOne } from "../services/collections";
import { AuthParams } from "../types/api";
import { User, Worker } from "../types/models";
import { DISABLE_REGISTRATION } from '../utils/constants';
import { idString } from "../utils/shared";

export const hashPassword = (password: string, salt?: string) => {
    const passwordSalt = salt || randomBytes(16).toString('hex');
    const passwordHash = pbkdf2Sync(password, passwordSalt, 1000, 64, `sha512`).toString(`hex`);
    return { passwordSalt, passwordHash };
};

export const getUserForClient = (user: User) => omit(user, '_id', 'passwordHash', 'passwordSalt');

const setAuthCookieAndReturnUser = (res: express.Response, user: User) => {
    const token = jwt.sign(
        pick(user, '_id', 'username', 'role'),
        process.env.SECRET_KEY,
        {
            expiresIn: "2h",
        }
    );
    res.cookie('auth', token, { httpOnly: true, sameSite: true, secure: false }); // TODO - set secure to false onlt in dev env
    res.json(getUserForClient(user));
};

export const setWorkerCookie = (res: express.Response, worker: Worker) => {
    const token = jwt.sign(
        pick(worker, '_id', 'name', 'experiment'),
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
       req.userRole = decoded['role'];
       next();
    } else {
        return res.status(401).send();
    }
}

const setWorkerProps = (req: express.Request, worker: Pick<Worker, '_id' | 'experiment'>) => {
    req.workerId = idString(worker._id);
    req.workerExperimentId =  idString(worker.experiment);
}

export const verifyWorkerMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const decoded = verifyAuthCookie('worker', req);
    if (decoded) {
        setWorkerProps(req, decoded as Worker);
    } else {
        const key = req.query.key as string;
        const worker = key && await findOne('workers', {key});
        if (!worker) {
            return res.status(401).send();
        }
        setWorkerProps(req, worker);
        setWorkerCookie(res, worker); // TODO - set cookie only in browser context (check user agent maybe)
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

const validatePassword = (user:User, password: string) => {
    const { passwordHash } = hashPassword(password, user.passwordSalt);
    return user.passwordHash === passwordHash;
};

authRouter.post('/login', async (req, res) => {
    const { username, password } = req.body as AuthParams;

    let user = await findOne('users', {username});
    if (!user) {
        await new Promise(res => setTimeout(res, 2941));
        return res.status(401).send();
    }
    if (!validatePassword(user, password))
        return res.status(401).send();
    return setAuthCookieAndReturnUser(res, user);
});

authRouter.post('/resetPassword', verifyUserMiddleware, async (req, res) => {
    const user = await get('users', req.userId);
    const { password, newPassword } = req.body as AuthParams;
    if (!validatePassword(user, password))
        return res.status(400).send();
    const { passwordSalt, passwordHash } = hashPassword(newPassword);
    await updateOne('users', user._id, { passwordHash, passwordSalt });
    return setAuthCookieAndReturnUser(res, user);
});

if (!DISABLE_REGISTRATION) {
    authRouter.post('/register', async (req, res) => {
        const { username, password } = req.body as AuthParams;
        let user = await findOne('users',{ username });
        if (user)
            throw new Error('username_exits');
        const { passwordSalt, passwordHash } = hashPassword(password);
        user = await insertOne('users', { username, passwordHash, passwordSalt } as User);
        return setAuthCookieAndReturnUser(res, user);
    });
}

export default authRouter;
