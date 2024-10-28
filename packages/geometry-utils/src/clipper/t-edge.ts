import Point from '../point';
import { HORIZONTAL } from './constants';
import { Cast_Int64, clipperRound, mulInt128, op_Equality, op_EqualityInt128 } from './helpers';
import { PolyType, EdgeSide, PolyFillType, ClipType } from './types';

export default class TEdge {
    public Bot: Point;
    public Curr: Point;
    public Top: Point;
    public Delta: Point;
    public Dx: number;
    public PolyTyp: PolyType;
    public Side: EdgeSide;
    public WindDelta: number;
    public WindCnt: number;
    public WindCnt2: number;
    public OutIdx: number;
    public Next: TEdge;
    public Prev: TEdge;
    public NextInLML: TEdge;
    public NextInAEL: TEdge;
    public PrevInAEL: TEdge;
    public NextInSEL: TEdge;
    public PrevInSEL: TEdge;

    constructor() {
        this.Bot = Point.zero();
        this.Curr = Point.zero();
        this.Top = Point.zero();
        this.Delta = Point.zero();
        this.Dx = 0;
        this.PolyTyp = PolyType.ptSubject;
        this.Side = EdgeSide.esLeft;
        this.WindDelta = 0;
        this.WindCnt = 0;
        this.WindCnt2 = 0;
        this.OutIdx = 0;
        this.Next = null;
        this.Prev = null;
        this.NextInLML = null;
        this.NextInAEL = null;
        this.PrevInAEL = null;
        this.NextInSEL = null;
        this.PrevInSEL = null;
    }

    public init(nextEdge: TEdge, prevEdge: TEdge, point: Point): void {
        this.Next = nextEdge;
        this.Prev = prevEdge;
        //e.Curr = pt;
        this.Curr.x = point.x;
        this.Curr.y = point.y;
        this.OutIdx = -1;
    }

    public initFromPolyType(polyType: PolyType): void {
        if (this.Curr.y >= this.Next.Curr.y) {
            //e.Bot = e.Curr;
            this.Bot.x = this.Curr.x;
            this.Bot.y = this.Curr.y;
            //e.Top = e.Next.Curr;
            this.Top.x = this.Next.Curr.x;
            this.Top.y = this.Next.Curr.y;
        } else {
            //e.Top = e.Curr;
            this.Top.x = this.Curr.x;
            this.Top.y = this.Curr.y;
            //e.Bot = e.Next.Curr;
            this.Bot.x = this.Next.Curr.x;
            this.Bot.y = this.Next.Curr.y;
        }

        this.setDx();

        this.PolyTyp = polyType;
    }

    public remove(): TEdge {
        const result: TEdge = this.Next;
        //removes e from double_linked_list (but without removing from memory)
        this.Prev.Next = this.Next;
        this.Next.Prev = this.Prev;
        this.Prev = null; //flag as removed (see ClipperBase.Clear)
        this.Next = null;

        return result;
    }

    public reverseHorizontal(): void {
        //swap horizontal edges' top and bottom x's so they follow the natural
        //progression of the bounds - ie so their xbots will align with the
        //adjoining lower edge. [Helpful in the ProcessHorizontal() method.]
        const tmp: number = this.Top.x;
        this.Top.x = this.Bot.x;
        this.Bot.x = tmp;
    }

    public findNextLocMin(): TEdge {
        let result: TEdge = this;
        let edge: TEdge = null;

        while (true) {
            while (!op_Equality(result.Bot, result.Prev.Bot) || op_Equality(result.Curr, result.Top)) {
                result = result.Next;
            }

            if (result.Dx !== HORIZONTAL && result.Prev.Dx !== HORIZONTAL) {
                break;
            }

            while (result.Prev.Dx === HORIZONTAL) {
                result = result.Prev;
            }

            edge = result;

            while (result.Dx === HORIZONTAL) {
                result = result.Next;
            }
            if (result.Top.y == result.Prev.Bot.y) {
                continue;
            }
            //ie just an intermediate horz.
            if (edge.Prev.Bot.x < result.Bot.x) {
                result = edge;
            }

            break;
        }

        return result;
    }

    public setDx(): void {
        this.Delta.x = this.Top.x - this.Bot.x;
        this.Delta.y = this.Top.y - this.Bot.y;

        if (this.Delta.y === 0) {
            this.Dx = HORIZONTAL;
        } else {
            this.Dx = this.Delta.x / this.Delta.y;
        }
    }

    public reset(side: EdgeSide): void {
        this.Curr.x = this.Bot.x;
        this.Curr.y = this.Bot.y;
        this.Side = side;
        this.OutIdx = TEdge.Unassigned;
    }

    public copyAELToSEL(): TEdge {
        this.PrevInSEL = this.PrevInAEL;
        this.NextInSEL = this.NextInAEL;

        return this.NextInAEL;
    }

    public topX(currentY: number): number {
        //if (edge.Bot == edge.Curr) alert ("edge.Bot = edge.Curr");
        //if (edge.Bot == edge.Top) alert ("edge.Bot = edge.Top");
        return currentY === this.Top.y ? this.Top.x : this.Bot.x + clipperRound(this.Dx * (currentY - this.Bot.y));
    }

    public deleteFromSEL(inputEdge: TEdge): TEdge | null {
        if (this.PrevInSEL === null && this.NextInSEL === null && this !== inputEdge) {
            return inputEdge;
        }

        let result: TEdge = inputEdge;
        //already deleted
        if (this.PrevInSEL !== null) {
            this.PrevInSEL.NextInSEL = this.NextInSEL;
        } else {
            result = this.NextInSEL;
        }

        if (this.NextInSEL !== null) {
            this.NextInSEL.PrevInSEL = this.PrevInSEL;
        }

        this.NextInSEL = null;
        this.PrevInSEL = null;

        return result;
    }

    public deleteFromAEL(inputEdge: TEdge): TEdge | null {
        if (this.PrevInAEL === null && this.NextInAEL === null && this !== inputEdge) {
            return inputEdge;
        }

        let result: TEdge = inputEdge;
        //already deleted
        if (this.PrevInAEL !== null) {
            this.PrevInAEL.NextInAEL = this.NextInAEL;
        } else {
            result = this.NextInAEL;
        }
        if (this.NextInAEL !== null) {
            this.NextInAEL.PrevInAEL = this.PrevInAEL;
        }

        this.NextInAEL = null;
        this.PrevInAEL = null;

        return result;
    }

    public getIntermediate(y: number): boolean {
        return this.Top.y == y && this.NextInLML !== null;
    }

    public get isHorizontal(): boolean {
        return this.Delta.y === 0;
    }

    public getContributing(clipType: ClipType, clipFillType: PolyFillType, subjectFillType: PolyFillType): boolean {
        let pft: PolyFillType = PolyFillType.pftEvenOdd;
        let pft2: PolyFillType = PolyFillType.pftEvenOdd;

        if (this.PolyTyp == PolyType.ptSubject) {
            pft = subjectFillType;
            pft2 = clipFillType;
        } else {
            pft = clipFillType;
            pft2 = subjectFillType;
        }

        switch (pft) {
            case PolyFillType.pftEvenOdd:
                if (this.WindDelta === 0 && this.WindCnt != 1) {
                    return false;
                }
                break;
            case PolyFillType.pftNonZero:
                if (Math.abs(this.WindCnt) != 1) {
                    return false;
                }
                break;
            case PolyFillType.pftPositive:
                if (this.WindCnt != 1) {
                    return false;
                }
                break;
            default:
                if (this.WindCnt != -1) {
                    return false;
                }
                break;
        }

        switch (clipType) {
            case ClipType.ctIntersection:
                switch (pft2) {
                    case PolyFillType.pftEvenOdd:
                    case PolyFillType.pftNonZero:
                        return this.WindCnt2 !== 0;
                    case PolyFillType.pftPositive:
                        return this.WindCnt2 > 0;
                    default:
                        return this.WindCnt2 < 0;
                }
            case ClipType.ctUnion:
                switch (pft2) {
                    case PolyFillType.pftEvenOdd:
                    case PolyFillType.pftNonZero:
                        return this.WindCnt2 === 0;
                    case PolyFillType.pftPositive:
                        return this.WindCnt2 <= 0;
                    default:
                        return this.WindCnt2 >= 0;
                }
            case ClipType.ctDifference:
                if (this.PolyTyp == PolyType.ptSubject) {
                    switch (pft2) {
                        case PolyFillType.pftEvenOdd:
                        case PolyFillType.pftNonZero:
                            return this.WindCnt2 === 0;
                        case PolyFillType.pftPositive:
                            return this.WindCnt2 <= 0;
                        default:
                            return this.WindCnt2 >= 0;
                    }
                } else {
                    switch (pft2) {
                        case PolyFillType.pftEvenOdd:
                        case PolyFillType.pftNonZero:
                            return this.WindCnt2 !== 0;
                        case PolyFillType.pftPositive:
                            return this.WindCnt2 > 0;
                        default:
                            return this.WindCnt2 < 0;
                    }
                }
            case ClipType.ctXor:
                if (this.WindDelta === 0)
                    switch (pft2) {
                        case PolyFillType.pftEvenOdd:
                        case PolyFillType.pftNonZero:
                            return this.WindCnt2 === 0;
                        case PolyFillType.pftPositive:
                            return this.WindCnt2 <= 0;
                        default:
                            return this.WindCnt2 >= 0;
                    }
                else {
                    return true;
                }
        }
    }

    public insertsBefore(edge: TEdge): boolean {
        if (this.Curr.x == edge.Curr.x) {
            if (this.Top.y > edge.Top.y) return this.Top.x < edge.topX(this.Top.y);
            else return edge.Top.x > this.topX(edge.Top.y);
        } else return this.Curr.x < edge.Curr.x;
    }

    public static intersectPoint(edge1: TEdge, edge2: TEdge, ip: Point, useFullRange: boolean): boolean {
        ip.x = 0;
        ip.y = 0;
        let b1: number = 0;
        let b2: number = 0;
        //nb: with very large coordinate values, it's possible for SlopesEqual() to
        //return false but for the edge.Dx value be equal due to double precision rounding.
        if (TEdge.slopesEqual(edge1, edge2, useFullRange) || edge1.Dx == edge2.Dx) {
            if (edge2.Bot.y > edge1.Bot.y) {
                ip.x = edge2.Bot.x;
                ip.y = edge2.Bot.y;
            } else {
                ip.x = edge1.Bot.x;
                ip.y = edge1.Bot.y;
            }

            return false;
        }

        if (edge1.Delta.x === 0) {
            ip.x = edge1.Bot.x;
            if (edge2.isHorizontal) {
                ip.y = edge2.Bot.y;
            } else {
                b2 = edge2.Bot.y - edge2.Bot.x / edge2.Dx;
                ip.y = clipperRound(ip.x / edge2.Dx + b2);
            }
        } else if (edge2.Delta.x === 0) {
            ip.x = edge2.Bot.x;

            if (edge1.isHorizontal) {
                ip.y = edge1.Bot.y;
            } else {
                b1 = edge1.Bot.y - edge1.Bot.x / edge1.Dx;
                ip.y = clipperRound(ip.x / edge1.Dx + b1);
            }
        } else {
            b1 = edge1.Bot.x - edge1.Bot.y * edge1.Dx;
            b2 = edge2.Bot.x - edge2.Bot.y * edge2.Dx;
            const q: number = (b2 - b1) / (edge1.Dx - edge2.Dx);

            ip.y = clipperRound(q);
            ip.x = Math.abs(edge1.Dx) < Math.abs(edge2.Dx) ? clipperRound(edge1.Dx * q + b1) : clipperRound(edge2.Dx * q + b2);
        }

        if (ip.y < edge1.Top.y || ip.y < edge2.Top.y) {
            if (edge1.Top.y > edge2.Top.y) {
                ip.y = edge1.Top.y;
                ip.x = edge2.topX(edge1.Top.y);

                return ip.x < edge1.Top.x;
            }

            ip.y = edge2.Top.y;
            ip.x = Math.abs(edge1.Dx) < Math.abs(edge2.Dx) ? edge1.topX(ip.y) : edge2.topX(ip.y);
        }

        return true;
    }

    public static slopesEqual(e1: TEdge, e2: TEdge, useFullRange: boolean): boolean {
        return useFullRange
            ? op_EqualityInt128(mulInt128(e1.Delta.y, e2.Delta.x), mulInt128(e1.Delta.x, e2.Delta.y))
            : Cast_Int64(e1.Delta.y * e2.Delta.x) == Cast_Int64(e1.Delta.x * e2.Delta.y);
    }

    public static swapPositionsInAEL(edge1: TEdge, edge2: TEdge): boolean {
        //check that one or other edge hasn't already been removed from AEL ...
        if (edge1.NextInAEL == edge1.PrevInAEL || edge2.NextInAEL == edge2.PrevInAEL) {
            return false;
        }

        let prev: TEdge | null = null;
        let next: TEdge | null = null;

        if (edge1.NextInAEL == edge2) {
            next = edge2.NextInAEL;

            if (next !== null) {
                next.PrevInAEL = edge1;
            }

            prev = edge1.PrevInAEL;

            if (prev !== null) {
                prev.NextInAEL = edge2;
            }

            edge2.PrevInAEL = prev;
            edge2.NextInAEL = edge1;
            edge1.PrevInAEL = edge2;
            edge1.NextInAEL = next;

            return true;
        }

        if (edge2.NextInAEL == edge1) {
            next = edge1.NextInAEL;

            if (next !== null) {
                next.PrevInAEL = edge2;
            }

            prev = edge2.PrevInAEL;

            if (prev !== null) {
                prev.NextInAEL = edge1;
            }

            edge1.PrevInAEL = prev;
            edge1.NextInAEL = edge2;
            edge2.PrevInAEL = edge1;
            edge2.NextInAEL = next;

            return true;
        }

        next = edge1.NextInAEL;
        prev = edge1.PrevInAEL;
        edge1.NextInAEL = edge2.NextInAEL;

        if (edge1.NextInAEL !== null) {
            edge1.NextInAEL.PrevInAEL = edge1;
        }

        edge1.PrevInAEL = edge2.PrevInAEL;

        if (edge1.PrevInAEL !== null) {
            edge1.PrevInAEL.NextInAEL = edge1;
        }

        edge2.NextInAEL = next;

        if (edge2.NextInAEL !== null) {
            edge2.NextInAEL.PrevInAEL = edge2;
        }

        edge2.PrevInAEL = prev;

        if (edge2.PrevInAEL !== null) {
            edge2.PrevInAEL.NextInAEL = edge2;
        }

        return true;
    }

    public static swapPositionsInSEL(edge1: TEdge, edge2: TEdge): boolean {
        if ((edge1.NextInSEL === null && edge1.PrevInSEL === null) || (edge2.NextInSEL === null && edge2.PrevInSEL === null)) {
            return false;
        }

        let prev: TEdge | null = null;
        let next: TEdge | null = null;

        if (edge1.NextInSEL == edge2) {
            next = edge2.NextInSEL;

            if (next !== null) {
                next.PrevInSEL = edge1;
            }

            prev = edge1.PrevInSEL;

            if (prev !== null) {
                prev.NextInSEL = edge2;
            }

            edge2.PrevInSEL = prev;
            edge2.NextInSEL = edge1;
            edge1.PrevInSEL = edge2;
            edge1.NextInSEL = next;

            return true;
        }

        if (edge2.NextInSEL == edge1) {
            next = edge1.NextInSEL;

            if (next !== null) {
                next.PrevInSEL = edge2;
            }

            prev = edge2.PrevInSEL;

            if (prev !== null) {
                prev.NextInSEL = edge1;
            }

            edge1.PrevInSEL = prev;
            edge1.NextInSEL = edge2;
            edge2.PrevInSEL = edge1;
            edge2.NextInSEL = next;

            return true;
        }

        next = edge1.NextInSEL;
        prev = edge1.PrevInSEL;

        edge1.NextInSEL = edge2.NextInSEL;

        if (edge1.NextInSEL !== null) {
            edge1.NextInSEL.PrevInSEL = edge1;
        }

        edge1.PrevInSEL = edge2.PrevInSEL;

        if (edge1.PrevInSEL !== null) {
            edge1.PrevInSEL.NextInSEL = edge1;
        }
        edge2.NextInSEL = next;

        if (edge2.NextInSEL !== null) {
            edge2.NextInSEL.PrevInSEL = edge2;
        }

        edge2.PrevInSEL = prev;

        if (edge2.PrevInSEL !== null) {
            edge2.PrevInSEL.NextInSEL = edge2;
        }

        return true;
    }

    public static swapSides(edge1: TEdge, edge2: TEdge): void {
        const side: EdgeSide = edge1.Side;
        edge1.Side = edge2.Side;
        edge2.Side = side;
    }
    public static swapPolyIndexes(edge1: TEdge, edge2: TEdge): void {
        const outIdx: number = edge1.OutIdx;
        edge1.OutIdx = edge2.OutIdx;
        edge2.OutIdx = outIdx;
    }

    private static Unassigned = -1;
}