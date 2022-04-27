import express from 'express';
import routes from './routes';
import { Server } from 'http';
import { MongoClient } from 'mongodb';
import { Collections } from './services/collections';

let server: Server;

const app = express();
app.disable('x-powered-by');
// app.use(compression); // npm compression
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(require('cookie-parser')());

routes(app);

// error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err);
    return res.status(500).send();
});

// handle server close/restart
// const closeServer = async () => {
//     console.log('closing server and db');
//     server && server.close((err) => console.log('server closed', {err}));
//     // mongoClient && mongoClient.close(false);
// }
// ['SIGTERM', 'SIGINT'].forEach(sig => {
//     process.on(sig, () => {
//         console.log(sig + ' signal received');
//         closeServer();
//     });
// });

// connect to mongodb
MongoClient.connect(process.env.MONGO_URI).then(client => {
    // mongoClient = client;
    Collections.initialize(client.db(), client);
    console.log('connected to db');
    const port = process.env.PORT || 3002;
    server = app.listen(port, () => console.log(process.env.NODE_ENV + ' server is running on port ' + port));
});