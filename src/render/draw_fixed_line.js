// @flow

const pixelsToTileUnits = require('../source/pixels_to_tile_units');

import type Painter from './painter';
import type SourceCache from '../source/source_cache';
import type FixedLineStyleLayer from '../style/style_layer/fixed_line_style_layer';
import type FixedLineBucket from '../data/bucket/fixed_line_bucket';
import type TileCoord from '../source/tile_coord';

module.exports = drawFixedLines;

function drawFixedLines(painter: Painter, sourceCache: SourceCache, layer: FixedLineStyleLayer, coords: Array<TileCoord>) {
    if (painter.renderPass !== 'translucent') return;
    if (layer.isOpacityZero(painter.transform.zoom)) return;

    const gl = painter.gl;

    painter.setDepthSublayer(0);
    painter.depthMask(false);

    // Allow circles to be drawn across boundaries, so that
    // large circles are not clipped to tiles
    gl.disable(gl.STENCIL_TEST);

    for (let i = 0; i < coords.length; i++) {
        const coord = coords[i];

        const tile = sourceCache.getTile(coord);
        const bucket: ?FixedLineBucket = (tile.getBucket(layer): any);
        if (!bucket) continue;

        const programConfiguration = bucket.programConfigurations.get(layer.id);
        const program = painter.useProgram('fixed-line', programConfiguration);
        programConfiguration.setUniforms(gl, program, layer, {zoom: painter.transform.zoom});

        gl.uniform1f(program.uniforms.u_camera_to_center_distance, painter.transform.cameraToCenterDistance);
        gl.uniform1i(program.uniforms.u_scale_with_map, layer.paint['fixed-line-pitch-scale'] === 'map' ? 1 : 0);
        if (layer.paint['fixed-line-pitch-alignment'] === 'map') {
            gl.uniform1i(program.uniforms.u_pitch_with_map, 1);
            const pixelRatio = pixelsToTileUnits(tile, 1, painter.transform.zoom);
            gl.uniform2f(program.uniforms.u_extrude_scale, pixelRatio, pixelRatio);
        } else {
            gl.uniform1i(program.uniforms.u_pitch_with_map, 0);
            gl.uniform2fv(program.uniforms.u_extrude_scale, painter.transform.pixelsToGLUnits);
        }

        gl.uniformMatrix4fv(program.uniforms.u_matrix, false, painter.translatePosMatrix(
            coord.posMatrix,
            tile,
            layer.paint['fixed-line-translate'],
            layer.paint['fixed-line-translate-anchor']
        ));

        program.draw(
            gl,
            gl.TRIANGLES,
            layer.id,
            bucket.layoutVertexBuffer,
            bucket.indexBuffer,
            bucket.segments,
            programConfiguration);
    }
}
