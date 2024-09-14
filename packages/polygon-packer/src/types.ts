export interface IPoint {
    x: number;
    y: number;
}

export interface IPolygon extends Array<IPoint> {
    id: number;
    source: number;
    hole?: boolean;
    parent: IPolygon;
    children: IPolygon[];
    x?: number;
    y?: number;
    rotation?: number;
    width?: number;
    height?: number;
}

export type NestConfig = {
    curveTolerance: number;
    spacing: number;
    rotations: number;
    populationSize: number;
    mutationRate: number;
    useHoles: boolean;
    exploreConcave: boolean;
};

export type Placement = {
    id: number;
    rotation: number;
    x: number;
    y: number;
};

export type BoundRect = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export type NFPContent = {
    A: number;
    B: number;
    inside: boolean;
    Arotation: number;
    Brotation: number;
};

export type NFPPair = {
    A: IPolygon;
    B: IPolygon;
    length?: number;
    key: number;
    [key: number]: IPolygon;
};

export type NFPData = { value: NFPPair; key: number };

export enum THREAD_TYPE {
    PLACEMENT = 'placement',
    PAIR = 'pair'
}

export type NFPCache = Map<number, Float64Array>;

export type PlacementWorkerData = {
    angleSplit: number;
    binPolygon: IPolygon;
    paths: IPolygon[];
    ids: number[];
    rotations: number[];
    config: NestConfig;
    nfpCache: NFPCache;
};

export interface PlacementWorkerResult {
    placements: number[][];
    pathItems: number[][];
    fitness: number;
    area: number;
}

export type DisplayCallback = (
    placementData: PlacementData,
    placePerecntage: number,
    lacedParts: number,
    partCount: number
) => void;

export type PlacementData = {
    placements: number[][];
    pathItems: number[][];
    tree: IPolygon[];
    bounds: BoundRect;
    angleSplit: number;
};

export type ThreadData = {
    env: NestConfig;
    id: string;
    data: IPolygon[] | NFPPair;
};

export type ThreadOutput = PlacementWorkerResult | Float64Array | null;

export type ThreadInput = IPolygon[] | NFPPair;
