import express from 'express';
import { omit } from 'lodash';
import simpleGit from 'simple-git';
import { deleteOne, find, get, insertOne, updateOne } from '../services/collections';
import { Experiment, Worker } from '../types/models';
import { objectId } from '../utils/models';
import { hashPassword } from './auth';
import { rmSync } from 'fs';

const experimentsRouter = express.Router();
experimentsRouter.get('/', async (req, res) => {
    const experiments = await find('experiments', {}); // TODO - show only user relevant experiments
    res.json(experiments);
});
experimentsRouter.delete('/:id', async (req, res) => {
    const experiment = await get('experiments', req.params.id);
    console.log('delte exp', {experiment});
    if (!experiment) // TODO - validate access
        res.status(400);
    const workers = await find('workers', {experiment: objectId(req.params.id)});
    if (workers?.length > 0)
        res.status(400).send(`can't delete experiment with workers`);
    rmSync(`${process.env.STUDY_ASSETS_FOLDER}/${experiment.name}`, { recursive: true, force: true });
    await deleteOne('experiments', req.params.id);
    res.status(200).send();
});
experimentsRouter.post('/', async (req, res) => {
    const experiment = req.body as Experiment;
    let result = experiment._id && await get('experiments', experiment._id);
    if (result) {
        // no need to update anything yet - just pull repo
        // const update = omit(experiment,'_id', 'name','git','user');
        // updateOne('experiments', experiment._id, update);
        // Object.assign(result, update);
        const pullResult = await simpleGit(`${process.env.STUDY_ASSETS_FOLDER}/${experiment.name}`).pull();
        console.log({pullResult});
    }
    else {
        const cloneResult = await new Promise(res => simpleGit().clone(
            experiment.git, 
            `${process.env.STUDY_ASSETS_FOLDER}/${experiment.name}`, 
            {}, 
            (err, data) => res({err, data})));
        console.log({cloneResult});
        experiment.user = objectId(req.userId);
        result = await insertOne('experiments', experiment);
    }
    res.json(result);
});
experimentsRouter.get('/:id/workers', async (req, res) => {
    const workers = await find('workers', {experiment: objectId(req.params.id)});
    res.json(workers);
});
experimentsRouter.post('/:id/workers', async (req, res) => {
    const worker = req.body as Worker;
    const experiment = await get('experiments', req.params.id); // TODO: validate user access to experiment
    if (!experiment)
        return res.status(400);
    let result = worker._id && await get('workers', worker._id);
    if (result) {
        if (!objectId(worker.experiment).equals(experiment._id))
            return res.status(400);
        const update = omit(worker, '_id', 'experiment');;
        await updateOne('workers', result._id, update);
        Object.assign(result, update);
    } else {
        result = await insertOne('workers', {...worker, experiment: experiment._id, key: hashPassword(`${worker.name}`).passwordHash});
    }
    res.json(result);
});
export default experimentsRouter;