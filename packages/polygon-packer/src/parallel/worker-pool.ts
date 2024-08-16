import { WORKER_TYPE } from '../types';
import DedicatedWorkerWrapper from './dedicated-worker-wrapper';
import SharedWorkerWrapper from './shared-worker-wrapper';
import { IWorker, Options } from './types';

export default class WorkerPool {
    #usedWorkers: boolean[];

    #workerCount: number;

    #instance: IWorker;

    #workers: IWorker[] = [];

    #options: Options = { id: WORKER_TYPE.PAIR, env: null };

    #isTerminated: boolean = true;

    constructor() {
        this.#instance = typeof SharedWorker !== undefined ? new SharedWorkerWrapper() : new DedicatedWorkerWrapper();
        this.#workerCount = navigator.hardwareConcurrency || 4;
        this.#usedWorkers = new Array(this.#workerCount);
        this.#workers = new Array(this.#workerCount);

        this.#usedWorkers.fill(false);
        this.#workers.fill(null);
    }

    public update(id: WORKER_TYPE, env: object): void {
        this.#options.id = id;
        this.#options.env = env;
        let i: number = 0;

        this.#usedWorkers.fill(false);

        if (this.#isTerminated) {
            for (i = 0; i < this.#workerCount; ++i) {
                this.#workers[i] = this.#instance.clone();
            }

            this.#isTerminated = false;
        }
    }

    public spawn(inputId: number = -1): number {
        if (inputId !== -1) {
            return inputId;
        }

        const index = this.#usedWorkers.indexOf(false);

        if (index !== -1) {
            this.#usedWorkers[index] = true;
        }

        return index;
    }

    public trigger(
        id: number,
        onMessage: (message: MessageEvent) => void,
        onError: (error: ErrorEvent) => void,
        data: unknown
    ): boolean {
        if (id === -1) {
            return false;
        }

        const worker = this.#workers[id];

        worker.trigger({ ...this.#options, data }, onMessage, onError);

        return true;
    }

    public clean(id: number): void {
        this.#usedWorkers[id] = false;
    }

    public terminateAll(): void {
        let i: number = 0;

        for (i = 0; i < this.#workerCount; ++i) {
            if (this.#workers[i] !== null) {
                this.#workers[i].terminate();
                this.#workers[i] = null;
            }
            this.#usedWorkers[i] = false;
        }

        this.#isTerminated = true;
    }

    public get isEmpty(): boolean {
        return this.#usedWorkers.indexOf(false) === -1;
    }

    public get workerCount(): number {
        return this.#workerCount;
    }
}
