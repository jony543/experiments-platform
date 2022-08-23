export type AuthParams = {username: string; password: string; newPassword?: string;};

export type WorkersBatchCreationData = {size: number, name: string};

export class ApiError extends Error {
    errorType: 'badRequest' | 'unauthorized';
    constructor (errorType: 'badRequest' | 'unauthorized', message: string) {
        super(message);
        this.message = message;
        this.name = 'API Error';
        this.errorType = errorType;
    }
}