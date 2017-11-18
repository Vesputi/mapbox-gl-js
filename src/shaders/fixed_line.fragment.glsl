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

    vec2 extrude = v_data.xy;
    float offset_local_coordinates = offset/radius;
    float stroke_width_local_coordinates = stroke_width/radius;

    float width_extrude_length = cos(angle_rad)*extrude.x + sin(angle_rad)*extrude.y;
    float extrude_length = length(extrude);

    lowp float antialiasblur = v_data.z;
    float antialiased_blur = max(blur, antialiasblur);

    float opacity_of_length = 1.0-smoothstep(1.0 - max(blur, antialiasblur), 1.0, extrude_length);

    float opacity_of_width = smoothstep(0.0, 0.0 - max(blur, antialiasblur), abs(width_extrude_length + offset_local_coordinates) - 0.5*stroke_width_local_coordinates);

    gl_FragColor = opacity_of_length * opacity_of_width * color * opacity;

#ifdef OVERDRAW_INSPECTOR
    gl_FragColor = vec4(1.0);
#endif
}
