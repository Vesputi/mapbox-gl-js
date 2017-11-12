// @flow

const StyleLayer = require('../style_layer');
const FixedLineBucket = require('../../data/bucket/fixed_line_bucket');
const {multiPolygonIntersectsBufferedMultiPoint} = require('../../util/intersection_tests');
const {getMaximumPaintValue, translateDistance, translate} = require('../query_utils');

import type {Bucket, BucketParameters} from '../../data/bucket';
import type Point from '@mapbox/point-geometry';

class FixedLineStyleLayer extends StyleLayer {
    createBucket(parameters: BucketParameters) {
        return new FixedLineBucket(parameters);
    }

    isOpacityZero(zoom: number) {
        return this.isPaintValueFeatureConstant('fixed-line-opacity') &&
            this.getPaintValue('fixed-line-opacity', { zoom: zoom }) === 0 &&
            (this.isPaintValueFeatureConstant('fixed-line-stroke-width') &&
                this.getPaintValue('fixed-line-stroke-width', { zoom: zoom }) === 0) ||
            (this.isPaintValueFeatureConstant('fixed-line-stroke-opacity') &&
                this.getPaintValue('fixed-line-stroke-opacity', { zoom: zoom }) === 0);
    }

    queryRadius(bucket: Bucket): number {
        const circleBucket: FixedLineBucket = (bucket: any);
        return getMaximumPaintValue('fixed-line-radius', this, circleBucket) +
            translateDistance(this.paint['fixed-line-translate']);
    }

    queryIntersectsFeature(queryGeometry: Array<Array<Point>>,
                           feature: VectorTileFeature,
                           geometry: Array<Array<Point>>,
                           zoom: number,
                           bearing: number,
                           pixelsToTileUnits: number): boolean {
        const translatedPolygon = translate(queryGeometry,
            this.getPaintValue('fixed-line-translate', {zoom}, feature),
            this.getPaintValue('fixed-line-translate-anchor', {zoom}, feature),
            bearing, pixelsToTileUnits);
        const circleRadius = this.getPaintValue('fixed-line-radius', {zoom}, feature) * pixelsToTileUnits;
        return multiPolygonIntersectsBufferedMultiPoint(translatedPolygon, geometry, circleRadius);
    }
}

module.exports = FixedLineStyleLayer;
