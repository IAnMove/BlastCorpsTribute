import * as THREE from 'three';
import {routeDistance} from './levels.js';
const cube=new THREE.BoxGeometry(1,1,1),materials=new Map();
function material(color,glow=0){const key=`${color}/${glow}`;if(!materials.has(key)){const m=new THREE.MeshStandardMaterial({color,roughness:.9,flatShading:true,emissive:color,emissiveIntensity:glow});m.userData.persistent=true;materials.set(key,m)}return materials.get(key)}
function box(g,x,y,z,w,h,d,color,glow=0){const m=new THREE.Mesh(cube,material(color,glow));m.position.set(x,y,z);m.scale.set(w,h,d);m.castShadow=true;m.receiveShadow=true;m.userData.sharedGeometry=true;g.add(m);return m}
function cyl(g,x,y,z,r,h,color){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,10),material(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m}
function stroke(g,points,color){const m=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p))),new THREE.LineBasicMaterial({color}));g.add(m);return m}
function placard(g,text,x,y,z,color='#d5fffa') {const c=document.createElement('canvas');c.width=256;c.height=64;const ctx=c.getContext('2d');ctx.fillStyle='#15232bcc';ctx.fillRect(0,0,256,64);ctx.fillStyle=color;ctx.font='bold 30px Arial';ctx.textAlign='center';ctx.fillText(text,128,43);const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map,depthTest:false,transparent:true}));sprite.position.set(x,y,z);sprite.scale.set(8,2,1);g.add(sprite);return sprite}
function segment(parent,a,b,width,color,y=.16){const dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);const road=box(parent,(a[0]+b[0])/2,y,(a[1]+b[1])/2,width,.12,length+width,color);road.rotation.y=Math.atan2(dx,dz);return road}

export function buildCampaignTerrain(parent,game,retro,kit){
  const m=game.mission,theme=m.theme,night=theme==='night',canyon=theme==='canyon',harbor=theme==='harbor';
  const terrainColor=night?0x252e39:canyon?0xb58a55:harbor?0x7d8582:0x7f785e;
  if(retro){kit.ground(parent,0,0,700,700,canyon?'dirt':'grass',-.12);kit.ground(parent,0,0,128,158,canyon?'dirt':'concrete',-.07)}else{box(parent,0,-.45,0,700,.4,700,harbor?0x335b69:canyon?0xb18a54:0x425047);box(parent,0,-.13,0,128,.2,158,terrainColor)}
  if(night)box(parent,0,-.005,0,128,.03,158,terrainColor);
  for(const h of m.hazards){box(parent,h.x,.03,h.z,h.w,.14,h.d,canyon?0x3e3028:0x24526e);for(let i=0;i<8;i++){const z=h.z-h.d/2+(i+.5)*h.d/8;box(parent,h.x,.12,z,h.w-2,.02,.16,canyon?0x5b4534:0x518a9d)}}
  for(let i=1;i<m.path.length;i++){const a=m.path[i-1],b=m.path[i];segment(parent,a,b,12,night?0x737e88:canyon?0x94734c:0xaaa68e,.13);segment(parent,a,b,9,canyon?0x796348:0x41464b,.2);const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),angle=Math.atan2(dx,dz);for(let t=3;t<len;t+=7){const x=a[0]+dx*t/len,z=a[1]+dz*t/len;const dash=box(parent,x,.28,z,.16,.035,2.9,0xe1c878);dash.rotation.y=angle;for(const side of [-1,1]){const px=x+side*5.2*Math.cos(angle),pz=z-side*5.2*Math.sin(angle);box(parent,px,.53,pz,.22,.7,.22,0x5a5b4a);box(parent,px,.97,pz,.4,.23,.4,0xffc738,night?1:.2)}}}
  for(const b of m.bridges){box(parent,b.x,.24,b.z,b.w,.22,b.d,0x858b85);for(const side of [-1,1]){box(parent,b.x,1,b.z+side*b.d/2,b.w,.2,.2,0xc6c3a8);for(let x=b.x-b.w/2;x<=b.x+b.w/2;x+=3)box(parent,x,.65,b.z+side*b.d/2,.22,1.3,.22,0x515968)}for(let x=b.x-b.w/2;x<b.x+b.w/2;x+=2)box(parent,x,.38,b.z,.12,.05,b.d,0x4d5156)}
  const end=m.path.at(-1);for(let x=-4;x<5;x++)for(let z=0;z<2;z++)box(parent,end[0]+x,.29,end[1]+z,1,.03,1,(x+z)%2?0xe0dcc5:0x232b34);placard(parent,'EXTRACCIÓN',end[0],3.5,end[1]);
  const spawn=m.path[0];placard(parent,m.short,spawn[0],5,spawn[1]-2,'#ffdf73');
  // Side tracks point to terminals so their objectives can be read in the world.
  const consoles=new Map();
  for(const c of game.consoles){const g=new THREE.Group();g.position.set(c.x,0,c.z);box(g,0,.2,0,5,.4,5,0x777a72);box(g,0,1.2,0,1.5,2.1,1.1,0x273947);const screen=box(g,0,1.65,.58,1.16,.76,.08,c.active?0x77ee77:0x43dfff,1);box(g,.6,3,0,.13,3,.13,0x637278);box(g,.6,4.5,0,.45,.4,.45,c.active?0x77ee77:0x43dfff,1);const sign=placard(g,c.active?'ABIERTO':'[ E ]',0,5.7,0);g.userData={screen,sign};parent.add(g);consoles.set(c.id,g)}
  for(const p of m.props){const g=new THREE.Group();g.position.set(p.x,0,p.z);parent.add(g);
    if(p.type==='crane'){for(const x of [-2.5,2.5])for(const z of [-2.5,2.5])box(g,x,10,z,.6,20,.6,0xd39736);for(let y=3;y<21;y+=4)box(g,0,y,0,6,.4,6,0x916d2d);box(g,-5,21,0,23,.65,3,0xe0b04c);box(g,4,19,0,5,3,4,0x5d686b);stroke(g,[[-14,21,0],[-14,6,0]],0x252b32);box(g,-14,5.5,0,1,1,1,0xd7a932)}
    if(p.type==='containers'){for(let i=0;i<5;i++){const x=(i%2)*5,z=Math.floor(i/2)*8;box(g,x,1.4,z,4,2.8,7,[0xb84b39,0x537c7f,0xc6a145][i%3]);for(let k=-3;k<3;k+=.7)box(g,x+2.03,1.5,z+k,.05,2.6,.08,0x474a42)}}
    if(p.type==='ship'){box(g,0,.45,0,13,2,29,0x343b45);box(g,0,1.5,0,11,.5,26,0xb0ada0);box(g,0,3,9,8,4,7,0xe1dcca);box(g,0,5.6,10,6,1.1,5,0x778c91);for(const x of [-2.7,2.7])for(const z of [-8,0])box(g,x,2.9,z,4,3,6,0xa85137);cyl(g,0,6.8,10,.8,3,0xb4442e)}
    if(p.type==='chimneys'){for(let i=0;i<3;i++){cyl(g,i*4,8,0,1.3,16,0x777c77);for(const y of [8,13])cyl(g,i*4,y,0,1.34,2,0xbd5944)}box(g,4,1,-3,13,2,7,0x666966)}
    if(p.type==='pipes'){for(const z of [-2,2]){const pipe=cyl(g,0,3,z,.65,19,0xaf9c60);pipe.rotation.z=Math.PI/2;for(const x of [-8,0,8])box(g,x,1.6,z,.4,3,.6,0x59635d)}}
    if(p.type==='rocks'){for(let i=0;i<6;i++){const rock=new THREE.Mesh(new THREE.IcosahedronGeometry(4+i%3,0),material(0x8a6241));rock.position.set((i%2)*6,2,Math.floor(i/2)*6);rock.scale.y=1.2;rock.castShadow=true;g.add(rock)}}
    if(p.type==='power'){box(g,0,.6,0,10,1.2,8,0x7c8992);for(const x of [-3,3]){box(g,x,2.1,0,2.8,3,5,0x556d7b);for(const z of [-1.5,1.5]){cyl(g,x,4.4,z,.35,2,0x9ed4e2);cyl(g,x,5.3,z,.6,.5,0x73aebf)}}}
  }
  // Peripheral lights and terrain features stay clear of the drivable route.
  for(let i=0;i<16;i++){const x=(i%2?1:-1)*57,z=63-Math.floor(i/2)*18;if(routeDistance(m.path,x,z)<8)continue;if(night||harbor){box(parent,x,5,z,.2,10,.2,0x69757f);box(parent,x,10,z,2,.3,1,0xffe3a5,1.5);if(night){const glow=new THREE.Mesh(new THREE.CircleGeometry(5,20),new THREE.MeshBasicMaterial({color:0xffcf7c,transparent:true,opacity:.13,depthWrite:false}));glow.rotation.x=-Math.PI/2;glow.position.set(x,.1,z);parent.add(glow)}}else if(canyon){const rock=new THREE.Mesh(new THREE.ConeGeometry(7,12,5),material(0xa87548));rock.position.set(x,3,z);parent.add(rock)}}
  return consoles;
}

export function buildSpecialBuilding(b){
  if(!['tank','rock','reinforced','gate'].includes(b.kind))return null;
  const g=new THREE.Group();g.position.set(b.x,0,b.z);let body;
  if(b.kind==='tank'){body=cyl(g,0,2.7,0,b.w/2,5.4,0xbc4237);for(const y of [.5,4.5])cyl(g,0,y,0,b.w/2+.08,.35,0xe5c68c);const cap=new THREE.Mesh(new THREE.SphereGeometry(b.w/2,10,5,0,Math.PI*2,0,Math.PI/2),material(0xc45a43));cap.position.y=5.4;cap.scale.y=.35;g.add(cap);box(g,0,3,b.d/2+.03,1.2,1.5,.08,0xffd329);placard(g,'INFLAMABLE',0,8,0,'#ffc755')}
  if(b.kind==='rock'){body=new THREE.Mesh(new THREE.IcosahedronGeometry(1,0),material(0x957957));body.scale.set(b.w*.6,4,b.d*.65);body.position.y=3;body.castShadow=true;g.add(body);for(const side of [-1,1]){const stone=new THREE.Mesh(new THREE.IcosahedronGeometry(1,0),material(0x806247));stone.position.set(side*b.w*.28,1,side*b.d*.2);stone.scale.set(2,2,2);g.add(stone)}}
  if(b.kind==='reinforced'){body=box(g,0,3,0,b.w,6,b.d,0x79838a);box(g,0,6.3,0,b.w+.6,.7,b.d+.6,0xa9b0aa);for(let x=-b.w/2+.6;x<b.w/2;x+=1.3){box(g,x,1,b.d/2+.06,.7,1,.1,0xedbf42);box(g,x,4.5,b.d/2+.06,.7,.4,.1,0x25323c)}placard(g,'BLINDADO',0,8.2,0,'#ffce73')}
  if(b.kind==='gate'){const horizontal=b.d>b.w;const span=horizontal?b.d:b.w;for(const side of [-1,1])box(g,horizontal?0:side*span/2,2.2,horizontal?side*span/2:0,1,4.4,1,0x4e626e);body=box(g,0,2.2,0,horizontal?.6:span,1.1,horizontal?span:.6,0xebbf32);for(let a=-span/2;a<span/2;a+=1.5)box(g,horizontal?0:a,2.2,horizontal?a:0,horizontal?.68:.7,1.15,horizontal?.7:.68,0x24323e);placard(g,'TERMINAL →',0,5.8,0,'#67e8ff')}
  g.userData.body=body;g.userData.height=7;return g;
}

export function drawCampaignMap(ctx,game,retro=false){
  const w=180,h=216;ctx.clearRect(0,0,w,h);ctx.save();if(retro){ctx.beginPath();ctx.ellipse(90,108,87,104,0,0,Math.PI*2);ctx.clip()}
  ctx.fillStyle=retro?'#263d32bb':'#14232fe8';ctx.fillRect(0,0,w,h);const px=x=>90+x*1.2,pz=z=>108+z*1.25;
  for(const b of game.mission.hazards){ctx.fillStyle=game.mission.theme==='canyon'?'#6c4d38':'#245982';ctx.fillRect(px(b.x-b.w/2),pz(b.z-b.d/2),b.w*1.2,b.d*1.25)}
  ctx.lineWidth=5;ctx.strokeStyle='#647077';ctx.beginPath();game.route.forEach(([x,z],i)=>i?ctx.lineTo(px(x),pz(z)):ctx.moveTo(px(x),pz(z)));ctx.stroke();ctx.lineWidth=1;ctx.strokeStyle='#e5ca82';ctx.stroke();
  for(const b of game.buildings){if(b.destroyed)continue;ctx.fillStyle=b.kind==='tank'?'#f66140':b.lockedBy?'#5deaff':b.route?'#ffca4c':'#526773';ctx.fillRect(px(b.x)-3,pz(b.z)-3,6,6)}
  for(const c of game.consoles){ctx.strokeStyle=c.active?'#8cfa8b':'#52efff';ctx.lineWidth=2;ctx.strokeRect(px(c.x)-3,pz(c.z)-3,6,6)}
  for(const p of game.pickups)if(!p.taken){ctx.fillStyle='#bbf2a2';ctx.fillRect(px(p.x)-1.5,pz(p.z)-1.5,3,3)}
  ctx.fillStyle='#fb5454';ctx.fillRect(px(game.convoy.x)-3,pz(game.convoy.z)-3,6,6);ctx.save();ctx.translate(px(game.player.x),pz(game.player.z));ctx.rotate(-game.player.angle);ctx.fillStyle='#fffbd3';ctx.beginPath();ctx.moveTo(0,6);ctx.lineTo(-4,-4);ctx.lineTo(4,-4);ctx.fill();ctx.restore();ctx.restore();
}
