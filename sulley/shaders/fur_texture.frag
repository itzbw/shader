precision highp float;

uniform float t;
uniform vec2 r;
uniform vec2 m;

// Noise function for organic texture
float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

// Smooth noise
float smoothNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f); // Smooth interpolation
    
    float a = noise(i);
    float b = noise(i + vec2(1.0, 0.0));
    float c = noise(i + vec2(0.0, 1.0));
    float d = noise(i + vec2(1.0, 1.0));
    
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// Fractal Brownian Motion for detailed texture
float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for(int i = 0; i < 6; i++) {
        value += amplitude * smoothNoise(p * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    return value;
}

// Flow field function for fur-like direction
vec2 flowField(vec2 p) {
    float angle1 = fbm(p * 0.5 + t * 0.1) * 6.28318;
    float angle2 = fbm(p * 0.3 + vec2(100.0) + t * 0.08) * 6.28318;
    
    vec2 flow1 = vec2(cos(angle1), sin(angle1));
    vec2 flow2 = vec2(cos(angle2), sin(angle2));
    
    return normalize(flow1 + flow2 * 0.5);
}

// Generate fur-like strands
float furPattern(vec2 uv) {
    vec2 p = uv;
    float pattern = 0.0;
    
    // Multiple layers of flowing patterns
    for(int i = 0; i < 8; i++) {
        vec2 flow = flowField(p + t * 0.02);
        
        // Create strand-like patterns
        float strand = abs(sin(p.x * 15.0 + flow.x * 10.0 + t * 0.5));
        strand *= abs(sin(p.y * 12.0 + flow.y * 8.0 + t * 0.3));
        strand = pow(strand, 2.0);
        
        // Add some randomness and flow
        float noise_val = fbm(p * 3.0 + flow * 2.0 + t * 0.1);
        strand *= smoothstep(0.3, 0.8, noise_val);
        
        pattern += strand * (1.0 / float(i + 1));
        
        // Evolve the position for next layer
        p += flow * 0.1;
        p *= 1.1;
    }
    
    return pattern;
}

// Color mixing function
vec3 furColor(vec2 uv, float pattern) {
    // Mouse influence on color mixing
    vec2 mousePos = m / r;
    float mouseDist = length(uv - mousePos);
    
    // Base colors - cyan and purple like the image
    vec3 cyan = vec3(0.2, 0.8, 0.9);
    vec3 purple = vec3(0.6, 0.3, 0.8);
    vec3 darkPurple = vec3(0.3, 0.1, 0.4);
    
    // Create color zones based on noise and position
    float colorNoise = fbm(uv * 2.0 + t * 0.05);
    float colorMix = smoothstep(0.3, 0.7, colorNoise + sin(t * 0.2) * 0.2);
    
    // Mix colors based on pattern and noise
    vec3 baseColor = mix(cyan, purple, colorMix);
    baseColor = mix(baseColor, darkPurple, smoothstep(0.2, 0.8, mouseDist));
    
    // Add brightness variation based on fur pattern
    float brightness = pattern * 0.8 + 0.2;
    brightness += fbm(uv * 5.0 + t * 0.1) * 0.3;
    
    return baseColor * brightness;
}

void main() {
    vec2 uv = gl_FragCoord.xy / r.y; // Maintain aspect ratio
    uv -= vec2(r.x / r.y * 0.5, 0.5); // Center
    
    // Scale and add some movement
    uv *= 2.0;
    uv += vec2(sin(t * 0.1) * 0.1, cos(t * 0.08) * 0.1);
    
    // Generate fur pattern
    float furValue = furPattern(uv);
    
    // Create depth and lighting effect
    vec2 gradient = vec2(
        furPattern(uv + vec2(0.01, 0.0)) - furPattern(uv - vec2(0.01, 0.0)),
        furPattern(uv + vec2(0.0, 0.01)) - furPattern(uv - vec2(0.0, 0.01))
    );
    
    float depth = length(gradient) * 2.0;
    furValue += depth * 0.5;
    
    // Get final color
    vec3 color = furColor(uv, furValue);
    
    // Add some shimmer effect
    float shimmer = sin(furValue * 10.0 + t * 2.0) * 0.1 + 0.9;
    color *= shimmer;
    
    // Enhance contrast
    color = pow(color, vec3(0.9));
    
    gl_FragColor = vec4(color, 1.0);
}