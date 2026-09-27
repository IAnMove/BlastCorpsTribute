import * as THREE from 'three';
import {random} from './game.js';

// Original procedural artwork: tiny repeating textures and simple silhouettes.
// Shared resources survive mission changes and are reused by every retro scene.
export function createRetroKit(){
  const textures=new Map(),materials=new Map(),cube=new THREE.BoxGeometry(1,1,1);
  function texture(kind){
    if(textures.has(kind))return textures.get(kind);
    const c=document.createElement('canvas');c.width=c.height=128;
    const ctx=c.getContext('2d'),rng=random(927+kind.length*97);
    const palette={grass:[80,94,43],dirt:[139,113,72],asphalt:[83,82,71],brick:[157,91,60],concrete:[158,158,137],roof:[137,56,37],metal:[118,132,134],wood:[109,81,43]};
    const base=palette[kind]||palette.concrete;
    const data=ctx.createImageData(128,128);
    for(let y=0;y<128;y++)for(let x=0;x<128;x++){
      const noise=(rng()-.5)*45+Math.sin(x*.16)*Math.cos(y*.13)*14;
      const i=(y*128+x)*4;for(let ch=0;ch<3;ch++)data.data[i+ch]=Math.max(0,Math.min(255,base[ch]+noise));data.data[i+3]=255;
    }
    ctx.putImageData(data,0,0);
    if(kind==='grass'){for(let i=0;i<180;i++){ctx.fillStyle=rng()>.5?'#afa17630':'#24411e38';ctx.fillRect(rng()*128,rng()*128,3+rng()*10,2+rng()*8)}}
    if(kind==='brick'){ctx.strokeStyle='#443b2c99';ctx.lineWidth=2;for(let y=0;y<=128;y+=16){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(128,y);ctx.stroke();for(let x=(y/16%2)*16;x<128;x+=32){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+16);ctx.stroke()}}}
    if(['metal','roof','wood'].includes(kind)){for(let x=0;x<128;x+=8){ctx.fillStyle='#ffffff28';ctx.fillRect(x,0,2,128);ctx.fillStyle='#00000038';ctx.fillRect(x+3,0,2,128)}}
    if(kind==='asphalt'){ctx.fillStyle='#11111125';ctx.fillRect(28,0,8,128);ctx.fillRect(91,0,8,128)}
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;textures.set(kind,t);return t;
  }
  function material(kind,color=0xffffff,rx=1,ry=1){const key=`${kind}/${color}/${rx}/${ry}`;if(!materials.has(key)){const map=texture(kind).clone();map.repeat.set(rx,ry);map.needsUpdate=true;const m=new THREE.MeshLambertMaterial({map,color,flatShading:true});m.userData.persistent=true;materials.set(key,m)}return materials.get(key)}
  function solid(color){const key=`solid${color}`;if(!materials.has(key)){const m=new THREE.MeshLambertMaterial({color,flatShading:true});m.userData.persistent=true;materials.set(key,m)}return materials.get(key)}
  function block(parent,x,y,z,w,h,d,m){const obj=new THREE.Mesh(cube,m);obj.position.set(x,y,z);obj.scale.set(w,h,d);obj.castShadow=true;obj.receiveShadow=true;obj.userData.sharedGeometry=true;parent.add(obj);return obj}
  function ground(parent,x,z,w,d,kind,y=.02){const g=new THREE.Mesh(new THREE.PlaneGeometry(w,d),material(kind,0xffffff,w/8,d/8));g.rotation.x=-Math.PI/2;g.position.set(x,y,z);g.receiveShadow=true;parent.add(g);return g}
  function building(b,rng){
    const g=new THREE.Group();g.position.set(b.x,0,b.z);const kind=b.id%4;
    const h=b.route?3.8+(b.id%3)*1.0:Math.min(9,b.h*.43);
    const wall=material(kind===1?'metal':kind===2?'concrete':'brick',kind===2?0xd9debc:0xffffff,2,1.2);
    block(g,0,.18,0,b.w+.55,.36,b.d+.55,material('concrete'));
    const body=block(g,0,h/2,0,b.w,h,b.d,wall);
    if(kind!==2){
      const rise=1.5,width=b.w+.55,depth=b.d+.65;
      const shape=new THREE.Shape();shape.moveTo(-width/2,0);shape.lineTo(0,rise);shape.lineTo(width/2,0);shape.closePath();
      const geometry=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,steps:1});
      const roof=new THREE.Mesh(geometry,material(kind===1?'metal':'roof',0xffffff,1,1));roof.position.set(0,h,-depth/2);roof.castShadow=true;g.add(roof);
    }else{block(g,0,h+.18,0,b.w+.4,.4,b.d+.4,material('concrete',0x777b79));block(g,b.w*.2,h+.65,-b.d*.15,2,.8,2,material('metal'))}
    for(let x=-b.w/2+1.1;x<b.w/2-.5;x+=2.5){for(const z of [-b.d/2-.015,b.d/2+.015]){block(g,x,h*.64,z,1.2,1.15,.04,solid(0x353c3b));block(g,x,h*.64,z*1.002,.09,1.15,.05,solid(0xc6bc91));block(g,x,h*.64,z*1.002,1.2,.08,.05,solid(0xc6bc91))}}
    block(g,0,1.15,b.d/2+.045,kind===1?3.5:1.6,2.3,.06,material(kind===1?'metal':'wood'));
    if(b.route){for(const x of [-b.w/2-.7,b.w/2+.7]){block(g,x,.6,b.d/2+.8,.25,1.2,.25,solid(0xf4d334));block(g,x,.7,b.d/2+.81,.28,.22,.28,solid(0x302922))}}
    g.userData.body=body;g.userData.height=h+1.5;return g;
  }
  function terrain(parent,game,rng){
    ground(parent,0,0,700,700,'grass',-.07);
    ground(parent,0,0,13,145,'dirt',.04);
    ground(parent,0,0,7.8,145,'asphalt',.05);
    for(const z of [-55,-28,4,36,57])ground(parent,0,z,110,7,'dirt',.07);
    for(const x of [-28,29])ground(parent,x,0,5,141,'dirt',.08);
    for(const b of game.buildings)ground(parent,b.x,b.z,b.w+4,b.d+4,'dirt',.09);
    for(let z=-66;z<68;z+=6){for(const side of [-1,1]){block(parent,side*5.4,.43,z,.17,.85,.17,solid(0x666050));block(parent,side*5.4,.87,z,.38,.25,.38,solid(0xffc526))}}
    // Discrete railway crossing, fences and low hills replace the modern diorama.
    for(let x=-65;x<66;x+=2.4)block(parent,x,.1,-57,.55,.2,5,material('wood'));
    for(const z of [-58.6,-55.4])block(parent,0,.24,z,135,.18,.16,solid(0x484b4b));
    for(const x of [-48,48]){for(let z=-60;z<65;z+=5){block(parent,x,.85,z,.24,1.7,.24,material('wood'));for(const y of [.5,1.2])block(parent,x,y,z+2.5,.15,.17,5,material('wood'))}}
    for(let i=0;i<22;i++){const x=(rng()<.5?-1:1)*(65+rng()*70),z=-100+rng()*210;const hill=new THREE.Mesh(new THREE.ConeGeometry(14+rng()*15,5+rng()*15,5),material('grass',0xa4af7b,3,2));hill.position.set(x,1,z);hill.rotation.y=rng()*6;hill.receiveShadow=true;parent.add(hill)}
    for(let i=0;i<90;i++){const x=(rng()-.5)*115,z=(rng()-.5)*140;if(Math.abs(x)<10||game.buildings.some(b=>Math.abs(b.x-x)<b.w/2+3&&Math.abs(b.z-z)<b.d/2+3))continue;const tree=new THREE.Group();tree.position.set(x,0,z);block(tree,0,1.2,0,.38,2.4,.38,solid(0x69512d));for(let tier=0;tier<3;tier++){const leaves=new THREE.Mesh(new THREE.ConeGeometry(2.7-tier*.6,3,5),material('grass',[0x396230,0x456e39,0x5b8145][tier],1,1));leaves.position.y=2.1+tier*1.25;leaves.rotation.y=tier*.7;leaves.castShadow=true;tree.add(leaves)}parent.add(tree)}
  }
  function convoy(){const g=new THREE.Group();
    block(g,0,.9,0,3.1,.65,10,solid(0x29282a));block(g,0,2,-3.6,3.35,2.3,2.8,solid(0xc72d28));block(g,0,2.5,-5.02,2.75,.7,.04,solid(0x263345));block(g,0,3.24,-3.6,3.5,.18,2.9,solid(0xe75445));block(g,0,.98,-5.1,3.5,.5,.25,material('metal'));block(g,0,1.5,1.3,3.6,.45,6.6,solid(0xbc2425));
    for(const x of [-.85,.85]){const rocket=new THREE.Mesh(new THREE.CylinderGeometry(.68,.68,6.2,8),solid(0xc72c35));rocket.rotation.x=Math.PI/2;rocket.position.set(x,2.5,1.1);rocket.castShadow=true;g.add(rocket);const nose=new THREE.Mesh(new THREE.ConeGeometry(.69,1.2,8),solid(0xefb7b5));nose.rotation.x=-Math.PI/2;nose.position.set(x,2.5,-2.6);g.add(nose);block(g,x,2.5,4.1,1.8,.12,1.2,solid(0xe1e4d6));block(g,x,2.5,4.1,.12,1.8,1.2,solid(0xe1e4d6));}
    for(const x of [-1.7,1.7])for(const z of [-3.7,.5,2.3,4.1]){const tire=new THREE.Mesh(new THREE.CylinderGeometry(.83,.83,.5,8),solid(0x222123));tire.rotation.z=Math.PI/2;tire.position.set(x,.8,z);g.add(tire);const hub=new THREE.Mesh(new THREE.CylinderGeometry(.45,.45,.53,8),solid(0xc56259));hub.rotation.z=Math.PI/2;hub.position.copy(tire.position);g.add(hub)}
    for(const x of [-1.1,1.1])block(g,x,1.7,-5.05,.45,.35,.08,solid(0xffeaad));block(g,0,3.5,-3.6,.45,.4,.45,solid(0xffae00));return g;
  }
  function vehicle(g,type){
    g.traverse(obj=>{if(!obj.isMesh)return;if(obj.geometry.type==='RingGeometry'){obj.visible=false;return}const color=obj.material.color.clone();if(type===0&&color.r>.65&&color.g>.3){color.setHex(0xffc51b)}else if(type===1&&color.g>color.r*1.05){color.setHex(0xa4a8b0)}else if(type===2&&color.r>.5){color.setHex(0xf7c229)}obj.material=solid(color.getHex())});
    if(type===0){block(g,0,1.05,2.92,4.95,1.25,.14,material('metal'));block(g,0,2.47,.4,1.5,.85,.04,solid(0x121a24))}
    if(type===1){block(g,0,1.65,-1,2.7,.28,2.8,material('metal'));for(const x of [-1.35,1.35])block(g,x,2.12,-1,.16,1.0,2.9,material('metal'))}
    return g;
  }
  function radar(ctx,game){const w=180,h=216;ctx.clearRect(0,0,w,h);ctx.save();ctx.translate(90,108);ctx.scale(1,1.2);ctx.beginPath();ctx.arc(0,0,84,0,Math.PI*2);ctx.clip();ctx.fillStyle='#6b792975';ctx.fillRect(-90,-90,180,180);ctx.fillStyle='#bbca8338';ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,84,-1.85,-1.35);ctx.fill();const point=(x,z)=>[(x-game.player.x)*1.12,(z-game.player.z)*1.12];for(const b of game.buildings){if(!b.route||b.destroyed)continue;const [x,y]=point(b.x,b.z);ctx.fillStyle='#f7cf45';ctx.fillRect(x-2,y-2,4,4)}const [cx,cy]=point(0,game.convoy.z);ctx.fillStyle='#ec202e';ctx.fillRect(cx-4,cy-4,8,8);ctx.rotate(-game.player.angle);ctx.fillStyle='#ffffb7';ctx.beginPath();ctx.moveTo(0,10);ctx.lineTo(-4,-4);ctx.lineTo(4,-4);ctx.fill();ctx.restore()}
  const particles=[],tracks=[];let lastTrack=0;
  function puffTexture(fire){const c=document.createElement('canvas');c.width=c.height=32;const ctx=c.getContext('2d');const gradient=ctx.createRadialGradient(16,16,1,16,16,16);if(fire){gradient.addColorStop(0,'#fffcc4');gradient.addColorStop(.24,'#ffdc40');gradient.addColorStop(.52,'#ff6a04');gradient.addColorStop(.78,'#bf2309aa');gradient.addColorStop(1,'#6b180000')}else{gradient.addColorStop(0,'#c5c2b6df');gradient.addColorStop(.45,'#9c9990bc');gradient.addColorStop(1,'#736f6600')}ctx.fillStyle=gradient;ctx.fillRect(0,0,32,32);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
  const fireTexture=puffTexture(true),smokeTexture=puffTexture(false);
  function puff(parent,x,y,z,size,fire=false){const m=new THREE.SpriteMaterial({map:fire?fireTexture:smokeTexture,transparent:true,depthWrite:false,rotation:Math.random()*6});m.userData.persistent=true;const sprite=new THREE.Sprite(m);sprite.position.set(x,y,z);sprite.scale.setScalar(size);parent.add(sprite);particles.push({sprite,life:fire?.6:1.5,total:fire?.6:1.5,size,fire,dx:(Math.random()-.5)*2,dz:(Math.random()-.5)*2});}
  function explosion(parent,x,z,size=6){for(let i=0;i<12;i++)puff(parent,x+(Math.random()-.5)*size,1+Math.random()*3,z+(Math.random()-.5)*size,size*(.7+Math.random()*.6),i<7)}
  function update(dt,parent,player,moving){
    for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life-=dt;const age=1-p.life/p.total;p.sprite.position.y+=dt*(p.fire?2:4);p.sprite.position.x+=p.dx*dt;p.sprite.position.z+=p.dz*dt;p.sprite.material.opacity=Math.max(0,1-age);p.sprite.scale.setScalar(p.size*(1+age*(p.fire?.5:1.6)));if(p.life<=0){p.sprite.removeFromParent();p.sprite.material.dispose();particles.splice(i,1)}}
    lastTrack+=dt;if(moving&&Math.abs(player.speed)>2&&lastTrack>.09){lastTrack=0;const s=Math.sin(player.angle),c=Math.cos(player.angle);for(const side of [-1,1]){const track=block(parent,player.x+side*1.4*c,.11,player.z-side*1.4*s,.65,.015,1.4,solid(0x504638));track.rotation.y=player.angle;track.castShadow=false;tracks.push(track)}if(Math.random()<.6)puff(parent,player.x-s*2,.6,player.z-c*2,1.3);while(tracks.length>180)tracks.shift().removeFromParent()}
  }
  function clearEffects(){for(const p of particles){p.sprite.removeFromParent();p.sprite.material.dispose()}particles.length=0;tracks.length=0;lastTrack=0}
  return {building,terrain,convoy,vehicle,radar,explosion,update,clearEffects,ground};
}
