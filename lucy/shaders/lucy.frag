precision highp float;

uniform float t;
uniform vec2 r;
uniform vec2 m;

vec4 tanh(vec4 x) {
    vec4 exp2x = exp(2.0 * x);
    return (exp2x - 1.0) / (exp2x + 1.0);
}

void main() {
    vec2 FC = gl_FragCoord.xy;
    vec4 o = vec4(0.0);
    
    float z = 0.0;
    float d = 0.0;
    
    for(float i = 0.0; i < 100.0; i++) {
        vec3 p = normalize(vec3(FC - r.xy * 0.5, r.y));
        p.z -= t;
        
        d = 1.0;
        for(float j = 0.0; j < 8.0; j++) {
            p += cos(p.yzx * d + z * 0.2 - t * 0.1) / d;
            d *= 1.4286;
        }
        
        z += d = 0.02 + 0.1 * abs(p.y + 1.0);
        o += (cos(z + t + vec4(0.0, 1.0, 2.0, 3.0)) + 1.1) / d;
    }
    
    o = tanh(o / 2000.0);
    gl_FragColor = o;
}