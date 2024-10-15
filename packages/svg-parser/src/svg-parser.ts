import { INode, stringify } from 'svgson';

import formatSVG from './format-svg';
import { FlattenedData, IPoint, IPolygon, NestConfig, SVG_TAG } from './types';
import { convertElement, flattenTree } from './helpers';
import SHAPE_BUILDERS from './shape-builders';
import PlacementWrapper from './placement-wrapper';

export default class SVGParser {
    #svgRoot: INode = null;

    #bin: INode = null;

    #binPolygon: IPoint[] = null;

    #parts: INode[] = null;

    public init(svgString: string): void {
        this.#svgRoot = formatSVG(svgString);
    }

    public getPolygons(configuration: NestConfig): IPoint[][] {
        const { curveTolerance } = configuration;
        this.#parts = this.#svgRoot.children.filter(node => node.attributes.guid !== this.#bin.attributes.guid);
        this.#binPolygon = this.clearPolygon(this.#bin, curveTolerance);

        const nodeCount = this.#parts.length;
        const result: IPoint[][] = [];
        let i: number = 0;

        for (i = 0; i < nodeCount; ++i) {
            result.push(this.clearPolygon(this.#parts[i], curveTolerance));
        }

        return result;
    }

    public setBin(element: SVGElement): void {
        this.#bin = convertElement(element);
    }

    public get svgAttributes(): { [key: string]: string } {
        return this.#svgRoot.attributes;
    }

    private clearPolygon(element: INode, tolerance: number): IPoint[] {
        const tagName: SVG_TAG = element.name as SVG_TAG;

        return SHAPE_BUILDERS.has(tagName)
            ? SHAPE_BUILDERS.get(tagName).create(element, tolerance, SVGParser.SVG_TOLERANCE).getResult()
            : [];
    }

    // returns an array of SVG elements that represent the placement, for export or rendering
    public applyPlacement({
        placementsData,
        tree,
        bounds,
        angleSplit
    }: {
        placementsData: Float64Array;
        tree: IPolygon[];
        bounds: { x: number; y: number; width: number; height: number };
        angleSplit: number;
    }): string {
        const placement: PlacementWrapper = new PlacementWrapper(placementsData, angleSplit);
        const clone: INode[] = [];
        const partCount: number = this.#parts.length;
        const svgList: INode[] = [];
        let i: number = 0;
        let j: number = 0;
        let k: number = 0;
        let newSvg: INode = null;
        let binClone: INode = null;
        let part: IPolygon = null;
        let partGroup: INode = null;
        let flattened: FlattenedData = null;
        let c: INode = null;

        for (i = 0; i < partCount; ++i) {
            clone.push(JSON.parse(JSON.stringify(this.#parts[i])) as INode);
        }

        for (i = 0; i < placement.placementCount; ++i) {
            binClone = JSON.parse(JSON.stringify(this.#bin)) as INode;
            binClone.attributes.id = 'exportRoot';
            binClone.attributes.transform = `translate(${-bounds.x} ${-bounds.y})`;

            newSvg = {
                name: 'svg',
                type: 'element',
                value: '',
                attributes: {
                    viewBox: `0 0 ${bounds.width} ${bounds.height}`,
                    width: `${bounds.width}px`,
                    height: `${bounds.height}px`
                },
                children: [binClone]
            };

            placement.bindPlacement(i);

            for (j = 0; j < placement.size; ++j) {
                placement.bindData(j);
                part = tree[placement.id];

                partGroup = {
                    name: 'g',
                    type: 'element',
                    value: '',
                    // the original path could have transforms and stuff on it, so apply our transforms on a group
                    attributes: {
                        transform: `translate(${placement.x} ${placement.y}) rotate(${placement.rotation})`,
                        id: 'exportContent'
                    },
                    children: [clone[part.source]]
                };

                if (part.children && part.children.length > 0) {
                    flattened = flattenTree(part.children, true);

                    for (k = 0; k < flattened.polygons.length; ++k) {
                        c = clone[flattened.polygons[k].source];
                        // add class to indicate hole
                        if (
                            flattened.holes.includes(flattened.polygons[k].source) &&
                            (!c.attributes.class || c.attributes.class.indexOf('hole') < 0)
                        ) {
                            c.attributes.class = `${c.attributes.class} hole`;
                        }
                        partGroup.children.push(c);
                    }
                }

                newSvg.children.push(partGroup);
            }

            svgList.push(newSvg);
        }

        const resultSvg: INode = svgList.length === 1 ? svgList[0] : { ...newSvg, children: svgList };

        return stringify(resultSvg);
    }

    public get svgString(): string {
        return stringify(this.#svgRoot);
    }

    public get binPolygon(): IPoint[] {
        return this.#binPolygon;
    }

    private static SVG_TOLERANCE: number = 0.005; // fudge factor for browser inaccuracy in SVG unit handling
}
