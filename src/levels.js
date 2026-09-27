// Hand-authored campaign maps. Coordinates are shared by simulation and rendering.
const obstacle=(x,z,w,d,hp=100,kind='warehouse',extra={})=>({x,z,w,d,h:kind==='tank'?6:kind==='rock'?8:7,hp,kind,route:true,...extra});
const scenery=(x,z,w,d,h=10,kind='warehouse')=>({x,z,w,d,h,hp:100,kind,route:false});
export const CAMPAIGN=[
  {
    name:'Muelles de contrabando',short:'MUELLES',subtitle:'TÁCTICA',seed:104,speed:2.1,theme:'harbor',
    description:'Cruza el canal y abre la compuerta desde su terminal. El convoy serpentea entre almacenes y grúas: adelántate por los patios laterales.',
    hint:'La compuerta necesita el terminal azul. Acércate y pulsa E.',
    path:[[-42,64],[-42,28],[26,28],[26,-12],[-22,-12],[-22,-70]],
    spawn:{x:-42,z:51,angle:Math.PI},bounds:{x:62,z:76},
    structures:[obstacle(-42,39,9,6,100),obstacle(-27,28,6,10,125),obstacle(7,28,4,11,100,'gate',{lockedBy:'dock'}),obstacle(26,9,10,6,140),obstacle(11,-12,7,10,110),obstacle(-22,-28,9,7,150),obstacle(-22,-52,10,7,125),scenery(-55,15,8,12),scenery(43,14,11,16),scenery(-47,-7,14,10),scenery(-45,-43,13,15),scenery(-3,-42,12,13),scenery(45,49,9,9)],
    consoles:[{id:'dock',x:-23,z:42,name:'COMPUERTA DEL CANAL'}],
    pickups:[[-51,27],[38,0],[-9,-24],[-36,-56]],
    hazards:[{x:-7,z:28,w:17,d:44},{x:36,z:-53,w:47,d:46}],
    bridges:[{x:-7,z:28,w:21,d:12}],
    props:[{type:'crane',x:46,z:-34},{type:'crane',x:11,z:53},{type:'containers',x:48,z:-8},{type:'containers',x:-51,z:53},{type:'ship',x:35,z:-57}],
  },
  {
    name:'Reacción en cadena',short:'REFINERÍA',subtitle:'DEMOLICIÓN',seed:205,speed:2.25,theme:'refinery',
    description:'Una refinería llena de depósitos inflamables. Detona los tanques rojos para abrir varios pasos y desactiva el cierre de seguridad.',
    hint:'Los depósitos rojos explotan en cadena. Una detonación puede despejar varios edificios.',
    path:[[0,65],[0,34],[-30,34],[-30,-5],[25,-5],[25,-47],[0,-47],[0,-71]],
    spawn:{x:0,z:53,angle:Math.PI},bounds:{x:62,z:76},
    structures:[obstacle(0,42,9,7,140),obstacle(-16,34,6,9,150),obstacle(-30,13,10,7,175,'reinforced'),obstacle(-10,-5,7,10,160),obstacle(9,-5,7,10,180,'reinforced'),obstacle(25,-25,10,4,100,'gate',{lockedBy:'valve'}),obstacle(25,-39,10,7,170),obstacle(0,-58,10,7,180,'reinforced'),scenery(-10,44,4,4,6,'tank'),scenery(-24,25,4,4,6,'tank'),scenery(-23,15,4,4,6,'tank'),scenery(-2,0,4,4,6,'tank'),scenery(14,-12,4,4,6,'tank'),scenery(34,-40,4,4,6,'tank'),scenery(-8,-56,4,4,6,'tank'),scenery(-48,43,11,13),scenery(-48,4,12,16),scenery(40,34,15,12),scenery(44,-10,10,13),scenery(-30,-35,14,13)],
    consoles:[{id:'valve',x:38,z:4,name:'CIERRE DE SEGURIDAD'}],
    pickups:[[13,39],[-43,22],[-16,-20],[38,-51]],hazards:[],bridges:[],
    props:[{type:'chimneys',x:44,z:51},{type:'chimneys',x:-48,z:-43},{type:'pipes',x:-10,z:-27},{type:'pipes',x:18,z:22}],
  },
  {
    name:'Garganta del trueno',short:'CAÑÓN',subtitle:'PRECISIÓN',seed:306,speed:2.0,theme:'canyon',
    description:'Derrumbes, dos puentes y una carretera de montaña. Abre las barreras desde sus terminales y usa a Titan para triturar la roca.',
    hint:'Hay dos terminales de barrera. El cañón solo se cruza por los puentes.',
    path:[[-40,65],[-40,35],[36,35],[36,-15],[-35,-15],[-35,-54],[10,-54],[10,-72]],
    spawn:{x:-40,z:53,angle:Math.PI},bounds:{x:62,z:76},
    structures:[obstacle(-40,43,10,7,130,'rock'),obstacle(-19,35,7,10,160,'rock'),obstacle(17,35,4,11,100,'gate',{lockedBy:'north'}),obstacle(36,9,10,8,190,'rock'),obstacle(22,-15,7,10,155,'rock'),obstacle(-17,-15,4,11,100,'gate',{lockedBy:'south'}),obstacle(-35,-35,10,8,190,'rock'),obstacle(-14,-54,7,10,190,'rock'),obstacle(10,-63,9,5,145,'rock'),scenery(-50,9,7,9,5),scenery(49,-30,8,10,5),scenery(-48,-58,8,8,5)],
    consoles:[{id:'north',x:-28,z:47,name:'BARRERA DEL PUENTE NORTE'},{id:'south',x:47,z:-3,name:'BARRERA DEL PUENTE SUR'}],
    pickups:[[-51,38],[49,29],[23,-29],[-47,-39]],
    hazards:[{x:-1,z:9,w:16,d:94}],bridges:[{x:-1,z:35,w:20,d:12},{x:-1,z:-15,w:20,d:12}],
    props:[{type:'rocks',x:-54,z:57},{type:'rocks',x:51,z:49},{type:'rocks',x:49,z:-58},{type:'rocks',x:-51,z:-20}],
  },
  {
    name:'Apagón en la central',short:'CENTRAL',subtitle:'FINAL',seed:407,speed:2.45,theme:'night',
    description:'Una operación nocturna entre bloques blindados. Activa los dos terminales de la central y abre una ruta en espiral hasta la extracción.',
    hint:'Dos cierres de seguridad protegen la central. Busca las balizas azules en el mapa.',
    path:[[-43,65],[-43,25],[36,25],[36,-42],[-23,-42],[-23,-5],[5,-5],[5,-72]],
    spawn:{x:-43,z:52,angle:Math.PI},bounds:{x:62,z:76},
    structures:[obstacle(-43,41,10,8,155,'reinforced'),obstacle(-25,25,7,10,150),obstacle(-2,25,4,11,100,'gate',{lockedBy:'east'}),obstacle(23,25,7,10,175,'reinforced'),obstacle(36,4,11,7,165),obstacle(36,-24,11,8,190,'reinforced'),obstacle(15,-42,7,10,160),obstacle(-12,-42,4,11,100,'gate',{lockedBy:'core'}),obstacle(-23,-22,10,7,175,'reinforced'),obstacle(-6,-5,6,10,165),obstacle(5,-24,10,7,180,'reinforced'),obstacle(5,-57,11,8,195,'reinforced'),scenery(-31,44,4,4,6,'tank'),scenery(46,-16,4,4,6,'tank'),scenery(-15,-20,4,4,6,'tank'),scenery(-52,-18,9,15,17),scenery(51,43,12,12,20),scenery(51,-49,11,15,19),scenery(-39,-60,12,12,18),scenery(-7,49,12,13,20)],
    consoles:[{id:'east',x:-29,z:11,name:'SUBESTACIÓN ESTE'},{id:'core',x:48,z:-33,name:'NÚCLEO CENTRAL'}],
    pickups:[[-53,27],[21,42],[48,-9],[-36,-33],[18,-58]],hazards:[],bridges:[],
    props:[{type:'power',x:-8,z:9},{type:'power',x:20,z:-22},{type:'chimneys',x:-45,z:-40}],
  },
].map(m=>({...m,obstacles:m.structures.filter(b=>b.route).length,health:100}));

export function pathLength(points){return points.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p[0]-points[i][0],p[1]-points[i][1]),0)}
export function samplePath(points,distance){
  let remaining=Math.max(0,distance);
  for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]);if(remaining<=length||i===points.length-1){const t=Math.min(1,remaining/length);return{x:a[0]+(b[0]-a[0])*t,z:a[1]+(b[1]-a[1])*t,angle:Math.atan2(b[0]-a[0],b[1]-a[1])}}remaining-=length}
}
export function routeDistance(points,x,z){let best=Infinity;for(let i=1;i<points.length;i++){const [ax,az]=points[i-1],[bx,bz]=points[i],dx=bx-ax,dz=bz-az;const t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz)));best=Math.min(best,Math.hypot(x-ax-t*dx,z-az-t*dz))}return best}
