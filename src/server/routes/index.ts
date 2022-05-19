import express, { Application } from 'express';
import path from 'path';
import { createProxyMiddleware } from 'http-proxy-middleware';
import authRouter, { verifyUserMiddleware } from './auth';
import experimentsRouter from './experiments';
import { objectId } from '../utils/models';
import { get } from '../services/collections';
import garminRouter from './garmin';
import workersApi from './workers';

export default (app: Application) => {
    app.get('/', (req, res) => {
        return res.status(200).send('OK');
    });
    
    app.use('/auth', authRouter);

    const api = express.Router();
    api.use(verifyUserMiddleware);
    api.get('/user', async (req, res) => {
        const user = get('users', req.userId);
        return res.json(user);
    });
    api.use('/experiments', experimentsRouter);
    app.use('/admin-api', api);

    app.use('/workers-api', workersApi)

    const publicRoutes = express.Router();
    publicRoutes.use('/garmin', garminRouter);
    app.use('/public', publicRoutes);
    
    const clientHandler = process.env.NODE_ENV == 'development' ? 
        createProxyMiddleware({target: 'http://localhost:3333/'}) : [
            (req, res, next) => {
                req.url = req.url.replace('/admin', '') || '/';
                console.log({newUrl: req.url});
                next();
            }, 
            express.static(path.resolve(__dirname, '../../client')),
            (req, res) => res.sendFile(path.resolve(__dirname, '../../client/index.html')),
        ];
    app.get('/admin*', clientHandler);
}