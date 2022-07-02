import express, { Application } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { findOne, get } from '../services/collections';
import { modelId } from '../utils/shared';
import authRouter, { getUserForClient, verifyUserMiddleware, verifyWorkerMiddleware } from './auth';
import experimentsRouter from './experiments';
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
        const user = await get('users', req.userId);
        return res.json(getUserForClient(user));
    });
    api.use('/experiments', experimentsRouter);
    appRouter.use('/admin-api', api);

    appRouter.use('/workers-api', workersApi);

    const publicRoutes = express.Router();
    publicRoutes.use('/garmin', garminRouter);
    publicRoutes.use('/experiment',
        verifyWorkerMiddleware,
        async (req, res, next) => { // verify worker experiment
            const experimentName = new URL(req.url, 'http://dummy').pathname.split('/').find(Boolean);
            const experiment = await findOne('experiments', {name: experimentName}); // TODO - cache
            if (req.workerExperimentId !== modelId(experiment))
                return res.status(401).send();
            next();
        },
        async (req, res, next) => {
            if (req.url.includes('experiments-platform.js'))
                res.sendFile(path.resolve(__dirname, '../../client/experiments-platform.js'));
            else
                next();
        },
        express.static(process.env.STUDY_ASSETS_FOLDER));
    appRouter.use('/public', publicRoutes);
    
    const clientHandler = process.env.NODE_ENV == 'development' ? 
        createProxyMiddleware({target: 'http://localhost:3333/'}) : [
            (req, res, next) => {
                req.url = req.url.replace('/admin', '') || '/';
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