import { OPERATION_STATE, OperationCallback } from './types';

export default class Operation {
    #successCallbacks: Array<OperationCallback>;
    #errorCallbacks: Array<OperationCallback>;
    #status: OPERATION_STATE;
    #result: unknown;

    constructor(result: unknown = null) {
        this.#successCallbacks = [];
        this.#errorCallbacks = [];
        this.#status = result ? OPERATION_STATE.SUCESS : OPERATION_STATE.NONE;
        this.#result = result;
    }

    public resolve(value: unknown): void {
        this.proceed(OPERATION_STATE.SUCESS, value);
    }

    public reject(value: unknown): void {
        this.proceed(OPERATION_STATE.ERROR, value);
    }

    public then(resolve?: OperationCallback, reject?: OperationCallback): void {
        switch (this.#status) {
            case OPERATION_STATE.SUCESS:
                if (resolve) {
                    resolve(this.#result);
                }
                break;
            case OPERATION_STATE.ERROR:
                if (reject) {
                    reject(this.#result);
                }
                break;
            default: {
                if (resolve) {
                    this.#successCallbacks.push(resolve);
                }
                if (resolve && reject) {
                    this.#errorCallbacks.push(reject);
                }
            }
        }
    }

    private proceed(status: OPERATION_STATE, result: unknown): void {
        this.#status = status;
        this.#result = result;

        const callbacks: Array<OperationCallback> =
            status === OPERATION_STATE.ERROR ? this.#errorCallbacks : this.#successCallbacks;
        const count: number = callbacks.length;
        let i: number = 0;

        for (i = 0; i < count; ++i) {
            callbacks[i](result);
        }

        this.#successCallbacks = [];
        this.#errorCallbacks = [];
    }
}
