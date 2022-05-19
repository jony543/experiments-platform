import express from "express";
import { find, findOne, get, insertOne, updateOne } from "../services/collections";
import { Session } from "../types/models";
import { objectId } from "../utils/models";
import { idString } from "../utils/shared";
import { setWorkerCookie, verifyWorkerMiddleware } from "./auth";

const workersApi = express.Router();
workersApi.use(verifyWorkerMiddleware)
workersApi.use(async (req, res, next) => {
    if (req.workerId)
        next();
    const key = req.query.key as string;
    const worker = await findOne('workers', {key});
    if (!worker) {
        return res.status(401).send();
    }
    req.workerId = idString(worker._id);
    setWorkerCookie(res, worker);
    next();
});

workersApi.post('/sessions', async (req, res) => {
    const session = req.body as Session;
    if (session?._id) {
        await updateOne('sessions', session._id, session);
        const result = get('sessions', session._id);
        res.json(result);
    } else {
        const result = await insertOne('sessions', {...session, subId: objectId(req.workerId) });
        res.json(result);
    }
});

workersApi.get('/sessions/:sessionId', async (req, res) => {
    const session = await get('sessions', req.params.sessionId);
    res.json(session);
});

workersApi.get('/sessions', async (req, res) => {
    const sessions = await find('sessions', {subId: objectId(req.workerId)});
    res.json(sessions);
});

export default workersApi;
