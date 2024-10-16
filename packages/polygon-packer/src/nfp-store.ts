import { generateNFPCacheKey, getNfpPair } from 'geometry-utils';

import { Phenotype } from './genetic-algorithm';
import { NFPPair, PlacementWorkerData, NFPCache, PolygonNode } from './types';

export default class NFPStore {
    #nfpCache: NFPCache = new Map<number, ArrayBuffer>();

    #nfpPairs: NFPPair[] = [];

    #individual: Phenotype = null;

    #angleSplit: number = 0;

    public init(individual: Phenotype, binNode: PolygonNode, angleSplit: number): void {
        this.#individual = individual;
        this.#angleSplit = angleSplit;
        this.#nfpPairs = [];

        const nodes: PolygonNode[] = this.#individual.placement;
        const rotations: number[] = this.#individual.rotation;
        const placeCount: number = nodes.length;
        const newCache: NFPCache = new Map<number, ArrayBuffer>();
        let node: PolygonNode = null;
        let i: number = 0;
        let j: number = 0;

        for (i = 0; i < placeCount; ++i) {
            node = nodes[i];
            node.rotation = rotations[i];

            this.updateCache(binNode, node, true, newCache);

            for (j = 0; j < i; ++j) {
                this.updateCache(nodes[j], node, false, newCache);
            }
        }

        // only keep cache for one cycle
        this.#nfpCache = newCache;
    }

    private update(nfps: ArrayBuffer[]): void {
        const nfpCount: number = nfps.length;

        if (nfpCount !== 0) {
            let i: number = 0;
            let view: DataView = null;

            for (i = 0; i < nfpCount; ++i) {
                view = new DataView(nfps[i]);

                if (nfps[i].byteLength > Float64Array.BYTES_PER_ELEMENT << 1) {
                    // a null nfp means the nfp could not be generated, either because the parts simply don't
                    // fit or an error in the nfp algo
                    this.#nfpCache.set(view.getFloat64(0, true), nfps[i]);
                }
            }
        }
    }

    private updateCache(polygon1: PolygonNode, polygon2: PolygonNode, inside: boolean, newCache: NFPCache): void {
        const key: number = generateNFPCacheKey(this.#angleSplit, inside, polygon1, polygon2);

        if (!this.#nfpCache.has(key)) {
            this.#nfpPairs.push(getNfpPair(key, [polygon1, polygon2]));
        } else {
            newCache.set(key, this.#nfpCache.get(key));
        }
    }

    public clean(): void {
        this.#nfpCache.clear();
        this.#nfpPairs = [];
        this.#individual = null;
    }

    public getPlacementWorkerData(generatedNfp: ArrayBuffer[], binArea: number): PlacementWorkerData {
        this.update(generatedNfp);

        return { angleSplit: this.#angleSplit, binArea, nfpCache: this.#nfpCache };
    }

    public get placement(): PolygonNode[] {
        return this.#individual.placement;
    }

    public get nfpPairs(): NFPPair[] {
        return this.#nfpPairs;
    }

    public get placementCount(): number {
        return this.#individual.placement.length;
    }

    public get fitness(): number {
        return this.#individual.fitness;
    }

    public set fitness(value: number) {
        this.#individual.fitness = value;
    }
}
