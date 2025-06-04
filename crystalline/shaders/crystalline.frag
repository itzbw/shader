precision highp float;

uniform float t;
uniform vec2 r;
uniform vec2 m;
uniform float mode;

void main() {
    vec2 FC = gl_FragCoord.xy;
    vec4 o = vec4(0.0);
    
    float a = 0.0;
    float b = 0.0;
    
    for(float i = 0.0; i < 60.0; i += 1.0) {
        vec3 p = vec3((FC - r * 0.5) / r.y, 1.0);
        
        p.xy += (m / r - 0.5) * 0.3;
        
        p.z -= t * 0.2 + i * 0.02;
        
        b = 1.0;
        for(float j = 0.0; j < 5.0; j += 1.0) {
            if(mode < 0.5) {
                p.xy += sin(p.z * b + a) * 0.3 / b;
                p.xz += cos(p.y * b * 2.0 - t) * 0.2 / b;
                p = abs(p); // Create sharp folds
            } else if(mode < 1.5) {
                vec3 q = p * b;
                p += sin(q * 4.0 + vec3(a, a * 1.3, a * 0.7)) * 0.25 / b;
                p = abs(p) - 0.3; // Folding for lightning effect
                p.xy *= mat2(cos(0.1), -sin(0.1), sin(0.1), cos(0.1)); // Slight rotation
            } else {
                p.xy += cos(p.z * b * 0.5 + a * 0.5) * 0.4 / b;
                p.yz += sin(p.x * b - t * 0.5) * 0.3 / b;
                p = mix(p, smoothstep(-1.0, 1.0, p), 0.3); // Smooth out
            }
            b *= 1.5;
        }
        
        if(mode < 1.5) {
            a += 0.01 + 0.02 * length(p.xy);
        } else {
            a += 0.015 + 0.01 * length(p.xy); // Slower for nebula
        }
        
        vec4 col;
        if(mode < 0.5) {
            // Crystal - blue/purple/cyan palette
            col = vec4(
                sin(a * 2.0) * 0.3 + 0.2,
                cos(a * 3.0) * 0.4 + 0.3,
                sin(a * 4.0 + t) * 0.5 + 0.5,
                1.0
            );
        } else if(mode < 1.5) {
            // Electric - yellow/white/blue
            float flash = sin(a * 10.0 + t * 3.0) * 0.5 + 0.5;
            col = vec4(
                flash * 0.8 + 0.2,
                flash * 0.7 + 0.2,
                cos(a * 5.0) * 0.5 + 0.5,
                1.0
            );
        } else {
            // Nebula - warm red/orange/pink
            col = vec4(
                sin(a * 1.5 + t * 0.3) * 0.3 + 0.7,
                cos(a * 2.0) * 0.3 + 0.4,
                sin(a * 3.0 - t * 0.2) * 0.3 + 0.3,
                1.0
            );
        }
        
        float falloff = mode < 1.5 ? 0.05 : 0.03; // Electric/Crystal vs Nebula
        o += col * (1.0 / (1.0 + i * falloff)) * 0.05;
    }
    
    // Ensure visible output
    o = clamp(o * 2.0, 0.0, 1.0);
    o.a = 1.0;
    
    gl_FragColor = o;
}