import express from 'express';
import { omit } from 'lodash';
import simpleGit from 'simple-git';
import stream from 'stream';
import { deleteOne, find, get, create, update, findOne } from '../services/collections';
import { Experiment, Worker } from '../types/models';
import { objectId } from '../utils/models';
import { hashPassword } from './auth';
import { rmSync, existsSync } from 'fs';
import { WorkersBatchCreationData } from '../types/api';

const experimentsRouter = express.Router();
experimentsRouter.get('/', async (req, res) => {
    const experiments = await find('experiments', {}); // TODO - show only user relevant experiments
    res.json(experiments);
});
const RESULT_BATCH = 20;
experimentsRouter.get('/:id/results/:download?', async (req, res) => {
    const download = req.params.download === 'download';
    
    const experiment = await get('experiments', req.params.id);
    if (!experiment) // TODO - validate access
        return res.status(400).send('Experiment does not exist');

    const workers = await find('workers', {experiment: objectId(req.params.id)}, {projection: {_id: 1}});
    
    const responseStream = download ? new stream.PassThrough() : res;
    if (download) {
        responseStream.pipe(res);
        res.set('Content-disposition', 'attachment; filename=results.json');
        res.set('Content-Type', 'application/json');
    }
    
    if (!workers?.length) {
        responseStream.write('[]');
        responseStream.end();
        return;
    }

    responseStream.write('[');
    let sessions;
    let count = 0;
    while ((sessions = await find('sessions', {subId: {$in: workers.map(w => w._id)}}, {skip: count, limit: RESULT_BATCH})).length) {
        count += sessions.length;
        res.write(JSON.stringify(sessions));
    }
    console.log('experiment results', {experiment: req.params.id, download, count});
    responseStream.write(']');
    responseStream.end();
});
experimentsRouter.delete('/:id', async (req, res) => {
    const experiment = await get('experiments', req.params.id);
    if (!experiment) // TODO - validate access
        return res.status(400).send('Experiment does not exist');
    const workers = await find('workers', {experiment: objectId(req.params.id)});
    if (workers?.length > 0)
        return res.status(400).send(`can't delete experiment with workers`);
    rmSync(`${process.env.STUDY_ASSETS_FOLDER}/${experiment.name}`, { recursive: true, force: true });
    await deleteOne('experiments', req.params.id);
    res.status(200).send();
});
experimentsRouter.post('/', async (req, res) => {
    const experiment = req.body as Experiment;
    let result = experiment._id && await get('experiments', experiment._id);
    const directory = `${process.env.STUDY_ASSETS_FOLDER}/${experiment.name}`;
    if (result) {
        // no need to update anything yet - just pull repo
        // const update = omit(experiment,'_id', 'name','git','user');
        // updateOne('experiments', experiment._id, update);
        // Object.assign(result, update);
        if (existsSync(directory)) {
            const pullResult = await simpleGit(directory).pull();
            console.log({pullResult});
        } else {
            const cloneResult = await new Promise(res => simpleGit().clone(experiment.git, directory, {}, (err, data) => res({err, data})));
            console.log({cloneResult});
        }
    }
    else {
        const cloneResult = await new Promise(res => simpleGit().clone(experiment.git, directory, {}, (err, data) => res({err, data})));
        console.log({cloneResult});
        experiment.user = objectId(req.userId);
        const [newExperimentId] = await create('experiments', experiment);
        result = await get('experiments', newExperimentId);
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
        return res.status(400).send('Experiment does not exists');
    let result = worker._id && await get('workers', worker._id);
    if (result) {
        if (!objectId(worker.experiment).equals(experiment._id))
            return res.status(400).send('Unexpected expriment field for worker');
        const updateData = omit(worker, '_id', 'experiment');;
        await update('workers', result._id, updateData);
        Object.assign(result, updateData);
    } else {
        const [newWorkerId] = await create('workers', {...worker, experiment: experiment._id, key: hashPassword(`${worker.name}`).passwordHash});
        result = await get('workers', newWorkerId);
    }
    res.json(result);
});
experimentsRouter.post('/:id/batches', async (req, res) => {
    const {size, name: batchName} = req.body as WorkersBatchCreationData;
    const experiment = await get('experiments', req.params.id); // TODO: validate user access to experiment
    if (!experiment)
        return res.status(400).send('Experiment does not exists');

    const getWorkerName = (id: number) => `${batchName}-${id}`;
    const existing = await findOne('workers', {experiment: experiment._id, name: getWorkerName(1)});
    if (existing)
        return res.status(400).send('A batch with the same name was already created');
        
    const newWorkers = [...Array(size)].map((ignore, idx) => {
        const name = getWorkerName(idx);
        console.log({ignore, name, idx});
        return {experiment: experiment._id, name, key: hashPassword(name).passwordHash} as Worker;
    });
    await create('workers', newWorkers);

    res.json({succuss: true});
});
export default experimentsRouter;