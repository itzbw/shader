precision highp float;

uniform float t;
uniform vec2 r;
uniform vec2 m;

void main() {
    vec2 FC = gl_FragCoord.xy;
    vec4 o = vec4(0.0);
    
    // Ultra-dense fur pattern inspired by the compact style
    for(float i,z,d,s,f,g;i++<120.0;){
        vec3 p=vec3((FC-r*.5)/r.y,1);
        p.xy+=(m/r-.5)*.3;
        p.z-=t*.25+i*.01;
        
        // Multi-layered fur strand generation
        for(d=1.;d<1e3;d*=1.4){
            p+=sin(p.yzx*d+z*.4-t*.15)/d;
            p.xz+=cos(p.yxy*d*1.2+t*.1)*.4/d;
            p=abs(p)-.15;
        }
        
        // Depth and strand thickness
        z+=d=.008+.06*abs(s=.3-length(p.xy));
        
        // Complex color mixing for organic appearance
        f=length(p)+sin(z*10.+t)*.08;
        g=cos(f*5.+t*.6)*.2+.8;
        
        // Cyan-purple fur colors
        vec4 col=vec4(
            sin(f*1.5+t*.4)*.25+.35,
            cos(f*2.5-t*.25)*.35+.65,
            sin(f*3.5+t*.8)*.45+.85,
            1
        )*g;
        
        // Add strand highlights
        col*=(1.+sin(s*15.+z*8.)*.4);
        
        // Accumulate with multiple falloffs
        o+=col*(1./(1.+i*.04))*(1./(1.+d*80.))*.025;
    }
    
    // Second pass for fine details
    for(float i,z,d,s;i++<60.0;){
        vec3 p=vec3((FC-r*.5)/r.y*.8,1);
        p.xy+=(m/r-.5)*.2;
        p.z-=t*.15+i*.02;
        
        for(d=1.;d<500.;d*=1.3){
            p+=cos(p.zxy*d+z*.6+t*.08)*.3/d;
            p=abs(p)-.1;
        }
        
        z+=d=.005+.04*abs(.2-length(p.xy));
        s=length(p)*2.;
        
        // Fine detail colors
        vec4 detail=vec4(
            cos(s*3.+t)*.15+.2,
            sin(s*4.-t*.5)*.2+.4,
            cos(s*6.+t*1.2)*.25+.6,
            1
        );
        
        o+=detail*(1./(1.+i*.08))*.01;
    }
    
    // Final enhancement
    o=tanh(o*2.);
    o.rgb*=sin(length(FC)*.05+t*3.)*.1+.95;
    o.rgb=pow(o.rgb,vec3(.75));
    
    gl_FragColor=o;
}