import {CAMPAIGN,pathLength,samplePath} from './levels.js';
export const MISSIONS = [
  {name:'Distrito cero',subtitle:'INICIACIÓN',description:'Abre un corredor por el distrito industrial. Cinco obstáculos, una carga inestable y ninguna segunda oportunidad.',speed:2.5,health:100,obstacles:5,seed:17},
  {name:'Puerto de acero',subtitle:'INTERMEDIO',description:'Los almacenes del puerto bloquean el paso. Cambia de vehículo y utiliza a Titan para derribar las estructuras más resistentes.',speed:2.9,health:100,obstacles:7,seed:38},
  {name:'Punto de ruptura',subtitle:'EXPERTO',description:'El convoy acelera hacia el corazón de la ciudad. Nueve barricadas de hormigón. Haz que cada embestida cuente.',speed:3.2,health:100,obstacles:9,seed:61},
  ...CAMPAIGN,
];
export const VEHICLES = [
  {name:'DOZER',ability:'EMBESTIDA',speed:18,accel:28,turn:2.5,damage:37,radius:8,cost:27,color:0xffaf38},
  {name:'DRIFTER',ability:'DERRAPE EXPLOSIVO',speed:27,accel:24,turn:3.6,damage:25,radius:11,cost:24,color:0x76c8c3},
  {name:'TITAN',ability:'ONDA SÍSMICA',speed:13,accel:23,turn:2.7,damage:72,radius:15,cost:43,color:0xd6dfba},
];
export function random(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
export function makeLevel(index){
  const mission=MISSIONS[index],rng=random(mission.seed),buildings=[];
  if(mission.structures)return mission.structures.map((b,id)=>({...b,id,hp:b.kind==='tank'?45:b.hp,maxHp:b.kind==='tank'?45:b.hp,destroyed:false}));
  for(let i=0;i<mission.obstacles;i++){const z=30-i*(79/(mission.obstacles-1));buildings.push({id:buildings.length,x:(rng()-.5)*2,z,w:7+rng()*3,d:5+rng()*2,h:5+rng()*7,hp:72+index*23,maxHp:72+index*23,route:true,destroyed:false})}
  for(let side of [-1,1])for(let row=0;row<9;row++)for(let col=0;col<2;col++){if(rng()<.16)continue;const hp=50+rng()*60;buildings.push({id:buildings.length,x:side*(17+col*15)+(rng()-.5)*3,z:49-row*12+(rng()-.5)*3,w:6+rng()*6,d:6+rng()*4,h:5+rng()*19,hp,maxHp:hp,route:false,destroyed:false})}
  return buildings;
}
export function circleBox(x,z,r,b){return Math.hypot(x-Math.max(b.x-b.w/2,Math.min(x,b.x+b.w/2)),z-Math.max(b.z-b.d/2,Math.min(z,b.z+b.d/2)))<r}
export class Game {
  constructor(index=0){this.reset(index)}
  reset(index){this.index=index;this.mission=MISSIONS[index];this.buildings=makeLevel(index);this.player={x:0,z:43,angle:Math.PI,...this.mission.spawn,speed:0,energy:100,vehicle:0};this.route=this.mission.path||[[0,58],[0,-61]];this.routeLength=pathLength(this.route);this.convoy={...samplePath(this.route,0),distance:0,hp:100,blocked:false};this.state='ready';this.time=0;this.score=0;this.combo=0;this.comboTime=0;this.cooldown=0;this.events=[];this.cleared=0;this.rescued=0;this.consoles=(this.mission.consoles||[]).map(c=>({...c,active:false}));this.pickups=(this.mission.pickups||[[-11,21],[12,-10],[-13,-38]]).map(([x,z])=>({x,z,taken:false}));}
  start(){this.state='playing'}
  setVehicle(index){if(index<0||index>2)return;this.player.vehicle=index;this.player.speed*=.5;this.events.push({type:'switch',index})}
  hit(b,amount){if(b.destroyed||b.lockedBy&&!this.consoles.find(c=>c.id===b.lockedBy)?.active)return;b.hp=Math.max(0,b.hp-amount);this.events.push({type:'hit',id:b.id,amount});if(b.hp===0){b.destroyed=true;this.combo=this.comboTime>0?this.combo+1:1;this.comboTime=5;this.score+=(b.route?500:150)*Math.min(this.combo,5);if(b.route)this.cleared++;this.events.push({type:'destroy',id:b.id,combo:this.combo});if(b.kind==='tank'){this.events.push({type:'chain',x:b.x,z:b.z});for(const other of this.buildings)if(other!==b&&!other.destroyed&&circleBox(b.x,b.z,15,other))this.hit(other,160)}}}
  ability(){const p=this.player,v=VEHICLES[p.vehicle];if(this.state!=='playing'||p.energy<v.cost||this.cooldown>0)return false;p.energy-=v.cost;this.cooldown=.65;this.events.push({type:'ability',x:p.x,z:p.z,radius:v.radius});for(const b of this.buildings)if(!b.destroyed&&circleBox(p.x,p.z,v.radius,b))this.hit(b,v.damage*(b.kind==='reinforced'?(p.vehicle===2?1.3:.7):1));return true}
  interact(){if(this.state!=='playing')return false;const terminal=this.consoles.find(c=>!c.active&&Math.hypot(this.player.x-c.x,this.player.z-c.z)<6);if(!terminal)return false;terminal.active=true;this.events.push({type:'console',id:terminal.id,name:terminal.name});for(const b of this.buildings)if(b.lockedBy===terminal.id)this.hit(b,10000);this.score+=750;this.player.energy=100;return true}
  canDrive(x,z){const inRect=(b)=>Math.abs(x-b.x)<b.w/2&&Math.abs(z-b.z)<b.d/2;return !(this.mission.hazards||[]).some(inRect)||(this.mission.bridges||[]).some(b=>inRect({...b,w:b.w-2,d:b.d-2}))}
  update(dt,input={}){
    if(this.state!=='playing')return;dt=Math.min(dt,.05);this.time+=dt;this.cooldown=Math.max(0,this.cooldown-dt);this.comboTime-=dt;if(this.comboTime<=0)this.combo=0;
    const p=this.player,v=VEHICLES[p.vehicle];p.energy=Math.min(100,p.energy+12*dt);
    const throttle=(input.forward?1:0)-(input.back?1:0);const turbo=input.boost&&p.energy>2&&throttle>0;if(turbo)p.energy=Math.max(0,p.energy-24*dt);
    let target=throttle*v.speed*(turbo?1.6:1)*(throttle<0?.55:1);p.speed+=Math.max(-v.accel*dt,Math.min(v.accel*dt,target-p.speed));
    p.angle+=((input.left?1:0)-(input.right?1:0))*v.turn*dt*(p.speed<-.5?-1:1);
    const oldX=p.x,oldZ=p.z,bounds=this.mission.bounds||{x:44,z:61};p.x=Math.max(-bounds.x,Math.min(bounds.x,p.x+Math.sin(p.angle)*p.speed*dt));p.z=Math.max(this.mission.path?-bounds.z:-59,Math.min(bounds.z,p.z+Math.cos(p.angle)*p.speed*dt));
    if(!this.canDrive(p.x,p.z)){p.x=oldX;p.z=oldZ;p.speed=0}
    for(const b of this.buildings){if(b.destroyed||!circleBox(p.x,p.z,2.1,b))continue;if(Math.abs(p.speed)>4){this.hit(b,(Math.abs(p.speed)*2+v.damage*.3)*dt*3);if(Math.random()<dt*8)this.events.push({type:'ram',x:p.x,z:p.z})}if(!b.destroyed){p.x=oldX;p.z=oldZ;p.speed*=.92}}
    for(const item of this.pickups)if(!item.taken&&Math.hypot(p.x-item.x,p.z-item.z)<4){item.taken=true;this.rescued++;p.energy=100;this.score+=350;this.events.push({type:'pickup',x:item.x,z:item.z})}
    if(input.ability)this.ability();
    if(input.interact)this.interact();
    const c=this.convoy;
    if(this.mission.path){const nose=samplePath(this.route,c.distance+4);c.blocked=this.buildings.some(b=>!b.destroyed&&b.route&&circleBox(nose.x,nose.z,1.8,b));if(!c.blocked){c.distance=Math.min(this.routeLength,c.distance+this.mission.speed*dt);Object.assign(c,samplePath(this.route,c.distance))}}
    else{c.blocked=this.buildings.some(b=>!b.destroyed&&b.route&&c.z-4<b.z+b.d/2&&c.z>b.z-b.d/2);if(!c.blocked)c.z-=this.mission.speed*dt;c.distance=58-c.z}
    if(c.blocked)c.hp=Math.max(0,c.hp-(this.mission.path?9:13)*dt);
    if(c.hp===0){this.state='lost';this.events.push({type:'lost'})}else if(this.mission.path?c.distance>=this.routeLength:c.z<-60){this.state='won';this.score+=Math.round(c.hp*25)+this.rescued*500;this.events.push({type:'won'})}
  }
  drainEvents(){return this.events.splice(0)}
}
