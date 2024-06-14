import { PATH_TAG } from '../types';
import { PATH_SEGMENT_TYPE } from '../types';

export const SEGMENT_NAMES = new Map<PATH_TAG, string>([
    [PATH_TAG.z, 'SVGPathSegClosePath'],
    [PATH_TAG.M, 'SVGPathSegMovetoAbs'],
    [PATH_TAG.m, 'SVGPathSegMovetoRel'],
    [PATH_TAG.L, 'SVGPathSegLinetoAbs'],
    [PATH_TAG.l, 'SVGPathSegLinetoRel'],
    [PATH_TAG.C, 'SVGPathSegCurvetoCubicAbs'],
    [PATH_TAG.c, 'SVGPathSegCurvetoCubicRel'],
    [PATH_TAG.Q, 'SVGPathSegCurvetoQuadraticAbs'],
    [PATH_TAG.q, 'SVGPathSegCurvetoQuadraticRel'],
    [PATH_TAG.A, 'SVGPathSegArcAbs'],
    [PATH_TAG.a, 'SVGPathSegArcRel'],
    [PATH_TAG.S, 'SVGPathSegCurvetoCubicSmoothAbs'],
    [PATH_TAG.s, 'SVGPathSegCurvetoCubicSmoothRel'],
    [PATH_TAG.T, 'SVGPathSegCurvetoQuadraticSmoothAbs'],
    [PATH_TAG.t, 'SVGPathSegCurvetoQuadraticSmoothRel'],
    [PATH_TAG.H, 'SVGPathSegLinetoHorizontalAbs'],
    [PATH_TAG.h, 'SVGPathSegLinetoHorizontalRel'],
    [PATH_TAG.V, 'SVGPathSegLinetoVerticalAbs'],
    [PATH_TAG.v, 'SVGPathSegLinetoVerticalRel']
]);

export const TYPE_TO_TAG = new Map<PATH_SEGMENT_TYPE, PATH_TAG>([
    [PATH_SEGMENT_TYPE.ARC_ABS, PATH_TAG.A],
    [PATH_SEGMENT_TYPE.ARC_REL, PATH_TAG.a],
    [PATH_SEGMENT_TYPE.CLOSEPATH, PATH_TAG.z],
    [PATH_SEGMENT_TYPE.CURVETO_CUBIC_ABS, PATH_TAG.C],
    [PATH_SEGMENT_TYPE.CURVETO_CUBIC_REL, PATH_TAG.c],
    [PATH_SEGMENT_TYPE.CURVETO_CUBIC_SMOOTH_ABS, PATH_TAG.S],
    [PATH_SEGMENT_TYPE.CURVETO_CUBIC_SMOOTH_REL, PATH_TAG.s],
    [PATH_SEGMENT_TYPE.CURVETO_QUADRATIC_ABS, PATH_TAG.Q],
    [PATH_SEGMENT_TYPE.CURVETO_QUADRATIC_REL, PATH_TAG.q],
    [PATH_SEGMENT_TYPE.CURVETO_QUADRATIC_SMOOTH_ABS, PATH_TAG.T],
    [PATH_SEGMENT_TYPE.CURVETO_QUADRATIC_SMOOTH_REL, PATH_TAG.t],
    [PATH_SEGMENT_TYPE.LINETO_ABS, PATH_TAG.L],
    [PATH_SEGMENT_TYPE.LINETO_VERTICAL_REL, PATH_TAG.H],
    [PATH_SEGMENT_TYPE.LINETO_HORIZONTAL_ABS, PATH_TAG.h],
    [PATH_SEGMENT_TYPE.LINETO_REL, PATH_TAG.l],
    [PATH_SEGMENT_TYPE.LINETO_VERTICAL_ABS, PATH_TAG.V],
    [PATH_SEGMENT_TYPE.LINETO_VERTICAL_REL, PATH_TAG.v],
    [PATH_SEGMENT_TYPE.MOVETO_ABS, PATH_TAG.M],
    [PATH_SEGMENT_TYPE.MOVETO_REL, PATH_TAG.m]
]);
