import express, { Application } from 'express';
import path from 'path';
import { createProxyMiddleware } from 'http-proxy-middleware';
import authRouter, { verifyMiddleware } from './auth';

export default (app: Application) => {
    app.get('/', (req, res) => {
        return res.status(200).send('OK');
    });
    
    app.use('/auth', authRouter);
    const router = express.Router();
    router.use(verifyMiddleware);
    app.use('/admin-api', router);
    

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