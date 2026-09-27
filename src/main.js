import * as THREE from 'three';
import './style.css';
import './retro.css';
import {createRetroKit} from './retro.js';
import { Game, MISSIONS, VEHICLES, random } from './game.js';

const $ = id => document.getElementById(id);
let retro=true;try{retro=localStorage.getItem('blast-graphics')!=='hd'}catch{}
const retroKit=createRetroKit();
const graphicsButton=document.createElement('button');graphicsButton.id='graphics';graphicsButton.className='icon-button';graphicsButton.title='Cambiar aspecto N64 / HD';document.querySelector('.top-actions').prepend(graphicsButton);
const modernTitle=document.querySelector('h1').innerHTML;
const modernIntro=document.querySelector('.intro').innerHTML;
const radarArrow=document.createElement('div');radarArrow.className='radar-arrow';radarArrow.setAttribute('aria-hidden','true');radarArrow.textContent='➜';$('hud').append(radarArrow);
const canvas = $('world');
canvas.tabIndex=-1;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x263e39);
scene.fog = new THREE.FogExp2(0x344a3e, .0026);
let renderer;
try { renderer = new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'}); }
catch { $('loading').innerHTML='<p>Este juego necesita WebGL. Abre esta página en Chrome, Edge o Firefox con la aceleración gráfica activada.</p>'; throw new Error('WebGL no disponible'); }
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.35;
const camera=new THREE.OrthographicCamera(-100,100,65,-65,.1,600);
const hemisphere=new THREE.HemisphereLight(0xc8e2d6,0x5b5940,2.1);scene.add(hemisphere);
const sun=new THREE.DirectionalLight(0xffd7a0,3.2);sun.position.set(-50,90,35);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-100,right:100,top:105,bottom:-105,near:1,far:230});sun.shadow.bias=-.0004;sun.shadow.normalBias=.12;scene.add(sun);
const rim=new THREE.DirectionalLight(0x9cdfd1,1.4);rim.position.set(35,25,-70);scene.add(rim);
const materials=new Map();
function mat(color,opts={}){const key=color+JSON.stringify(opts);if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness:.83,...opts}));return materials.get(key)}
const boxGeo=new THREE.BoxGeometry(1,1,1);
function box(parent,x,y,z,w,h,d,color,opts={}){const m=new THREE.Mesh(boxGeo,mat(color,opts));m.position.set(x,y,z);m.scale.set(w,h,d);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function cylinder(parent,x,y,z,r,h,color,segments=12){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,segments),mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function line(parent,points,color,opacity=1){const m=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p))),new THREE.LineBasicMaterial({color,transparent:opacity<1,opacity}));parent.add(m);return m}
function textTexture(text,color='#dce2b3',background=null){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');if(background){ctx.fillStyle=background;ctx.fillRect(0,0,512,128)}ctx.fillStyle=color;ctx.font='bold 66px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,64);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
function label(parent,text,x,y,z,w=12,h=3,color){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:textTexture(text,color),transparent:true,depthWrite:false,side:THREE.DoubleSide}));m.position.set(x,y,z);m.rotation.x=-Math.PI/2;parent.add(m);return m}
let levelGroup=new THREE.Group();scene.add(levelGroup);
let buildingViews=new Map(),pickupViews=[],debris=[],rings=[],dust=[],vehicles=[],convoyView,beacons=[];
const game=new Game();
let selectedMission=0,keys={},mode='menu',last=performance.now(),worldTime=0,shake=0,toastTimer=0,soundEnabled=false,audioContext=null,engineOsc=null,engineGain=null,lastHitSound=0;
let best={};try{best=JSON.parse(localStorage.getItem('blast-recharged-records')||'{}')}catch{}
const cameraTarget=new THREE.Vector3(-25,0,8);
let zoom=1;

function buildVehicle(type){
  const g=new THREE.Group(),color=VEHICLES[type].color;
  if(type===0){
    for(const x of [-1.55,1.55]){box(g,x,.8,0,1,1.35,4.6,0x242a26);for(let z=-1.6;z<=1.6;z+=.8){const wheel=cylinder(g,x,.8,z,.45,1.06,0x77735a,10);wheel.rotation.z=Math.PI/2}for(let z=-2;z<=2;z+=.45)box(g,x,1.49,z,1.04,.08,.16,0x575d50)}
    box(g,0,1.35,0,2.8,.9,3.9,color);box(g,0,2.3,-.6,1.85,1.55,1.8,color);box(g,0,2.5,.34,1.5,.92,.08,0x253f3b,{metalness:.5,roughness:.15});box(g,0,3.15,-.6,2.25,.18,2.2,0xffc35a);
    for(const x of [-.95,.95])box(g,x,2.45,-.6,.06,.95,1.48,0x344b40,{metalness:.4});
    box(g,0,1.0,2.7,4.8,1.55,.42,0xf7bc53);box(g,0,.31,2.85,5,.18,.65,0xb9b79a);for(const x of [-1.2,1.2])box(g,x,.9,1.8,.3,.35,1.9,0x857e52);
    cylinder(g,.9,2.5,-1.6,.15,1.8,0x343c33);box(g,0,1.85,.9,1.7,.13,1.45,0x272f2a);box(g,0,3.4,-.6,.6,.25,.45,0xff7633,{emissive:0xff5d12,emissiveIntensity:.8});
  }else if(type===1){
    box(g,0,1,0,2.8,.7,5,color);box(g,0,1.7,1.35,2.6,1.3,1.9,color);box(g,0,1.96,2.33,2.2,.7,.05,0x203d3b,{metalness:.5});box(g,0,1.5,-.9,2.65,.18,2.65,0x34473b);for(const x of [-1.3,1.3])box(g,x,1.8,-.9,.18,.6,2.8,color);box(g,0,1.8,-2.27,2.6,.6,.15,color);
    for(const x of [-1.4,1.4])for(const z of [-1.55,1.6]){const wheel=cylinder(g,x,.7,z,.7,.45,0x202924);wheel.rotation.z=Math.PI/2;const hub=cylinder(g,x*1.05,.7,z,.35,.47,0xc5c9a7);hub.rotation.z=Math.PI/2}
    for(const x of [-.85,.85])box(g,x,1.4,2.52,.5,.3,.07,0xfff1b8,{emissive:0xffe7a4,emissiveIntensity:.6});box(g,0,2.5,1.3,2.8,.15,2.05,0xb1e1d0);
  }else{
    for(const x of [-1.25,1.25]){box(g,x,.45,.3,1.4,.75,2.2,0x394d43);box(g,x,1.7,0,.75,2.0,.9,color);cylinder(g,x,2.7,0,.56,.8,0x66745c)}
    box(g,0,3.4,0,3,2,1.7,color);box(g,0,3.7,.92,2.5,.7,.14,0x364f45);box(g,0,3.7,1.02,1.75,.18,.1,0xff7942,{emissive:0xff581c,emissiveIntensity:1.6});
    for(const x of [-2.05,2.05]){box(g,x,3.5,0,1.05,1.25,1.2,0xf6a65d);box(g,x,2.55,.5,.8,1.7,.9,color);box(g,x,1.9,.8,1.35,.85,1.4,0x506650)}
    box(g,0,4.65,-.15,1.25,.7,1.1,color);box(g,0,4.8,.43,.85,.2,.07,0xa8ece0,{emissive:0x70e9d8,emissiveIntensity:1});
  }
  const marker=new THREE.Mesh(new THREE.RingGeometry(3.1,3.2,48),new THREE.MeshBasicMaterial({color:0xc9e8ae,transparent:true,opacity:.55,side:THREE.DoubleSide}));marker.rotation.x=-Math.PI/2;marker.position.y=.12;g.add(marker);return retro?retroKit.vehicle(g,type):g;
}
function buildConvoy(){const g=new THREE.Group();box(g,0,.95,0,3.1,.7,9.5,0x30392c);box(g,0,2.05,-3.3,3.1,2.3,2.8,0xd4d6b0);box(g,0,2.38,-4.72,2.65,1,.08,0x314940);box(g,0,3.25,-3.3,3.3,.2,2.9,0xf1dcaa);box(g,0,1.1,-4.86,3.5,.45,.25,0x777d5e);const tank=cylinder(g,0,2.2,1.0,1.7,6.0,0xbcbc8e,12);tank.rotation.x=Math.PI/2;for(const z of [-1.4,1.1,3.6]){const band=cylinder(g,0,2.2,z,1.73,.23,0x566044,12);band.rotation.x=Math.PI/2}for(const x of [-1.65,1.65])for(const z of [-3.2,1.6,3.4]){const w=cylinder(g,x,.8,z,.76,.55,0x252f25);w.rotation.z=Math.PI/2}box(g,0,3.4,1.1,1.4,.08,2,0xf8aa3a);label(g,'☢',0,3.48,1.1,1.7,1.7,'#283420');for(const x of [-1.1,1.1]){box(g,x,1.8,-4.78,.55,.35,.1,0xffeeb6,{emissive:0xffdb8b,emissiveIntensity:1.4});const beacon=box(g,x,3.52,-3.2,.45,.27,.45,0xff6836,{emissive:0xff4e0e,emissiveIntensity:2});beacons.push(beacon)}return g}

function buildBuilding(b,rng){
  if(retro){const g=retroKit.building(b,rng);levelGroup.add(g);buildingViews.set(b.id,g);return}
  const g=new THREE.Group();g.position.set(b.x,0,b.z);const colors=[0x74857b,0x9a9d85,0x778b7b,0xadb09a,0x657e76];const color=b.route?0xa7a18a:colors[Math.floor(rng()*colors.length)];
  box(g,0,.22,0,b.w+1.4,.44,b.d+1.4,0x52645a);const body=box(g,0,b.h/2,0,b.w,b.h,b.d,color);box(g,0,b.h+.15,0,b.w+.5,.3,b.d+.5,b.route?0xff914e:0xc0bba0);box(g,0,b.h+.35,0,b.w-.65,.12,b.d-.65,b.route?0xbd743e:0x596e61);
  for(const side of [-1,1]){box(g,side*(b.w/2-.15),b.h+.56,0,.25,.6,b.d+.3,color);box(g,0,b.h+.56,side*b.d/2,b.w,.6,.22,color)}
  box(g,b.w*.18,b.h+.9,-b.d*.16,b.w*.3,1.2,b.d*.3,0x8f9a80);box(g,b.w*.18,b.h+1.55,-b.d*.16,b.w*.34,.1,b.d*.34,0xc2c4a3);
  const matrices=[];const m=new THREE.Matrix4();for(let y=2.4;y<b.h-1;y+=2.4){for(let x=-b.w/2+1.2;x<b.w/2-.5;x+=1.9){for(const z of [-b.d/2-.015,b.d/2+.015]){m.compose(new THREE.Vector3(x,y,z),new THREE.Quaternion(),new THREE.Vector3(.8,1.1,.025));matrices.push(m.clone())}}for(let z=-b.d/2+1.2;z<b.d/2-.5;z+=1.9){for(const x of [-b.w/2-.015,b.w/2+.015]){m.compose(new THREE.Vector3(x,y,z),new THREE.Quaternion(),new THREE.Vector3(.025,1.1,.8));matrices.push(m.clone())}}}
  if(matrices.length){const windows=new THREE.InstancedMesh(boxGeo,mat(0x304d43,{metalness:.25,roughness:.4}),matrices.length);matrices.forEach((m,i)=>windows.setMatrixAt(i,m));g.add(windows)}
  if(b.route){for(const side of [-1,1])box(g,side*(b.w/2+.12),1.1,0,.12,1.8,b.d,0xff984d,{emissive:0xa64b16,emissiveIntensity:.25});const outline=line(g,[[-b.w/2-.7,.17,-b.d/2-.7],[b.w/2+.7,.17,-b.d/2-.7],[b.w/2+.7,.17,b.d/2+.7],[-b.w/2-.7,.17,b.d/2+.7],[-b.w/2-.7,.17,-b.d/2-.7]],0xff9852);label(g,'×',-b.w*.16,b.h+1.7,b.d*.18,Math.min(b.w,b.d)*.6,Math.min(b.w,b.d)*.6,'#ffcb84');g.userData.outline=outline}
  g.userData.body=body;g.userData.height=b.h;levelGroup.add(g);buildingViews.set(b.id,g);
}
function tree(x,z,rng){const g=new THREE.Group();g.position.set(x,0,z);cylinder(g,0,1.5,0,.23,3,0x716c4d,5);const foliage=new THREE.Mesh(new THREE.IcosahedronGeometry(2+rng(),0),mat([0x688167,0x718a69,0x7f936b][Math.floor(rng()*3)]));foliage.scale.y=1.3;foliage.position.y=3.6;foliage.castShadow=true;g.add(foliage);levelGroup.add(g)}
function lamp(x,z){cylinder(levelGroup,x,3.9,z,.10,7.8,0x4b5e4a,6);box(levelGroup,x-1,7.85,z,2.2,.15,.15,0x4b5e4a);box(levelGroup,x-1.9,7.7,z,.8,.14,.55,0xf7d9a5,{emissive:0xffd792,emissiveIntensity:.7})}
function crane(x,z){const g=new THREE.Group();g.position.set(x,0,z);const c=0xd6a567;box(g,0,1,0,7,2,7,0x788775);for(const a of [-1.3,1.3])for(const b of [-1.3,1.3])box(g,a,15,b,.38,28,.38,c);for(let y=3;y<29;y+=3){box(g,0,y,0,3,.3,3,c);const brace=box(g,0,y+1.4,1.3,.22,3.8,.22,c);brace.rotation.z=.72}box(g,5,29,0,24,.5,2.3,c);box(g,5,31,0,24,.2,1.6,c);for(let x=-6;x<17;x+=3){const brace=box(g,x,30,0,.2,3.8,.2,c);brace.rotation.z=1.0}box(g,-5,28,0,4,2.5,3,0x526a5a);line(g,[[14,29,0],[14,12,0]],0x283f35);box(g,14,11.5,0,1,1,1,0xf6b956);levelGroup.add(g)}
function clearScene(){retroKit.clearEffects();for(const obj of debris)levelGroup.remove(obj.mesh);debris=[];rings=[];dust=[];buildingViews.clear();pickupViews=[];beacons=[];const old=levelGroup;scene.remove(old);old.traverse(obj=>{if(obj.geometry&&obj.geometry!==boxGeo&&!obj.userData.sharedGeometry)obj.geometry.dispose();if(obj.material?.userData.persistent)return;if(obj.material?.map){obj.material.map.dispose();obj.material.dispose()}else if(obj.material&&!Array.from(materials.values()).includes(obj.material)){obj.material.dispose()}});levelGroup=new THREE.Group();scene.add(levelGroup)}
function loadLevel(index,preserve=false){
  clearScene();if(!preserve)game.reset(index);const rng=random(MISSIONS[index].seed+190);
  if(retro){retroKit.terrain(levelGroup,game,rng)}else{
  box(levelGroup,0,-2.6,0,109,5,143,0x485e51);box(levelGroup,0,-.28,0,110,.55,144,0x7f8c71);box(levelGroup,0,-.08,0,96,.12,132,0x72816a);
  box(levelGroup,0,.015,0,13,.14,137,0x354b42);for(const x of [-7.7,7.7])box(levelGroup,x,.12,0,1.7,.25,136,0x9b9f81);
  for(const z of [-55,-28,4,36,57]){box(levelGroup,0,.035,z,99,.15,6.5,0x405449);for(let x=-46;x<48;x+=6)box(levelGroup,x,.12,z,2.7,.025,.13,0xa8ac86)}
  for(const side of [-1,1]){for(const x of [side*10.7,side*46])box(levelGroup,x,.04,0,x===side*46?3:2.4,.13,130,0x69785e);for(let z=-62;z<66;z+=5){box(levelGroup,side*5.4,.13,z,.13,.02,2.6,0xbdb98a)}for(let z=-49;z<60;z+=22)lamp(side*8.5,z)}
  for(let z=-63;z<66;z+=7){box(levelGroup,0,.12,z,.15,.035,3,0xd4c992);const arrow=label(levelGroup,'⌃',0,.16,z,2.1,2.1,'#cf9d55')}
  // The luminous corridor makes the convoy route readable at a glance.
  for(const x of [-6.5,6.5])line(levelGroup,[[x,.2,62],[x,.2,-65]],0xffa763,.65);
  label(levelGroup,'EXTRACTION',0,.2,-64,11,2,'#cfdbaf');label(levelGroup,'01',-42,.13,61,7,4,'#cad0a4');label(levelGroup,'RESTRICTED',29,.13,61,18,3,'#c2c79b');
  for(let i=0;i<45;i++){const x=(rng()<.5?-1:1)*(11+rng()*35),z=-62+rng()*124;if(!game.buildings.some(b=>Math.abs(b.x-x)<b.w/2+3&&Math.abs(b.z-z)<b.d/2+3))tree(x,z,rng)}
  for(let i=0;i<10;i++){const x=50+(i%2)*0,z=-58+i*11;box(levelGroup,x,1.1,z,4,2.2,7,[0x9c644c,0x7c917c,0xb49b65][i%3]);for(let k=-2.5;k<3;k+=.65)box(levelGroup,x+2.02,1.1,z+k,.05,1.9,.08,0x546653)}
  crane(41,-54);for(let z=-67;z<70;z+=8)box(levelGroup,54,.1,z,1,.25,3,0xb1a17b);
  for(let i=0;i<26;i++){const x=-50+rng()*98,z=-66+rng()*132;if(Math.abs(x)>10&&!game.buildings.some(b=>Math.abs(b.x-x)<b.w/2+1&&Math.abs(b.z-z)<b.d/2+1)){box(levelGroup,x,.5,z,.8,1,.8,0xb79769)}}
  }
  for(const b of game.buildings){buildBuilding(b,rng);const view=buildingViews.get(b.id);view.visible=!b.destroyed;view.scale.y=.5+.5*b.hp/b.maxHp;if(b.destroyed)box(levelGroup,b.x,.16,b.z,b.w,.3,b.d,retro?0x655440:0x616e57)}
  for(const item of game.pickups){const g=new THREE.Group();g.position.set(item.x,1.5,item.z);box(g,0,0,0,1.8,1.8,1.8,retro?0xffe52a:0xc7e2a7,{emissive:retro?0x765500:0x82d787,emissiveIntensity:.5});box(g,0,0,1,.35,1.3,.08,0x355b42);box(g,0,0,1,1.3,.35,.08,0x355b42);g.visible=!item.taken;levelGroup.add(g);pickupViews.push(g)}
  convoyView=retro?retroKit.convoy():buildConvoy();convoyView.position.set(0,0,game.convoy.z);levelGroup.add(convoyView);
  vehicles=VEHICLES.map((_,i)=>{const v=buildVehicle(i);levelGroup.add(v);v.visible=i===0;return v});syncVehicles();
  // A dark water plane and small piers ground the floating industrial district.
  if(!retro){const water=box(levelGroup,0,-5.4,0,1500,.4,1500,0x2e4942,{metalness:.25,roughness:.48});water.receiveShadow=false;
  for(let i=0;i<65;i++){const x=(rng()-.5)*340,z=(rng()-.5)*300;if(Math.abs(x)>58||Math.abs(z)>77)box(levelGroup,x,-5.12,z,3+rng()*10,.015,.08,0x50675b,{transparent:true,opacity:.3})}
  }
  updateHud();drawMap();
}
function syncVehicles(){vehicles.forEach((v,i)=>{v.visible=i===game.player.vehicle;v.position.set(game.player.x,0,game.player.z);v.rotation.y=game.player.angle})}
function burst(x,z,color,count=18,height=2){for(let i=0;i<count;i++){const size=.3+Math.random()*1.15;const mesh=box(levelGroup,x+(Math.random()-.5)*3,height+Math.random()*3,z+(Math.random()-.5)*3,size,size,size,color);debris.push({mesh,v:new THREE.Vector3((Math.random()-.5)*20,8+Math.random()*15,(Math.random()-.5)*20),life:2+Math.random(),rot:new THREE.Vector3(Math.random()*6,Math.random()*6,Math.random()*6)})}while(debris.length>200){levelGroup.remove(debris.shift().mesh)}}
function wave(x,z,radius,color=0xffa368){if(retro){retroKit.explosion(levelGroup,x,z,Math.min(radius,7));return}const mesh=new THREE.Mesh(new THREE.RingGeometry(.94,1,64),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.8,side:THREE.DoubleSide,depthWrite:false}));mesh.rotation.x=-Math.PI/2;mesh.position.set(x,.3,z);levelGroup.add(mesh);rings.push({mesh,time:0,radius})}
function toast(message){$('toast').textContent=message;$('toast').classList.add('show');toastTimer=3}
function audioInit(){if(audioContext)return;try{audioContext=new(window.AudioContext||window.webkitAudioContext)();engineOsc=audioContext.createOscillator();engineGain=audioContext.createGain();engineOsc.type='sawtooth';engineOsc.frequency.value=40;engineGain.gain.value=0;const filter=audioContext.createBiquadFilter();filter.type='lowpass';filter.frequency.value=170;engineOsc.connect(filter);filter.connect(engineGain);engineGain.connect(audioContext.destination);engineOsc.start()}catch{}}
function sound(type){if(!soundEnabled||!audioContext)return;const now=audioContext.currentTime;const gain=audioContext.createGain();gain.connect(audioContext.destination);if(type==='destroy'||type==='hit'||type==='ability'){const duration=type==='destroy'?.65:.2;const buffer=audioContext.createBuffer(1,audioContext.sampleRate*duration,audioContext.sampleRate);const data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);const source=audioContext.createBufferSource();source.buffer=buffer;const filter=audioContext.createBiquadFilter();filter.type='lowpass';filter.frequency.value=type==='destroy'?550:230;source.connect(filter);filter.connect(gain);gain.gain.setValueAtTime(type==='destroy'?.45:.18,now);gain.gain.exponentialRampToValueAtTime(.001,now+duration);source.start();source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect()}}else{const osc=audioContext.createOscillator();osc.type='sine';osc.connect(gain);osc.frequency.setValueAtTime(type==='lost'?150:420,now);osc.frequency.exponentialRampToValueAtTime(type==='lost'?40:900,now+.3);gain.gain.setValueAtTime(.12,now);gain.gain.exponentialRampToValueAtTime(.001,now+.5);osc.start();osc.stop(now+.5);osc.onended=()=>{osc.disconnect();gain.disconnect()}}}
function handleEvents(){for(const e of game.drainEvents()){
  if(e.type==='hit'){const view=buildingViews.get(e.id),b=game.buildings[e.id];if(view){const ratio=b.hp/b.maxHp;view.scale.y=.5+ratio*.5;view.rotation.z=(1-ratio)*.045;view.userData.flash=.12}if(worldTime-lastHitSound>.2){sound('hit');lastHitSound=worldTime}}
  if(e.type==='destroy'){const b=game.buildings[e.id],view=buildingViews.get(e.id);if(view)view.visible=false;burst(b.x,b.z,b.route?0xc6ac82:0x9baf93,26,b.h*.45);wave(b.x,b.z,b.w*1.3,0xc2cb9f);box(levelGroup,b.x,.2,b.z,b.w,.4,b.d,0x616e57);for(let i=0;i<5;i++)box(levelGroup,b.x+(Math.random()-.5)*b.w,.4,b.z+(Math.random()-.5)*b.d,1+Math.random()*2,.5+Math.random()*.8,1+Math.random()*2,0x9b9f80);shake=.55;sound('destroy');toast(b.route?`RUTA DESPEJADA  /  ${game.cleared} DE ${game.mission.obstacles}`:`DEMOLICIÓN  +${150*Math.min(e.combo,5)}`);if(game.cleared===game.mission.obstacles)toast('CORREDOR LIBRE · ESCOLTA EL CONVOY HASTA LA SALIDA')}
  if(e.type==='ability'){wave(e.x,e.z,e.radius);burst(e.x,e.z,0xd5b578,10,.8);shake=.22;sound('ability')}
  if(e.type==='ram')burst(e.x,e.z,0xd7b66e,2,.5);
  if(e.type==='pickup'){pickupViews.forEach((v,i)=>v.visible=!game.pickups[i].taken);wave(e.x,e.z,7,0xb3efa2);toast('EQUIPO EVACUADO · +350 · ENERGÍA RESTAURADA');sound('pickup')}
  if(e.type==='switch'){syncVehicles();document.querySelectorAll('.vehicle').forEach((el,i)=>el.classList.toggle('active',i===e.index));$('ability-name').textContent=VEHICLES[e.index].ability;toast(`${VEHICLES[e.index].name} EN LÍNEA`);sound('switch')}
  if(e.type==='won'||e.type==='lost')finish(e.type==='won');
}}
function updateHud(){const p=game.player,c=game.convoy;$('score').textContent=retro?game.score.toLocaleString('en-US'):String(game.score).padStart(6,'0');$('cleared').textContent=`${game.cleared} / ${game.mission.obstacles}`;$('route-bar').style.width=`${game.cleared/game.mission.obstacles*100}%`;$('convoy-bar').style.width=`${Math.min(100,(58-c.z)/118*100)}%`;$('energy-bar').style.width=p.energy+'%';$('integrity').textContent=`INTEGRIDAD ${Math.ceil(c.hp)}%`;$('integrity').style.color=c.hp<40?'#ff7847':'';$('convoy-status').textContent=c.blocked?'¡BLOQUEADO!':'EN MOVIMIENTO';$('convoy-status').style.color=c.blocked?'#ff7847':'';$('timer').textContent=`${String(Math.floor(game.time/60)).padStart(2,'0')}:${String(Math.floor(game.time%60)).padStart(2,'0')}`;$('combo').textContent=`MULTIPLICADOR ×${Math.max(1,Math.min(game.combo,5))}`;$('objective').textContent=c.blocked?'¡Convoy bloqueado! Derriba el obstáculo o perderás la carga.':game.cleared===game.mission.obstacles?'Corredor libre. El convoy se dirige a la extracción.':'Derriba los edificios que bloquean la carretera.';}
function drawMap(){const ctx=$('minimap').getContext('2d'),w=180,h=216;if(retro){retroKit.radar(ctx,game);const b=game.buildings.find(b=>b.route&&!b.destroyed);const dx=(b?b.x:0)-game.player.x,dz=(b?b.z:-63)-game.player.z;const angle=Math.atan2(dz*.86-dx*.5,dx*.86+dz*.5)*180/Math.PI;radarArrow.style.transform=`rotate(${angle}deg)`;return}ctx.clearRect(0,0,w,h);ctx.fillStyle='#14281fd9';ctx.fillRect(0,0,w,h);const mx=x=>90+x*1.6,mz=z=>108+z*1.48;ctx.strokeStyle='#84976e30';ctx.lineWidth=1;for(let i=0;i<w;i+=18){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,h);ctx.stroke()}for(let i=0;i<h;i+=18){ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(w,i);ctx.stroke()}ctx.fillStyle='#849b6244';ctx.fillRect(80,10,20,h-20);ctx.setLineDash([3,5]);ctx.strokeStyle='#e8b270';ctx.beginPath();ctx.moveTo(90,12);ctx.lineTo(90,206);ctx.stroke();ctx.setLineDash([]);for(const b of game.buildings){if(b.destroyed)continue;ctx.fillStyle=b.route?'#f69054':'#738871';ctx.fillRect(mx(b.x)-b.w*.7,mz(b.z)-b.d*.7,b.w*1.4,b.d*1.4)}for(const p of game.pickups){if(p.taken)continue;ctx.fillStyle='#b3eea8';ctx.fillRect(mx(p.x)-2,mz(p.z)-2,4,4)}ctx.fillStyle='#f4e6b5';ctx.fillRect(86,mz(game.convoy.z)-6,8,12);ctx.save();ctx.translate(mx(game.player.x),mz(game.player.z));ctx.rotate(-game.player.angle);ctx.fillStyle='#ff8b4d';ctx.beginPath();ctx.moveTo(0,6);ctx.lineTo(-4,-4);ctx.lineTo(4,-4);ctx.closePath();ctx.fill();ctx.restore();ctx.fillStyle='#d5ddbb';ctx.font='8px monospace';ctx.fillText('N ↑  MAPA TÁCTICO',10,13)}
function selectMission(index){selectedMission=index;loadLevel(index);$('mission-number').textContent=String(index+1).padStart(2,'0');$('mission-name').textContent=MISSIONS[index].name;$('difficulty').textContent=MISSIONS[index].subtitle;$('mission-description').textContent=MISSIONS[index].description;$('caption-name').textContent=MISSIONS[index].name.toUpperCase();$('sector').textContent=String(index+1).padStart(2,'0');$('record').textContent=best[index]?`RÉCORD ${best[index].toLocaleString('es-ES')}`:'RÉCORD —';document.querySelectorAll('.mission-tab').forEach((b,i)=>b.classList.toggle('active',i===index))}
function start(){audioInit();if(audioContext?.state==='suspended')audioContext.resume();loadLevel(selectedMission);game.start();mode='playing';zoom=1;keys={};document.body.classList.add('playing');document.body.classList.remove('game-over');$('briefing').classList.add('hidden');$('scene-caption').classList.add('hidden');$('hud').classList.remove('hidden');$('modal').classList.add('hidden');$('operation-label').textContent='OPERACIÓN EN CURSO';$('ability-name').textContent=VEHICLES[0].ability;document.querySelectorAll('.vehicle').forEach((el,i)=>el.classList.toggle('active',i===0));toast('WASD PARA CONDUCIR · ESPACIO PARA DEMOLER');canvas.focus();}
function modal(eyebrow,title,content,buttons){$('modal-eyebrow').textContent=eyebrow;$('modal-title').textContent=title;$('modal-content').innerHTML=content;$('modal-buttons').replaceChildren();buttons.forEach((button,i)=>{const el=document.createElement('button');el.className=i===0?'primary-button':'secondary-button';el.textContent=button.text;el.onclick=button.action;$('modal-buttons').append(el)});$('modal').classList.remove('hidden');$('modal-buttons').firstElementChild?.focus()}
function resume(){if(game.state==='playing'){mode='playing';$('operation-label').textContent='OPERACIÓN EN CURSO'}else mode='menu';$('modal').classList.add('hidden');keys={}}
function pause(){if(mode==='paused'){resume();return}if(mode!=='playing')return;mode='paused';keys={};$('operation-label').textContent='OPERACIÓN EN PAUSA';modal('OPERACIÓN EN PAUSA','Toma un respiro.','<p>El convoy espera. Vuelve cuando estés listo para hacer un poco más de sitio.</p>',[{text:'CONTINUAR →',action:resume},{text:'REINICIAR MISIÓN',action:start},{text:'VOLVER A OPERACIONES',action:menu}])}
function menu(){mode='menu';keys={};game.state='ready';document.body.classList.remove('playing','game-over');$('hud').classList.add('hidden');$('briefing').classList.remove('hidden');$('scene-caption').classList.remove('hidden');$('modal').classList.add('hidden');$('operation-label').textContent='CENTRO DE OPERACIONES';zoom=1;selectMission(selectedMission)}
function finish(won){mode='result';keys={};document.body.classList.add('game-over');sound(won?'won':'lost');if(won){best[selectedMission]=Math.max(best[selectedMission]||0,game.score);try{localStorage.setItem('blast-recharged-records',JSON.stringify(best))}catch{}}else{burst(0,game.convoy.z,0xff8752,60,5);wave(0,game.convoy.z,22);shake=1.2}const medal=game.convoy.hp>85?'ORO':game.convoy.hp>50?'PLATA':'BRONCE';modal(won?`MISIÓN CUMPLIDA / ${medal}`:'OPERACIÓN FALLIDA',won?'Camino despejado.':'Carga perdida.',`<p>${won?'El convoy ha llegado a la zona de extracción. Buen trabajo, operador.':'El convoy quedó atrapado y la carga se desestabilizó. Usa las habilidades cerca de los edificios de la carretera para abrir paso más rápido.'}</p><div class="results"><span>PUNTUACIÓN<b>${game.score.toLocaleString('es-ES')}</b></span><span>INTEGRIDAD<b>${Math.ceil(game.convoy.hp)}%</b></span><span>EVACUADOS<b>${game.rescued}/3</b></span></div>`,[{text:won&&selectedMission<2?'SIGUIENTE OPERACIÓN →':'REINTENTAR OPERACIÓN →',action:()=>{if(won&&selectedMission<2)selectedMission++;start()}},{text:'VOLVER A OPERACIONES',action:menu}])}
function help(){if(mode==='result')return;if(mode==='playing'){mode='paused';keys={}}modal('MANUAL DEL OPERADOR','Destruir para salvar.',`<p>El convoy avanza sin detenerse voluntariamente. Derriba todos los edificios <b style="color:#ffce2e">en la carretera</b> antes de que choque. Si se bloquea, su integridad cae.</p><div class="control-row"><span>Acelerar / marcha atrás</span><kbd>W / S · ↑ / ↓</kbd></div><div class="control-row"><span>Girar</span><kbd>A / D · ← / →</kbd></div><div class="control-row"><span>Habilidad de demolición</span><kbd>ESPACIO</kbd></div><div class="control-row"><span>Turbo / cambiar vehículo</span><kbd>SHIFT / 1 2 3</kbd></div><div class="control-row"><span>Pausa / reiniciar / cámara</span><kbd>ESC / R / RUEDA</kbd></div><p><b>Dozer:</b> embestida equilibrada. <b>Drifter:</b> rápido, con daño en área. <b>Titan:</b> lento, pero su onda sísmica derriba varias estructuras. La energía se regenera. Recoge los cubos con una cruz para evacuar equipos y recargarla.</p>`,[{text:'ENTENDIDO →',action:resume}])}
MISSIONS.forEach((_,i)=>{const b=document.createElement('button');b.className='mission-tab';b.textContent=`0${i+1} / ${['DISTRITO','PUERTO','CENTRO'][i]}`;b.onclick=()=>selectMission(i);$('missions').append(b)});
$('start').onclick=start;$('pause').onclick=pause;$('help').onclick=help;
$('sound').onclick=()=>{audioInit();audioContext?.resume();soundEnabled=!soundEnabled;$('sound').textContent=soundEnabled?'♫':'♪';$('sound').setAttribute('aria-label',soundEnabled?'Silenciar audio':'Activar audio');$('sound').style.color=soundEnabled?'#ff7847':'';if(soundEnabled)sound('switch')};
document.querySelectorAll('[data-vehicle]').forEach(b=>b.onclick=()=>{if(mode==='playing'){game.setVehicle(Number(b.dataset.vehicle));canvas.focus()}});
window.addEventListener('keydown',e=>{if(mode==='playing'&&['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(e.code==='Escape'){if(mode==='menu')$('modal').classList.add('hidden');else pause();return}if(mode!=='playing')return;keys[e.code]=true;if(e.code==='Space'&&!e.repeat)game.ability();if(!e.repeat&&/^Digit[123]$/.test(e.code))game.setVehicle(Number(e.code.slice(-1))-1);if(e.code==='KeyR'&&!e.repeat)start()});
window.addEventListener('keyup',e=>{keys[e.code]=false});window.addEventListener('blur',()=>{keys={};if(mode==='playing')pause()});document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='playing')pause()});
window.addEventListener('wheel',e=>{if(mode==='playing')zoom=THREE.MathUtils.clamp(zoom+e.deltaY*.0008,.7,1.4)},{passive:true});
document.querySelectorAll('[data-key]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys[b.dataset.key]=true});for(const type of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,()=>keys[b.dataset.key]=false)});
function resize(){if(retro){renderer.setPixelRatio(1);const h=Math.min(innerHeight,360);renderer.setSize(Math.round(h*innerWidth/innerHeight),h,false)}else{renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setSize(innerWidth,innerHeight,false)}camera.updateProjectionMatrix()}window.addEventListener('resize',resize);resize();
function applyGraphics(){
  document.body.classList.toggle('retro',retro);graphicsButton.textContent=retro?'N64':'HD';graphicsButton.setAttribute('aria-label',retro?'Cambiar a gráficos HD':'Cambiar a gráficos N64');graphicsButton.setAttribute('aria-pressed',String(retro));
  document.querySelector('h1').innerHTML=retro?'BLAST<br><em>CORPS</em>':modernTitle;
  document.querySelector('.intro').innerHTML=retro?'¡Abre paso al transporte nuclear!<br>La demolición vuelve a los 64 bits.':modernIntro;
  document.querySelector('.briefing>.eyebrow').innerHTML=retro?'DEMOLITION TEAM · CLASSIC 64':'<span></span> DEMOLITION. REIMAGINED.';
  document.querySelector('.brand small').textContent=retro?'C L A S S I C  6 4':'R E C H A R G E D';
  renderer.toneMapping=retro?THREE.NoToneMapping:THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=retro?1:1.35;
  hemisphere.color.setHex(retro?0xe3e0ce:0xc8e2d6);hemisphere.groundColor.setHex(retro?0x61533c:0x5b5940);hemisphere.intensity=retro?1.3:2.1;
  sun.color.setHex(retro?0xfff4d8:0xffd7a0);sun.intensity=retro?1.6:3.2;rim.intensity=retro?.12:1.4;
  scene.background.setHex(retro?0x626f44:0x263e39);scene.fog.color.setHex(retro?0x899577:0x344a3e);scene.fog.density=retro?.0015:.0026;
  resize();
}
graphicsButton.onclick=()=>{retro=!retro;try{localStorage.setItem('blast-graphics',retro?'n64':'hd')}catch{}applyGraphics();loadLevel(game.index,true);if(mode==='playing')canvas.focus()};
const viewOffset=new THREE.Vector3(82,105,104),target=new THREE.Vector3();
let frameCount=0;
function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-last)/1000,.05);last=now;worldTime+=dt;
  if(mode==='playing'){game.update(dt,{forward:keys.KeyW||keys.ArrowUp,back:keys.KeyS||keys.ArrowDown,left:keys.KeyA||keys.ArrowLeft,right:keys.KeyD||keys.ArrowRight,boost:keys.ShiftLeft||keys.ShiftRight,ability:keys.Space});handleEvents();syncVehicles();convoyView.position.z=game.convoy.z;if(frameCount%3===0){updateHud();drawMap()}}
  const inMenu=mode==='menu';const narrow=innerWidth<600;
  target.set(inMenu?(narrow?-5:-27):game.player.x*(retro||narrow?1:.5),0,inMenu?(retro?28:6):game.player.z*(retro||narrow?1:.6)-(retro?3:6));cameraTarget.lerp(target,1-Math.exp(-dt*3));const span=(retro?(inMenu?83:(narrow?58:55)):(inMenu?120:(narrow?95:105)))*zoom;const aspect=innerWidth/innerHeight;camera.left=-span*aspect/2;camera.right=span*aspect/2;camera.top=span/2;camera.bottom=-span/2;camera.updateProjectionMatrix();viewOffset.set(retro?32:82,retro?110:105,retro?55:104);camera.position.copy(cameraTarget).add(viewOffset);if(shake>0){camera.position.x+=(Math.random()-.5)*shake;camera.position.y+=(Math.random()-.5)*shake;shake=Math.max(0,shake-dt*1.7)}camera.lookAt(cameraTarget);
  const animate=mode==='playing'||mode==='menu'||mode==='result';
  if(animate){if(retro)retroKit.update(dt,levelGroup,game.player,mode==='playing');pickupViews.forEach((v,i)=>{v.rotation.y=worldTime*.7;v.position.y=1.8+Math.sin(worldTime*2+i)*.35});beacons.forEach((b,i)=>b.material.emissiveIntensity=.7+Math.sin(worldTime*9+i*3)*.6);for(let i=debris.length-1;i>=0;i--){const d=debris[i];d.life-=dt;d.v.y-=27*dt;d.mesh.position.addScaledVector(d.v,dt);d.mesh.rotation.x+=d.rot.x*dt;d.mesh.rotation.z+=d.rot.z*dt;if(d.mesh.position.y<.3){d.mesh.position.y=.3;d.v.y=Math.abs(d.v.y)*.22;d.v.x*=.9;d.v.z*=.9}if(d.life<.5)d.mesh.scale.multiplyScalar(Math.max(.8,1-dt*4));if(d.life<=0){levelGroup.remove(d.mesh);debris.splice(i,1)}}for(let i=rings.length-1;i>=0;i--){const r=rings[i];r.time+=dt;const t=r.time/.7;r.mesh.scale.setScalar(1+t*r.radius);r.mesh.material.opacity=Math.max(0,(1-t)*.65);if(t>=1){levelGroup.remove(r.mesh);r.mesh.geometry.dispose();r.mesh.material.dispose();rings.splice(i,1)}}}
  if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)$('toast').classList.remove('show')}
  if(engineGain){engineGain.gain.setTargetAtTime(soundEnabled&&mode==='playing'?.025+Math.abs(game.player.speed)*.001:0,audioContext.currentTime,.1);engineOsc.frequency.setTargetAtTime(32+Math.abs(game.player.speed)*2,audioContext.currentTime,.1)}
  renderer.render(scene,camera);frameCount++;
}
applyGraphics();selectMission(0);$('loading').classList.add('hidden');requestAnimationFrame(frame);
// Development-only inspection for deterministic integration tests.
if(import.meta.env.DEV)window.__blast={game,start,selectMission,menu,renderer,get mode(){return mode}};
