import {
  AdditiveBlending, BufferAttribute, BufferGeometry, DoubleSide, Line, LineLoop,
  LineBasicMaterial, Mesh, PerspectiveCamera, PlaneGeometry, Points, Scene,
  ShaderMaterial, TextureLoader, Vector2, Vector3, WebGLRenderer,
} from "./vendor/three/three.module.min.js";
import { environmentPlane, mistFragment, skyFragment, terrainFragment, terrainVertex } from "./home-environment.js";

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
uniform vec3 evidence;
varying vec2 surfaceUv;
varying float shimmer;
void main() {
  vec4 texel = texture2D(artwork, surfaceUv);
  float rim = pow(max(0., 1. - abs(surfaceUv.y - .48) * 2.), 3.);
  vec3 tint = layer < .5 ? vec3(.64,.81,1.) : vec3(1.,.46,.25);
  gl_FragColor = vec4(texel.rgb * (1. + shimmer + evidence.z * .065) + tint * rim * focus * .094, texel.a * entrance);
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
  const evidence = { value: new Vector3(.68,.66,0) };
  const pixelRatio = { value: 1 };
  let alive = true;
  let frame = 0;
  let visible = true;
  let ready = false;
  let loaded = false;
  let playingIntro = false;
  let elapsed = 0;
  let lastTick = 0;
  let active = -1;
  let resolution = 1;
  let budgetMs = 0;
  let budgetFrames = 0;

  function mesh(box, segments, material, order) {
    const [x,y,w,h] = box;
    const geometry = new PlaneGeometry(w, h, segments[0], segments[1]);
    geometry.translate(x + w / 2, -y - h / 2, 0);
    const surface = new Mesh(geometry, material);
    surface.frustumCulled = false;
    surface.renderOrder = order;
    scene.add(surface);
    return surface;
  }

  const environmentUniforms = { time, evidence, pointer: { value: pointer }, center: { value: center } };
  const environmentMaterial = (vertexShader, fragmentShader, layer, transparent = false) =>
    new ShaderMaterial({
      uniforms: { ...environmentUniforms, layer: { value: layer } },
      vertexShader, fragmentShader, transparent, side: DoubleSide,
      depthTest: false, depthWrite: false,
    });
  const atmosphereBounds = [-12,-12,1696,965];
  mesh(atmosphereBounds,[1,1],environmentMaterial(environmentPlane,skyFragment,0),-9);
  const mistBounds = [[-12,268,1696,510],[-12,481,1696,460],[-12,637,1696,320]];
  for (let i=0;i<3;i++) {
    mesh(desktop,[132,23],environmentMaterial(terrainVertex,terrainFragment,i,true),-7+i*2);
    mesh(mistBounds[i],[1,1],environmentMaterial(environmentPlane,mistFragment,i,true),-6+i*2);
  }

  const sculpture = sheets.map((box,index) => mesh(box, [92,34], new ShaderMaterial({
    uniforms: { time, entrance, focus, evidence, pointer: { value: pointer }, center: { value: center },
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
  const groundCount = 26;
  const anchorPoints = [[1257,135],[1137,551],[1137,624]];
  const count = orbitingCount + targets.length + groundCount + anchorPoints.length + 2;
  const signalGeometry = new BufferGeometry();
  signalGeometry.setAttribute("position",new BufferAttribute(new Float32Array(count*3),3));
  signalGeometry.setAttribute("energy",new BufferAttribute(new Float32Array(count),1));
  const signals = new Points(signalGeometry,new ShaderMaterial({
    uniforms: { pixelRatio },
    vertexShader: `attribute float energy; uniform float pixelRatio; varying float strength;
      void main(){ strength=energy; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
        gl_PointSize=(3. + energy*22.) * pixelRatio; }`,
    fragmentShader: `varying float strength;
      void main(){ float r=length(gl_PointCoord-.5)*2.;
        float halo=exp(-r*r*6.)*(1.-smoothstep(.73,1.,r));
        float core=1.-smoothstep(.07,.32,r);
        gl_FragColor=vec4(mix(vec3(1.,.32,.13),vec3(1.,.90,.75),core), (halo*.56+core*.64)*strength); }`,
    blending: AdditiveBlending,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  }));
  signals.frustumCulled = false;
  signals.renderOrder = 6;
  scene.add(signals);

  const paths = [
    [[753,465],[813,430],[895,385],[1010,344],[1120,270],[1257,135]],
    [[1257,135],[1257,278],[1190,375],[1137,448],[1137,551],[1137,624]],
    [[788,174],[854,174],[910,230]],
    [[1430,175],[1399,175],[1327,254]],
    [[1494,336],[1450,336],[1421,369]],
    [[823,507],[925,507],[976,453]],
    [[1397,507],[1352,507],[1296,457]],
  ].map((points,index)=>{
    const geometry = new BufferGeometry().setFromPoints(points.map(([x,y])=>new Vector3(x,-y,0)));
    const line = new Line(geometry,new LineBasicMaterial({
      color:index<2?0xf69267:0xa4bcce, transparent:true, opacity:.5, depthTest:false, depthWrite:false,
    }));
    line.renderOrder=1;
    scene.add(line);
    return line;
  });

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
    const ratio = Math.min(devicePixelRatio, small ? 1.3 : 1.15) * resolution;
    pixelRatio.value = cssWidth / width * ratio;
    renderer.setPixelRatio(ratio);
    renderer.setSize(cssWidth, cssHeight, false);
  };

  function animate(now) {
    frame = 0;
    if (!ready || document.hidden || !visible) return;
    const deltaMs = lastTick ? now - lastTick : 0;
    const dt = Math.min(deltaMs / 1000, .15);
    if (deltaMs && deltaMs < 300 && resolution > .65) {
      budgetMs += deltaMs;
      if (++budgetFrames >= 28) {
        if (budgetMs / budgetFrames > 35) {
          resolution = Math.max(.65, resolution * .88);
          size();
        }
        budgetMs = budgetFrames = 0;
      }
    }
    lastTick = now;
    elapsed += dt;
    time.value = elapsed;
    const step = Math.min(1,elapsed / 1.75);
    const descent = (elapsed % 13.7) / 2.8;
    const contact = Math.exp(-((descent-1)**2)*15);
    evidence.value.z = .22 + .14*Math.sin(elapsed*1.23) + contact*.67 + focus.value*.37;
    paths[1].material.opacity = .33+contact*.35;
    for (let i=2;i<paths.length;i++) paths[i].material.opacity = (i===active+2?.85:.44)*entrance.value;
    entrance.value = playingIntro ? 1 - (1-step)**3 : 1;
    pointer.lerp(requested, 1 - Math.exp(-dt*4.4));
    focus.value += ((active < 0 ? 0 : 1) - focus.value) * (1-Math.exp(-dt*5));
    tracks.forEach((track,index) => {
      track.position.z = Math.sin(elapsed*.27+index)*18;
      track.position.x = pointer.x*(5+index);
      track.position.y = pointer.y*(4+index);
      track.material.opacity = entrance.value * (.19 + .068*Math.sin(elapsed*.61+index));
    });

    const xyz = signalGeometry.attributes.position;
    const energy = signalGeometry.attributes.energy;
    for (let i=0; i<count; i++) {
      const index=i%4;
      const phase=elapsed*(.20+index*.029) + i*2.399;
      if (i === count-2) {
        const y=135+Math.min(1,descent)*488;
        xyz.setXYZ(i, y<278 ? 1257 : 1137+120*Math.max(0,1-(y-278)/170),-y,3);
        energy.setX(i, descent<1 ? Math.sin(descent*Math.PI)*1.27 : 0);
        continue;
      }
      const anchor = anchorPoints[i-(count-anchorPoints.length-2)];
      if (anchor) {
        xyz.setXYZ(i,anchor[0],-anchor[1],6);
        energy.setX(i,entrance.value*(i===count-3 ? .88+contact*.56 : 1.45+.23*Math.sin(elapsed*1.35-i)));
        continue;
      }
      const grain = i-orbitingCount-targets.length;
      if (grain>=0 && grain<groundCount) {
        const drift = (grain*.381966+elapsed*(.006+grain%3*.002))%1;
        const near = grain%3===0;
        const x=drift*1672;
        const y=near ? 899-82*Math.abs(drift-.52)**2 : 637-74*drift+19*Math.sin(drift*16.+elapsed*.59+grain);
        xyz.setXYZ(i,x,-y+Math.sin(elapsed*.83+grain)*9,0);
        energy.setX(i,(.10+.18*(.5+.5*Math.sin(elapsed*.92+grain*2.4))**4)*Math.sin(drift*Math.PI));
        continue;
      }
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
    ready = loaded;
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

  const textures = [];
  const assets = ["membrane-0", "membrane-1", "membrane-2"];
  Promise.all(assets.map(asset => loader.loadAsync(new URL(`./assets/p7/${asset}.webp`,import.meta.url).href)
    .then(texture => { if (alive) textures.push(texture); else texture.dispose(); return texture; })))
    .then(images => {
      if (!alive) return;
      images.forEach((texture,index) => sculpture[index].material.uniforms.artwork.value = texture);
      playingIntro = introduction();
      entrance.value = playingIntro ? 0 : 1;
      size();
      renderer.render(scene,camera);
      loaded = ready = true;
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
