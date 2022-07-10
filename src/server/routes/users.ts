import express from 'express';
import { find, findOne, get, insertOne, updateOne } from '../services/collections';
import { AuthParams } from '../types/api';
import { User } from '../types/models';
import { hashPassword } from './auth';

const usersRouter = express.Router();

const cleanUser = (user: User) => {
    delete user['passwordHash'];
    delete user['passwordSalt'];
    return user;
}

usersRouter.use((req, res, next) => {
    if (req.userRole !== 'admin')
        res.status(401).send();
    next();
});

usersRouter.get('/', async (req, res) => {
    const users = await find('users', {});
    res.json(users);
});

usersRouter.post('/', async (req, res) => {
    const { username, password } = req.body as AuthParams;
    let user = await findOne('users',{ username });
    if (user)
        return res.status(400).send('username already exists');
    const { passwordSalt, passwordHash } = hashPassword(password);
    user = await insertOne('users', { username, passwordHash, passwordSalt } as User);
    res.json(cleanUser(user));
});

usersRouter.post('/:id', async (req, res) => {
    const { username, password } = req.body as AuthParams;
    let user = await get('users', req.params.id);
    if (!user)
        return res.status(400).send('username does not exists');
    const { passwordSalt, passwordHash } = password ? hashPassword(password) : user;
    await updateOne('users', user._id, { username, passwordHash, passwordSalt } as User);
    res.json(cleanUser(Object.assign(user, {username})));
});

export default usersRouter;