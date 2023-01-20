import express from "express";
import { find, get, create, update } from "../services/collections";
import { Session } from "../types/models";
import { objectId } from "../utils/models";
import { verifyWorkerMiddleware } from "./auth";

const workersApi = express.Router();
workersApi.use(verifyWorkerMiddleware)

workersApi.post('/sessions', async (req, res) => {
    const session = req.body as Session;
    if (session?._id) {
        await update('sessions', session._id, session);
        const result = await get('sessions', session._id);
        res.json(result);
    } else {
        const [_id] = await create('sessions', { ...session, subId: objectId(req.workerId) });
        res.json({_id});
    }
});

workersApi.get('/sessions/:sessionId', async (req, res) => {
    const session = await get('sessions', req.params.sessionId);
    res.json(session);
});

workersApi.get('/sessions', async (req, res) => {
    const sessions = await find('sessions', { subId: objectId(req.workerId) });
    res.json(sessions);
});

export default workersApi;
