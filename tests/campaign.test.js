import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,MISSIONS,circleBox} from '../src/game.js';
import {pathLength,samplePath} from '../src/levels.js';

export const routes=[
 [[-42,28],[-23,42],[-23,28],[26,28],[26,-12],[-22,-12],[-22,-70]],
 [[0,34],[-30,34],[-30,-5],[25,-5],[38,4],[25,-5],[25,-47],[0,-47],[0,-71]],
 [[-40,35],[-28,47],[-28,35],[36,35],[36,-3],[47,-3],[36,-3],[36,-15],[-35,-15],[-35,-54],[10,-54],[10,-72]],
 [[-43,25],[-29,11],[-43,25],[36,25],[36,-33],[48,-33],[36,-33],[36,-42],[-23,-42],[-23,-5],[5,-5],[5,-72]],
];
export function driveCampaign(index){const game=new Game(index);game.start();game.setVehicle(2);const plan=routes[index-3];let waypoint=0;for(let frame=0;frame<60*220&&game.state==='playing';frame++){
 const p=game.player,target=plan[Math.min(waypoint,plan.length-1)],distance=Math.hypot(target[0]-p.x,target[1]-p.z);
 if(distance<3.4&&waypoint<plan.length-1)waypoint++;
 const desired=Math.atan2(target[0]-p.x,target[1]-p.z),turn=Math.atan2(Math.sin(desired-p.angle),Math.cos(desired-p.angle));
 const inRange=game.buildings.some(b=>!b.destroyed&&!b.lockedBy&&circleBox(p.x,p.z,14,b));
 game.update(1/60,{forward:distance>2&&Math.abs(turn)<.65,left:turn>.04,right:turn<-.04,ability:inRange,interact:true});game.drainEvents();
 }return {game,waypoint};}

test('path sampling follows corners and clamps at extraction',()=>{const path=[[0,10],[0,0],[20,0]];assert.equal(pathLength(path),30);assert.deepEqual(samplePath(path,15),{x:5,z:0,angle:Math.PI/2});assert.equal(samplePath(path,999).x,20)});
test('gates resist demolition and only open from their nearby terminal',()=>{const g=new Game(3);g.start();const gate=g.buildings.find(b=>b.lockedBy),c=g.consoles[0];g.hit(gate,99999);assert.equal(gate.destroyed,false);assert.equal(g.interact(),false);Object.assign(g.player,{x:c.x,z:c.z});assert.equal(g.interact(),true);assert.equal(gate.destroyed,true);const score=g.score;assert.equal(g.interact(),false);assert.equal(g.score,score)});
test('fuel explosions damage surrounding structures only once',()=>{const g=new Game(4);g.start();const tank=g.buildings.find(b=>b.kind==='tank');const neighbor=g.buildings.find(b=>b.route&&circleBox(tank.x,tank.z,15,b));assert.ok(neighbor);g.hit(tank,999);assert.ok(neighbor.hp<neighbor.maxHp);assert.equal(g.drainEvents().filter(e=>e.type==='chain'&&e.x===tank.x&&e.z===tank.z).length,1)});
test('canals and ravines are impassable except over bridge decks',()=>{const g=new Game(5);assert.equal(g.canDrive(-1,9),false);assert.equal(g.canDrive(-1,35),true);assert.equal(g.canDrive(-1,-15),true);assert.equal(g.canDrive(-40,9),true)});
test('convoy detects gates after turning and continues horizontally once opened',()=>{const g=new Game(3);g.start();g.convoy.distance=80;Object.assign(g.convoy,samplePath(g.route,80));g.update(.05);assert.equal(g.convoy.blocked,true);assert.ok(g.convoy.hp<100);const x=g.convoy.x;Object.assign(g.player,{x:g.consoles[0].x,z:g.consoles[0].z});g.interact();g.update(.05);assert.equal(g.convoy.blocked,false);assert.ok(g.convoy.x>x);assert.equal(g.convoy.angle,Math.PI/2)});
test('all authored missions can be won by steering, demolishing and activating terminals',()=>{for(let index=3;index<MISSIONS.length;index++){const {game:g,waypoint}=driveCampaign(index);assert.equal(g.state,'won',`${g.mission.name}: ${g.state}, waypoint ${waypoint}, player ${g.player.x.toFixed(1)},${g.player.z.toFixed(1)}, cleared ${g.cleared}, convoy ${g.convoy.distance.toFixed(1)}, hp ${g.convoy.hp}`);assert.equal(g.cleared,g.mission.obstacles);assert.ok(g.consoles.every(c=>c.active))}});
