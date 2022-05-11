import express from 'express';
import { omit } from 'lodash';
import simpleGit, { SimpleGit, CleanOptions } from 'simple-git';
import { find, get, insertOne, updateOne } from '../services/collections';
import { Experiment } from '../types/models';
import { objectId } from '../utils/models';

const experimentsRouter = express.Router();
experimentsRouter.get('/', async (req, res) => {
    const experiments = await find('experiments', {});
    res.json(experiments);
});
experimentsRouter.post('/', async (req, res) => {
    const experiment = req.body as Experiment;
    console.log({experiment});
    let result = experiment._id && await get('experiments', experiment._id);
    if (result) {
        // dont allow editing of experiment name and git repo
        const update = omit(experiment, 'name','git');
        updateOne('experiments', experiment._id, update);
        Object.assign(result, update);
        const pullResult = await simpleGit(`${process.env.STUDY_ASSETS_FOLDER}/${experiment.name}`).pull();
    }
    else {
        const cloneResult = await new Promise(res => simpleGit().clone(
            experiment.git, 
            `${process.env.STUDY_ASSETS_FOLDER}/${experiment.name}`, 
            {}, 
            (err, data) => res({err, data})));
        experiment.user = objectId(req.userId);
        result = await insertOne('experiments', experiment);
    }
    res.json(result);
});
export default experimentsRouter;