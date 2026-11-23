// Coordinates follow the 1672 × 941 locked composition. All environment
// surfaces are generated in the scene, with separate depth and time phases.
const noise = `
float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx)*.1031);
  p3 += dot(p3,p3.yzx+33.33);
  return fract((p3.x+p3.y)*p3.z);
}
float noise(vec2 p) {
  vec2 i=floor(p), f=fract(p);
  vec2 w=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),w.x),
             mix(hash(i+vec2(0,1)),hash(i+1.),w.x),w.y);
}
`;

const ridge = `
float crest(float x, float t, float layer) {
  float farRidge = .624 - .095*smoothstep(.64,1.,x);
  float midRidge = .702 - .105*smoothstep(.42,1.,x);
  float nearRidge = .994 - .139*pow(abs(x-.51)*1.96,2.9);
  float base = layer<.5 ? farRidge : layer<1.5 ? midRidge : nearRidge;
  float speed = .39+layer*.137;
  return base + (.018+layer*.006)*sin(x*(24.-layer*5.)-t*speed+layer*3.)
    + .011*sin(x*51.+t*(.51+layer*.14)+layer)
    + .006*sin(x*91.-t*.43+layer*7.);
}
`;

export const skyFragment = `
uniform float time;
uniform vec3 evidence;
varying vec2 world;
void main() {
  vec2 p=world;
  float blue=exp(-length((p-vec2(.77,.20))*vec2(2.4,2.2))*2.);
  float horizon=exp(-pow((p.y-.64)*3.9,2.));
  vec3 color=vec3(.049,.072,.092)+blue*vec3(.085,.135,.173)
    +horizon*vec3(.019,.035,.060);
  float shaft=exp(-length((p-vec2(.76,-.03))*vec2(2.5,4.))*2.4);
  color+=shaft*vec3(.089,.140,.179);
  float glow=exp(-length((p-evidence.xy)*vec2(3.8,4.2))*4.);
  color+=glow*vec3(.09,.045,.029)*evidence.z;
  color += smoothstep(.72,1.,p.y)*vec3(.019,.030,.047);
  gl_FragColor=vec4(color,1.);
}
`;

export const environmentPlane = `
varying vec2 world;
void main(){
  world=vec2(position.x/1672., -position.y/941.);
  gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
}
`;

export const mistFragment = `
uniform float time, layer;
uniform vec2 pointer;
uniform vec3 evidence;
varying vec2 world;
${noise}
void main() {
  vec2 p=world;
  float left=1.-smoothstep(.14,.56,p.x);
  float right=smoothstep(.54,.92,p.x);
  // Adjacent air masses shear in opposite directions at each depth.
  float drift=mix(-.11,.12,smoothstep(.20,.84,p.x))*(1.+layer*.74);
  float curl=sin(p.x*(15.+layer*6.)+time*(.32+layer*.07));
  float fieldY=p.y+.016*curl+.009*sin(p.x*32.-time*.41+layer);
  float elevation=.603 + .18*layer - .17*right*max(0.,1.-layer)
    - .048*left*sin(p.x*10.+time*.17+layer);
  float band=exp(-pow((fieldY-elevation)/(layer>1.5?.075:.107),2.));
  float wisps=exp(-pow((fieldY-(.45+.20*layer-.12*right+.08*p.x))/.085,2.));
  vec2 flow=vec2(p.x*(10.+layer*7.)+time*drift+pointer.x*.42,
    fieldY*(62.-layer*14.)-time*(.16-layer*.29)+layer*29.);
  flow.y += (noise(vec2(flow.x*.73,p.y*7.+time*.10))- .5)*3.7;
  float structure=noise(flow)*.72+noise(flow*vec2(2.2,1.22)+8.1)*.28;
  float coverage=(band*.64+wisps*.24)*(.51+.60*max(left,right));
  float edge=smoothstep(0.,.063,p.y-(layer<.5?.285:layer<1.5?.511:.677));
  if (layer<.5) edge*=1.-smoothstep(.76,.826,p.y);
  float density=clamp((structure-.24)*coverage*(layer>1.5?1.33:1.06)*edge,0.,.61);
  vec3 steel=mix(vec3(.27,.37,.47),vec3(.63,.71,.82),structure);
  float light=exp(-length((p-evidence.xy)*vec2(4.,3.))*4.);
  steel+=light*evidence.z*vec3(.26,.081,.026);
  gl_FragColor=vec4(steel,density);
}
`;

export const terrainVertex = `
uniform float time, layer;
uniform vec2 pointer, center;
varying vec2 field;
varying float slope;
${ridge}
void main() {
  float x=mix(-.09,1.09,uv.x);
  float d=1.-uv.y;
  float t=time+layer*4.;
  float peak=crest(x,t,layer);
  float footprint=d*(.23+.075*layer);
  float relief=d*(1.-d)*(.077*sin(x*39.+d*7.+t*.56)+.035*sin(x*106.-d*11.-t*.49));
  float y=peak+footprint+relief;
  float z=-105.+layer*52.+d*105.+sin(x*28.+t*.52)*d*13.;
  vec2 projected=vec2(x*1672.,-y*941.)+pointer*(3.+layer*5.);
  vec2 xy=center+(projected-center)*(1.-z/1850.);
  slope=sin(x*27.+d*9.-t*.40)+.34*sin(x*92.+d*19.+t*.54);
  field=vec2(x,d);
  gl_Position=projectionMatrix*modelViewMatrix*vec4(xy,z,1.);
}
`;

export const terrainFragment = `
uniform float time, layer;
uniform vec3 evidence;
varying vec2 field;
varying float slope;
${noise}
void main() {
  float x=field.x, d=field.y;
  float t=time+layer*4.;
  float cloth=sin(x*102.+d*28.+sin(x*37.-t*.7)*1.8)
    *sin(d*41.+sin(x*62.+t*.49)*1.8);
  float lit=clamp(slope*.28+.42+cloth*.09,0.,1.);
  vec3 dark=vec3(.032,.057,.079);
  vec3 blue=vec3(.18,.258,.337);
  vec3 color=mix(dark,blue,lit)*mix(.83,1.06,smoothstep(0.,.19,d));
  float stream=pow(.5+.5*sin(x*(19.-layer*3.)-t*.93+d*20.),4.);
  float endpoints = layer<.5 ? smoothstep(.52,.94,x) : layer<1.5 ?
    smoothstep(.30,.65,x) : 1.-smoothstep(.05,.47,min(x,1.-x));
  float coil=sin(d*91.+sin(x*34.+t*.62)*2.4+x*41.);
  float threads=pow(.5+.5*coil,17.)*exp(-d*7.);
  float rim=exp(-d*108.);
  float glint=pow(max(0.,sin(x*25.-time*1.48+layer)),22.)
    *pow(.5+.5*cos(time*.87+layer),4.);
  float coupled=exp(-pow((x-evidence.x)*15.,2.))*evidence.z;
  vec2 cell=vec2(x*510.-t*2.4,d*98.);
  float dots=(1.-smoothstep(.09,.31,length(fract(cell)-.5)))*step(.40,hash(floor(cell)));
  float intensity=(rim*(.40+stream*.58+glint*.85) + threads*(.13+stream*.36)
    +dots*exp(-d*9.)*(.24+stream*.55))*endpoints;
  color+=vec3(.99,.31,.13)*intensity+vec3(.26,.094,.052)*coupled*(rim+threads*.34);
  color+=vec3(.16,.21,.25)*exp(-d*52.)*(.36+lit*.55);
  gl_FragColor=vec4(color,1.);
}
`;
