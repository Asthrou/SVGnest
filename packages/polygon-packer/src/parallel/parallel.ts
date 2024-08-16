﻿import { WORKER_TYPE, WorkerInput, WorkerOutput } from '../types';
import DedicatedWorkerWrapper from './dedicated-worker-wrapper';
import SharedWorkerWrapper from './shared-worker-wrapper';
import { IWorker, Options, WorkerTarget } from './types';

export default class Parallel {
    #threadsUsage: boolean[];

    #threadCount: number;

    #instance: IWorker;

    #threads: IWorker[];

    #input: WorkerInput[] = null;

    #output: WorkerOutput[] = null;

    #threadIndices: number[];

    #options: Options = { id: WORKER_TYPE.PAIR, env: null };

    #isTerminated: boolean = true;

    #iterationCount: number = 0;

    #startedThreads: number = 0;

    #totalThreads: number = 0;

    #isSharedWorkerSupported: boolean = typeof SharedWorker !== undefined;

    #onError: (error: ErrorEvent) => void = null;

    #onSuccess: (result: WorkerOutput[]) => void = null;

    #onSpawn: () => void = null;

    constructor() {
        this.#instance = this.#isSharedWorkerSupported ? new SharedWorkerWrapper() : new DedicatedWorkerWrapper();
        this.#threadCount = navigator.hardwareConcurrency || 4;
        this.#threadsUsage = new Array(this.#threadCount);
        this.#threads = new Array(this.#threadCount);
        this.#threadIndices = new Array(this.#threadCount);

        this.#threadsUsage.fill(false);
        this.#threads.fill(null);
        this.#threadIndices.fill(-1);
    }

    public start(
        id: WORKER_TYPE,
        input: WorkerInput[],
        env: object,
        onSuccess: (result: WorkerOutput[]) => void,
        onError: (error: ErrorEvent) => void,
        onSpawn: () => void = null
    ): boolean {
        if (input.length === 0) {
            this.onError(new ErrorEvent('Empty data'));
            return false;
        }

        this.#onError = onError;
        this.#onSuccess = onSuccess;
        this.#onSpawn = onSpawn;
        this.#options.id = id;
        this.#options.env = env;
        this.#iterationCount = 0;
        this.#startedThreads = 0;
        this.#input = input;
        this.#totalThreads = input.length;
        this.#output = new Array(this.#totalThreads);
        let i: number = 0;

        this.#threadsUsage.fill(false);
        this.#threadIndices.fill(-1);

        if (this.#isTerminated) {
            for (i = 0; i < this.#threadCount; ++i) {
                this.#threads[i] = this.#instance.clone();
            }

            this.#isTerminated = false;
        }

        while (this.#startedThreads < this.#totalThreads && this.#threadsUsage.indexOf(false) !== -1) {
            this.trigger();
        }

        return true;
    }

    public terminate(): void {
        let i: number = 0;

        for (i = 0; i < this.#threadCount; ++i) {
            if (this.#threads[i] !== null) {
                this.#threads[i].terminate();
                this.#threads[i] = null;
            }
            this.#threadsUsage[i] = false;
            this.#threadIndices[i] = -1;
        }

        this.#isTerminated = true;
    }

    private trigger(): boolean {
        const index: number = this.#threadsUsage.indexOf(false);

        if (index === -1) {
            return false;
        }

        this.#threadsUsage[index] = true;

        const thread = this.#threads[index];
        const threadIndex: number = this.#startedThreads;

        ++this.#startedThreads;

        this.#threadIndices[index] = threadIndex;

        if (this.#onSpawn !== null) {
            this.#onSpawn();
        }

        thread.trigger({ ...this.#options, data: this.#input[threadIndex] }, this.onMessage, this.onError);

        return true;
    }

    private onMessage = (message: MessageEvent<WorkerOutput>) => {
        const index = this.clean(message.currentTarget as MessagePort | Worker);
        const threadIndex = this.#threadIndices[index];

        this.#output[threadIndex] = message.data;

        if (this.#iterationCount === this.#totalThreads) {
            this.#onSuccess(this.#output);
            return;
        }

        if (this.#startedThreads < this.#totalThreads) {
            this.trigger();
        }
    };

    private onError = (error: ErrorEvent) => {
        this.clean(error.currentTarget as WorkerTarget);
        this.#onError(error);
    };

    private clean(target: WorkerTarget): number {
        let i: number = 0;

        for (i = 0; i < this.#threadCount; ++i) {
            if (this.#threads[i].getInstance(target)) {
                break;
            }
        }

        this.#threadsUsage[i] = false;
        ++this.#iterationCount;

        return i;
    }
}
