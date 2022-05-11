import express from 'express';
import routes from './routes';
import { Server } from 'http';
import { MongoClient } from 'mongodb';
import { initializeCollections } from './services/collections';

let server: Server;

const app = express();
app.disable('x-powered-by');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(require('cookie-parser')());

routes(app);

// error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.headersSent) {
        return next(err);
    }
    console.error('server error', err);
    res.status(500);
    res.render('error', { error: err });
});

// connect to mongodb
MongoClient.connect(process.env.MONGO_URI).then(client => {
    initializeCollections(client.db(), client);
    console.log('connected to db');
    const port = process.env.PORT || 3002;
    server = app.listen(port, () => console.log(process.env.NODE_ENV + ' server is running on port ' + port));
});