#pragma mapbox: define highp vec4 color
#pragma mapbox: define mediump float radius
#pragma mapbox: define mediump float offset
#pragma mapbox: define mediump float offset_direction
#pragma mapbox: define mediump float angle
#pragma mapbox: define lowp float blur
#pragma mapbox: define lowp float opacity
#pragma mapbox: define highp vec4 stroke_color
#pragma mapbox: define mediump float stroke_width
#pragma mapbox: define lowp float stroke_opacity

varying vec3 v_data;

void main() {
    #pragma mapbox: initialize highp vec4 color
    #pragma mapbox: initialize mediump float radius
    #pragma mapbox: initialize mediump float offset
    #pragma mapbox: initialize mediump float offset_direction
    #pragma mapbox: initialize mediump float angle
    #pragma mapbox: initialize lowp float blur
    #pragma mapbox: initialize lowp float opacity
    #pragma mapbox: initialize highp vec4 stroke_color
    #pragma mapbox: initialize mediump float stroke_width
    #pragma mapbox: initialize lowp float stroke_opacity

    // float offset = 50.0;
    float angle_rad = radians(angle);
    float full_radius = radius + stroke_width;

    vec2 extrude = v_data.xy;
    float distance_of_mid_line_to_center = offset/full_radius;

    float distance_to_mid_line = cos(angle_rad)*extrude.x + sin(angle_rad)*extrude.y;
    float extrude_length = length(extrude);

    lowp float antialiasblur = v_data.z;
    float antialiased_blur = -max(blur, antialiasblur);

    float opacity_t = 0.0;

    if(abs(distance_to_mid_line + distance_of_mid_line_to_center) < 0.5*stroke_width/full_radius){
      opacity_t = smoothstep(0.0, antialiased_blur, extrude_length - 1.0);
      // opacity_t  = 1.0;
    }

    float color_t = (stroke_width < 0.01) ? 0.0 : smoothstep(
        antialiased_blur,
        0.0,
        extrude_length - radius / full_radius
    );

    gl_FragColor = opacity_t * mix(color * opacity, stroke_color * 0.0, color_t);

#ifdef OVERDRAW_INSPECTOR
    gl_FragColor = vec4(1.0);
#endif
}
