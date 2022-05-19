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
    const appRouter = express.Router();
    appRouter.get('/', (req, res) => {
        return res.status(200).send('OK');
    });
    
    appRouter.use('/auth', authRouter);

    const api = express.Router();
    api.use(verifyUserMiddleware);
    api.get('/user', async (req, res) => {
        const user = get('users', req.userId);
        return res.json(user);
    });
    api.use('/experiments', experimentsRouter);
    appRouter.use('/admin-api', api);

    appRouter.use('/workers-api', workersApi)

    const publicRoutes = express.Router();
    publicRoutes.use('/garmin', garminRouter);
    appRouter.use('/public', publicRoutes);
    
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
    appRouter.get('/admin*', clientHandler);

    if (process.env.APP_PREFIX) {
        app.use(process.env.APP_PREFIX, appRouter);
    } else {
        app.use(appRouter);
    }
}