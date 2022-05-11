import express from 'express';

const garminRouter = express.Router();

// example
garminRouter.get('/activities', (req, res) => {
    return res.status(200).send('result!');
});

export default garminRouter;
