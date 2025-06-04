precision highp float;

uniform float t;
uniform vec2 r;

float tanh_approx(float x) {
    float x2 = x * x;
    return x / (1.0 + x2 / (3.0 + x2 / 5.0));
}

vec3 tanh_vec3(vec3 v) {
    return vec3(tanh_approx(v.x), tanh_approx(v.y), tanh_approx(v.z));
}

void main() {
    vec2 FC = gl_FragCoord.xy;
    vec3 o = vec3(0.0);
    
    for(float i = 0.0; i < 10.0; i++) {
        vec3 l = vec3((FC.xy * 2.0 - r) / r.y, 0.0);
        vec3 p = normalize(l);
        
        float d = 6.0;
        for(int j = 0; j < 20; j++) {
            if(d >= 200.0) break;
            p += sin(p.yzx * d - t) / d;
            d *= 1.2;
        }
        
        float s = 0.3 - abs(p.y);
        float z = 0.005 + abs(s) / 4.0;
        
        // Increased brightness by adjusting intensity calculation
        float intensity = 1.0 - exp(-length(l) * 3.0 / r.y);
        
        // Create pastel colors
        vec3 baseColor = (cos(s / 0.1 + p.x / 0.2 + t - vec3(0.0, 2.1, 4.2)) + 1.0) * 0.5;
        
        vec3 pastelColor = mix(baseColor, vec3(1.0), 0.6);
        
        vec3 color = intensity * pastelColor * 3.0 / z;
        o += color;
    }
    
    // Adjusted final brightness 
    o = tanh_vec3(o / 25.0) * 1.2;
    
    o = max(o, vec3(0.15));
    
    float gray = dot(o, vec3(0.299, 0.587, 0.114));
    o = mix(vec3(gray), o, 0.7);
    
    gl_FragColor = vec4(o, 1.0);
}