declare namespace Express {
    export interface Request {
        userId?: string;
        userRole?: string;
        workerId?: string;
        workerExperimentId?: string;
    }
}