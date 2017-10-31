// @flow

const StyleLayer = require('../style_layer');
const SymbolBucket = require('../../data/bucket/symbol_bucket');
const resolveTokens = require('../../util/token');
const {isExpression} = require('../../style-spec/expression');
const assert = require('assert');
const properties = require('./symbol_style_layer_properties');

const {
    Transitionable,
    Transitioning,
    Layout,
    PossiblyEvaluated
} = require('../properties');

import type {BucketParameters} from '../../data/bucket';
import type {LayoutProperties, PaintProperties} from './symbol_style_layer_properties';
import type {GlobalProperties, Feature} from '../../style-spec/expression';

class SymbolStyleLayer extends StyleLayer {
    _unevaluatedLayout: Layout<LayoutProperties>;
    layout: PossiblyEvaluated<LayoutProperties>;

    _transitionablePaint: Transitionable<PaintProperties>;
    _transitioningPaint: Transitioning<PaintProperties>;
    paint: PossiblyEvaluated<PaintProperties>;

    constructor(layer: LayerSpecification) {
        super(layer, properties);
    }

    getValueAndResolveTokens(name: *, globals: GlobalProperties, feature: Feature) {
        const value = this.layout.get(name).evaluate(globals, feature);
        const unevaluated = this._unevaluatedLayout._values[name];
        if (!unevaluated.isDataDriven() && !isExpression(unevaluated.value)) {
            return resolveTokens(feature.properties, value);
        }

        return value;
    }

    createBucket(parameters: BucketParameters) {
        // Eventually we need to make SymbolBucket conform to the Bucket interface.
        // Hack around it with casts for now.
        return (new SymbolBucket((parameters: any)): any);
    }

    queryRadius(): number {
        return 0;
    }

    queryIntersectsFeature(): boolean {
        assert(false); // Should take a different path in FeatureIndex
        return false;
    }
}

module.exports = SymbolStyleLayer;
