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
    
    // Dense fur-like pattern with high detail
    for(float i = 0.0; i < 80.0; i += 1.0) {
        vec3 p = vec3((FC - r * 0.5) / r.y, 1.0);
        
        // Mouse interaction
        p.xy += (m / r - 0.5) * 0.4;
        
        // Time-based movement
        p.z -= t * 0.3 + i * 0.015;
        
        // Multiple frequency distortions for fur strands
        d = 1.0;
        for(float j = 0.0; j < 6.0; j += 1.0) {
            // Create flowing, strand-like patterns
            p.xy += sin(p.zyx * d + z * 0.3 - t * 0.2) * 0.4 / d;
            p.xz += cos(p.yxy * d * 1.5 + t * 0.15) * 0.3 / d;
            // Sharp fold for fine detail
            p = abs(p) - 0.2;
            d *= 1.618; // Golden ratio for natural growth
        }
        
        // Accumulate depth with fur-like falloff
        float s = 0.4 - length(p.xy);
        z += d = 0.01 + 0.08 * abs(s);
        
        // Color calculation with organic variation
        float f = length(p) + sin(z * 8.0 + t) * 0.1;
        
        // Cyan-purple palette like the reference image
        vec4 col = vec4(
            sin(f * 2.0 + t * 0.5) * 0.3 + 0.4,  // Red channel
            cos(f * 3.0 - t * 0.3) * 0.4 + 0.6,  // Green channel  
            sin(f * 4.0 + t * 0.7) * 0.5 + 0.8,  // Blue channel
            1.0
        );
        
        // Add depth-based brightness variation
        col *= (1.0 + sin(s * 12.0 + z * 5.0) * 0.3);
        
        // Accumulate with distance falloff
        o += col * (0.8 / (1.0 + i * 0.06)) * (0.02 + 0.05 / (1.0 + d * 50.0));
    }
    
    // Final processing for fur-like appearance
    o = tanh(o * 1.5);
    
    // Add fine detail shimmer
    float shimmer = sin(length(FC) * 0.1 + t * 2.0) * 0.1 + 0.9;
    o.rgb *= shimmer;
    
    // Enhance contrast for more defined strands
    o.rgb = pow(o.rgb, vec3(0.8));
    
    gl_FragColor = o;
}