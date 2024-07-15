import { Phenotype } from './genetic-algorithm';
import { IPolygon, NestConfig, NFPData, NFPPair } from './types';

export default class NFPStore {
    #nfpCache: { [key: string]: NFPPair } = {};

    #nfpPairs: NFPPair[] = [];

    #ids: number[] = [];

    #individual: Phenotype = null;

    public init(individual: Phenotype, binPolygon: IPolygon): void {
        this.#individual = individual;
        this.#nfpPairs = [];
        this.#ids = [];

        const placeList = this.#individual.placement;
        const rotations = this.#individual.rotation;
        const placeCount = placeList.length;
        const newCache: { [key: string]: NFPPair } = {};
        let part = null;
        let i = 0;
        let j = 0;

        for (i = 0; i < placeCount; ++i) {
            part = placeList[i];
            this.#ids.push(part.id);
            part.rotation = rotations[i];

            this.updateCache(binPolygon, part, 0, rotations[i], true, newCache);

            for (j = 0; j < i; ++j) {
                this.updateCache(placeList[j], part, rotations[j], rotations[i], false, newCache);
            }
        }

        // only keep cache for one cycle
        this.#nfpCache = newCache;
    }

    private update(generatedNfp: NFPData[]): { [key: string]: NFPPair } {
        if (generatedNfp) {
            const nfpCount: number = generatedNfp.length;
            let i: number = 0;
            let nfp: NFPData = null;
            let key = '';

            for (i = 0; i < nfpCount; ++i) {
                nfp = generatedNfp[i];

                if (nfp) {
                    // a null nfp means the nfp could not be generated, either because the parts simply don't
                    // fit or an error in the nfp algo
                    key = JSON.stringify(nfp.key);
                    this.#nfpCache[key] = nfp.value;
                }
            }
        }

        return this.#nfpCache;
    }

    private updateCache(
        polygon1: IPolygon,
        polygon2: IPolygon,
        rotation1: number,
        rotation2: number,
        inside: boolean,
        newCache: { [key: string]: NFPPair }
    ): void {
        const key = {
            A: polygon1.id,
            B: polygon2.id,
            inside,
            Arotation: rotation1,
            Brotation: rotation2
        };

        const stringKey = JSON.stringify(key);

        if (!this.#nfpCache[stringKey]) {
            this.#nfpPairs.push({ A: polygon1, B: polygon2, key });
        } else {
            newCache[stringKey] = this.#nfpCache[stringKey];
        }
    }

    public clean(): void {
        this.#nfpCache = {};
        this.#nfpPairs = [];
        this.#ids = [];
        this.#individual = null;
    }

    public getPlacementWorkerData(generatedNfp: NFPData[], config: NestConfig, binPolygon: IPolygon) {
        this.update(generatedNfp);

        return {
            binPolygon,
            paths: this.clonePlacement(),
            ids: this.#ids,
            rotations: this.#individual.rotation,
            config,
            nfpCache: this.#nfpCache
        };
    }

    public clonePlacement(): IPolygon[] {
        return this.#individual.placement.slice();
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