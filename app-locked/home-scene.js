import {
  AdditiveBlending, BufferAttribute, BufferGeometry, DoubleSide, LineLoop,
  LineBasicMaterial, Mesh, PerspectiveCamera, PlaneGeometry, Points, Scene,
  ShaderMaterial, TextureLoader, Vector2, WebGLRenderer,
} from "./vendor/three/three.module.min.js";

const cameraDepth = 1850;
const sheets = [[778,186,697,158], [781,301,646,138], [876,379,542,151]];
const targets = [ [939,153], [1257,276], [1421,369], [850,406], [1347,440] ];
const desktop = [0,0,1672,941];
const compact = [712,68,960,593];

const vertex = `
uniform vec2 pointer, center;
uniform float time, entrance, layer;
varying vec2 surfaceUv;
varying float shimmer;
void main() {
  surfaceUv = uv;
  vec3 p = position;
  float phase = layer * 1.9;
  float bend = sin(uv.x * 9. + uv.y * 2. - time * (.58 + .17 * layer) + phase);
  float crossWave = sin(uv.y * 5. - uv.x * 4. + time * .79 + phase);
  float staticDepth = 110. * sin(uv.x * 3.1416) * (uv.y - .5) + layer * 17.;
  vec2 offset = p.xy - center;
  p.xy -= offset * staticDepth / 1850.;
  p.z = staticDepth + bend * 13. + crossWave * 9. + pointer.x * offset.x * .055;
  p.xy += pointer * (5. + layer * 2.);
  p.y += bend * 4. + crossWave * 2. - (1. - entrance) * (23. + layer * 11.);
  shimmer = bend * .055 + crossWave * .026;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
}`;

const membrane = `
uniform sampler2D artwork;
uniform float entrance, focus, layer;
varying vec2 surfaceUv;
varying float shimmer;
void main() {
  vec4 texel = texture2D(artwork, surfaceUv);
  float rim = pow(max(0., 1. - abs(surfaceUv.y - .48) * 2.), 3.);
  vec3 tint = layer < .5 ? vec3(.64,.81,1.) : vec3(1.,.46,.25);
  gl_FragColor = vec4(texel.rgb * (1. + shimmer) + tint * rim * focus * .094, texel.a * entrance);
}`;

const atmosphere = `
uniform sampler2D artwork;
uniform float time;
uniform vec2 pointer;
varying vec2 surfaceUv;
float hash(vec2 p) { return fract(sin(dot(p, vec2(129.7, 311.5))) * 43758.54); }
float noise(vec2 p) {
  vec2 i=floor(p), f=fract(p);
  vec2 w=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),w.x),mix(hash(i+vec2(0,1)),hash(i+1.),w.x),w.y);
}
void main() {
  vec2 uv = surfaceUv;
  float ground = (1. - smoothstep(.30,.52,uv.y));
  float edge = smoothstep(0.,.08,uv.x) * (1. - smoothstep(.92,1.,uv.x));
  float drift = sin(uv.x*19. + time*.42) + .6*sin(uv.x*41. - time*.26 + uv.y*25.);
  vec2 displacement = vec2(drift*.0024 + pointer.x*.002, cos(uv.x*13. - time*.46)*.0028);
  vec3 color = texture2D(artwork, uv + displacement*ground*edge).rgb;
  vec2 fogUV = vec2(uv.x*12.-time*.15,uv.y*53.+time*.045);
  float fog = noise(fogUV)*.72 + noise(fogUV*2.6)*.28;
  float band = exp(-pow((uv.y-.32 + sin(uv.x*7.)*.06)*11.,2.));
  color = mix(color, vec3(.56,.65,.74), max(0.,fog-.36)*band*.21);
  float illumination = exp(-distance(uv,vec2(.68 + sin(time*.44)*.05,.28))*9.);
  color += vec3(.13,.043,.016)*illumination*(.45+.3*sin(time*1.25));
  gl_FragColor = vec4(color,1.);
}`;

function orbitPoint(angle, index) {
  const axes = [[290,218,-.46], [326,181,.29], [342,129,-.34], [247,228,.55]];
  const [a,b,tilt] = axes[index];
  const x = Math.cos(angle) * a;
  const y = Math.sin(angle) * b;
  return [1120 + x * Math.cos(tilt) - y * Math.sin(tilt),
    -324 + x * Math.sin(tilt) + y * Math.cos(tilt), -20 + 62 * Math.sin(angle + index)];
}

function introduction() {
  const key = "yeon-p7-introduced";
  try {
    if (sessionStorage.getItem(key)) return false;
    sessionStorage.setItem(key, "1");
  } catch {
    // Motion still works when storage is disabled.
  }
  return true;
}

export function mountHomeScene(home, canvas, context) {
  const renderer = new WebGLRenderer({ canvas, context });
  renderer.debug.onShaderError = (gl, program, vertex, fragment) => {
    throw new Error([gl.getProgramInfoLog(program), gl.getShaderInfoLog(vertex), gl.getShaderInfoLog(fragment)].filter(Boolean).join("\n"));
  };
  const scene = new Scene();
  const camera = new PerspectiveCamera(30, 1, 1, 3300);
  const loader = new TextureLoader();
  const pointer = new Vector2();
  const requested = new Vector2();
  const center = new Vector2();
  const time = { value: 0 };
  const entrance = { value: 0 };
  const focus = { value: 0 };
  const pixelRatio = { value: 1 };
  let alive = true;
  let frame = 0;
  let visible = true;
  let ready = false;
  let playingIntro = false;
  let elapsed = 0;
  let lastTick = 0;
  let active = -1;

  function mesh(box, segments, material, order) {
    const [x,y,w,h] = box;
    const geometry = new PlaneGeometry(w, h, segments[0], segments[1]);
    geometry.translate(x + w / 2, -y - h / 2, order === 0 ? -1 : 0);
    const surface = new Mesh(geometry, material);
    surface.frustumCulled = false;
    surface.renderOrder = order;
    scene.add(surface);
    return surface;
  }

  const backdrop = mesh(desktop, [32,18], new ShaderMaterial({
    uniforms: { time, pointer: { value: pointer }, artwork: { value: null } },
    vertexShader: `uniform float time; varying vec2 surfaceUv;
      void main() {
        surfaceUv = uv;
        vec3 p = position;
        float ground = (1. - smoothstep(.30,.44,uv.y))*smoothstep(0.,.15,uv.y);
        float border = smoothstep(0.,.1,uv.x)*(1.-smoothstep(.9,1.,uv.x));
        p.z += ground*border*sin(uv.x*18.-time*.57)*4.;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
      }`,
    fragmentShader: atmosphere,
    depthWrite: false,
    depthTest: false,
  }), 0);

  const sculpture = sheets.map((box,index) => mesh(box, [92,34], new ShaderMaterial({
    uniforms: { time, entrance, focus, pointer: { value: pointer }, center: { value: center },
      layer: { value: index }, artwork: { value: null } },
    vertexShader: vertex,
    fragmentShader: membrane,
    side: DoubleSide,
    transparent: true,
    depthWrite: false,
    depthTest: false,
  }), 4-index));

  const tracks = Array.from({ length: 4 }, (_,index) => {
    const xyz = Float32Array.from(Array.from({ length: 112 }, (_,i) => orbitPoint(i * Math.PI / 56,index)).flat());
    const geometry = new BufferGeometry();
    geometry.setAttribute("position",new BufferAttribute(xyz,3));
    const path = new LineLoop(geometry,new LineBasicMaterial({
      color: index % 2 ? 0xee7751 : 0x93bbdc, transparent: true, opacity: .16,
      depthTest: false,
    }));
    path.renderOrder = 1;
    scene.add(path);
    return path;
  });

  const orbitingCount = 15;
  const count = orbitingCount + targets.length + 1;
  const signalGeometry = new BufferGeometry();
  signalGeometry.setAttribute("position",new BufferAttribute(new Float32Array(count*3),3));
  signalGeometry.setAttribute("energy",new BufferAttribute(new Float32Array(count),1));
  const signals = new Points(signalGeometry,new ShaderMaterial({
    uniforms: { pixelRatio },
    vertexShader: `attribute float energy; uniform float pixelRatio; varying float strength;
      void main(){ strength=energy; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
        gl_PointSize=(4. + energy*18.) * pixelRatio; }`,
    fragmentShader: `varying float strength;
      void main(){ float r=length(gl_PointCoord-.5)*2.;
        float halo=exp(-r*r*6.)*(1.-smoothstep(.73,1.,r));
        float core=1.-smoothstep(.07,.32,r);
        gl_FragColor=vec4(mix(vec3(1.,.32,.13),vec3(1.,.90,.75),core), (halo*.47+core*.52)*strength); }`,
    blending: AdditiveBlending,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  }));
  signals.frustumCulled = false;
  signals.renderOrder = 6;
  scene.add(signals);

  const size = () => {
    if (!alive) return;
    const small = innerWidth <= 1050;
    const [x,y,width,height] = small ? compact : desktop;
    const { width: cssWidth, height: cssHeight } = canvas.getBoundingClientRect();
    if (!cssWidth || !cssHeight) return;
    center.set(x + width / 2, -y - height / 2);
    camera.position.set(center.x, center.y, cameraDepth);
    camera.aspect = width / height;
    camera.fov = 2 * Math.atan(height / (2 * cameraDepth)) * 180 / Math.PI;
    camera.updateProjectionMatrix();
    const ratio = Math.min(devicePixelRatio, small ? 1.3 : 1.15);
    pixelRatio.value = cssWidth / width * ratio;
    renderer.setPixelRatio(ratio);
    renderer.setSize(cssWidth, cssHeight, false);
  };

  function animate(now) {
    frame = 0;
    if (!ready || document.hidden || !visible) return;
    const dt = lastTick ? Math.min((now - lastTick) / 1000, .08) : 0;
    lastTick = now;
    elapsed += dt;
    time.value = elapsed;
    const step = Math.min(1,elapsed / 1.75);
    entrance.value = playingIntro ? 1 - (1-step)**3 : 1;
    pointer.lerp(requested, 1 - Math.exp(-dt*4.4));
    focus.value += ((active < 0 ? 0 : 1) - focus.value) * (1-Math.exp(-dt*5));
    tracks.forEach((track,index) => {
      track.position.z = Math.sin(elapsed*.27+index)*18;
      track.position.x = pointer.x*(5+index);
      track.position.y = pointer.y*(4+index);
      track.material.opacity = entrance.value * (.10 + .055*Math.sin(elapsed*.61+index));
    });

    const xyz = signalGeometry.attributes.position;
    const energy = signalGeometry.attributes.energy;
    for (let i=0; i<count; i++) {
      const index=i%4;
      const phase=elapsed*(.20+index*.029) + i*2.399;
      if (i === count-1) {
        const target = targets[active];
        if (target) {
          const travel = (elapsed * .65) % 1;
          const arrived = Math.sin(travel * Math.PI);
          xyz.setXYZ(i, target[0] + (1128-target[0])*travel, -target[1] + (target[1]-347)*travel + 48*arrived, 16*arrived);
          energy.setX(i, entrance.value * arrived * 1.5);
        } else {
          energy.setX(i, 0);
        }
        continue;
      }
      const target=targets[i-orbitingCount];
      if (target) {
        const selected = active === i-orbitingCount;
        xyz.setXYZ(i,target[0],-target[1],0);
        energy.setX(i, entrance.value*(selected ? 1.25 : .18 + .15*Math.sin(elapsed*1.5+i)));
      } else {
        const [x,y,z] = orbitPoint(phase,index);
        xyz.setXYZ(i,x+tracks[index].position.x,y+tracks[index].position.y,z+tracks[index].position.z);
        energy.setX(i,entrance.value*(.24 + .59*(.5+.5*Math.sin(elapsed*1.38+i))**2));
      }
    }
    xyz.needsUpdate = true;
    energy.needsUpdate = true;
    renderer.render(scene,camera);
    frame = requestAnimationFrame(animate);
  }

  function sync() {
    if (ready && visible && !document.hidden) {
      if (!frame) frame = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTick = 0;
    }
  }

  const inputs = new AbortController();
  const on = { signal: inputs.signal };
  home.addEventListener("pointermove", event => {
    if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
    const rect = home.getBoundingClientRect();
    requested.set((event.clientX - rect.left) / rect.width * 2 - 1,
      1 - (event.clientY - rect.top) / rect.height * 2);
  }, on);
  home.addEventListener("pointerleave", () => requested.set(0,0), on);
  const setLabel = event => {
    const link = event.target.closest("[data-evidence-label]");
    if (link) active = Number(link.dataset.evidenceLabel);
  };
  const clearLabel = event => {
    if (event.target.closest("[data-evidence-label]")?.contains(event.relatedTarget)) return;
    const link = home.querySelector("[data-evidence-label]:focus-visible");
    active = link ? Number(link.dataset.evidenceLabel) : -1;
  };
  home.addEventListener("pointerover",setLabel,on);
  home.addEventListener("focusin",setLabel,on);
  home.addEventListener("pointerout",clearLabel,on);
  home.addEventListener("focusout",clearLabel,on);
  document.addEventListener("visibilitychange",sync,on);
  canvas.addEventListener("webglcontextlost", event => {
    event.preventDefault();
    ready = false;
    canvas.classList.remove("is-live");
    sync();
  }, on);
  canvas.addEventListener("webglcontextrestored", () => {
    ready = Boolean(backdrop.material.uniforms.artwork.value);
    canvas.classList.toggle("is-live",ready);
    sync();
  }, on);
  const resize = new ResizeObserver(size);
  resize.observe(canvas);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  });
  intersection.observe(canvas);

  const surfaces = [backdrop,...sculpture];
  const textures = [];
  const assets = ["atmosphere", "membrane-0", "membrane-1", "membrane-2"];
  Promise.all(assets.map(asset => loader.loadAsync(new URL(`./assets/p7/${asset}.webp`,import.meta.url).href)
    .then(texture => { if (alive) textures.push(texture); else texture.dispose(); return texture; })))
    .then(images => {
      if (!alive) return;
      images.forEach((texture,index) => surfaces[index].material.uniforms.artwork.value = texture);
      playingIntro = introduction();
      entrance.value = playingIntro ? 0 : 1;
      size();
      renderer.render(scene,camera);
      ready = true;
      canvas.classList.add("is-live");
      sync();
    }).catch(error => { console.warn("YEON live artwork fallback:", error.message); stop(); });

  function stop() {
    if (!alive) return;
    alive = ready = false;
    sync();
    canvas.classList.remove("is-live");
    inputs.abort();
    resize.disconnect();
    intersection.disconnect();
    scene.traverse(child => {
      child.geometry?.dispose();
      child.material?.dispose();
    });
    textures.forEach(texture => texture.dispose());
    renderer.dispose();
  }
  return stop;
}
