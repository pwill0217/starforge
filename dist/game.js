export const PARTS = {
  nose: [
    {id:'ogive', name:'Atlas ogive', tag:'BALANCED', note:'A streamlined, heat-resistant flight capsule.', mass:90, drag:.23, heat:1350},
    {id:'needle', name:'Needle point', tag:'LOW DRAG', note:'Cuts through the air. Extra thermal protection.', mass:125, drag:.15, heat:2300},
    {id:'bubble', name:'Observation dome', tag:'EXPERIMENTAL', note:'A beautiful view, but glass dislikes high heat.', mass:65, drag:.52, heat:680}
  ],
  hull: [
    {id:'alloy', name:'Aerospace alloy', tag:'BALANCED', note:'A dependable balance of weight and strength.', mass:260, heat:1250, strength:1},
    {id:'titanium', name:'Titanium shell', tag:'REINFORCED', note:'Heavy armor for hot, high-powered launches.', mass:410, heat:2300, strength:1.3},
    {id:'scrap', name:'Salvaged shell', tag:'LIGHTWEIGHT', note:'Light and thrifty. Weak under pressure.', mass:175, heat:620, strength:.65}
  ],
  fins: [
    {id:'swept', name:'Swept wings', tag:'STABLE', note:'Four fins keep your rocket pointed skyward.', mass:65, stability:94, drag:.08},
    {id:'grid', name:'Grid fins', tag:'CONTROL', note:'Excellent wind control with a little extra drag.', mass:95, stability:99, drag:.13},
    {id:'stub', name:'Micro fins', tag:'LIGHTWEIGHT', note:'Less weight, less control in crosswinds.', mass:25, stability:57, drag:.035},
    {id:'none', name:'No fins', tag:'UNSTABLE', note:'Minimal drag. Maximum chance of a bad idea.', mass:0, stability:21, drag:0}
  ],
  engine: [
    {id:'kestrel', name:'Kestrel K-1', tag:'KEROLOX', note:'Reliable chemical engine. Requires kerolox.', mass:150, thrust:52000, flow:13, fuel:'kerolox'},
    {id:'titan', name:'Titan M-9', tag:'METHALOX', note:'High thrust. Requires methalox and strong parts.', mass:240, thrust:76000, flow:19, fuel:'methalox'},
    {id:'steam', name:'Brass boiler', tag:'STEAM', note:'A steam-powered classic. Requires steam cells.', mass:180, thrust:36000, flow:14, fuel:'steam'},
    {id:'ion', name:'Ghost ion drive', tag:'XENON', note:'Efficient in space, too weak to lift off Earth.', mass:85, thrust:3200, flow:1.5, fuel:'xenon'}
  ],
  fuel: [
    {id:'kerolox', name:'Kerolox tank', tag:'K-1 COMPATIBLE', note:'Liquid oxygen and kerosene for the Kestrel.', mass:80, capacity:950},
    {id:'methalox', name:'Methalox tank', tag:'M-9 COMPATIBLE', note:'Liquid methane and oxygen for the Titan.', mass:95, capacity:1100},
    {id:'steam', name:'Steam cells', tag:'BOILER COMPATIBLE', note:'Pressurized water for the Brass boiler.', mass:100, capacity:800},
    {id:'xenon', name:'Xenon vessel', tag:'ION COMPATIBLE', note:'Ion-drive propellant. Never mix with combustion engines.', mass:60, capacity:300}
  ],
  recovery: [
    {id:'chute', name:'Recovery chute', tag:'SAFE LANDING', note:'Automatically opens below 4 km on descent.', mass:55, landing:7},
    {id:'legs', name:'Landing struts', tag:'IMPACT RISK', note:'Struts absorb small bumps, not a free fall.', mass:85, landing:16},
    {id:'none', name:'No recovery', tag:'ONE WAY', note:'Save weight. Your rocket will not survive impact.', mass:0, landing:10}
  ]
};
export const THEMES = { retro:{name:'Retro future',color:'#ff7048',body:'#e8e4da',dark:'#3d4b55',glow:'#91efff'}, cyber:{name:'Cyberpunk',color:'#b68aff',body:'#293046',dark:'#121622',glow:'#76ffe7'}, steam:{name:'Steampunk',color:'#d3a15c',body:'#a97442',dark:'#3a2926',glow:'#ffe3a4'} };
export const DEFAULT = {name:'Pioneer 01',theme:'retro',paint:'#ff7048',nose:'ogive',hull:'alloy',fins:'swept',engine:'kestrel',fuel:'kerolox',recovery:'chute',load:100};
export const WEATHER = [{name:'Clear skies',wind:8,description:'Light crosswind · ideal for a first flight'},{name:'Crosswind',wind:24,description:'Strong crosswind · stable fins recommended'},{name:'Gust front',wind:39,description:'Heavy gusts · grid fins recommended'}];
export function partsFor(build){return Object.fromEntries(Object.keys(PARTS).map(k=>[k,PARTS[k].find(p=>p.id===build[k])||PARTS[k][0]]));}
export function statsFor(build, weather=WEATHER[0]){
 const p=partsFor(build); const dryMass=Object.values(p).reduce((s,x)=>s+x.mass,0);const fuelMass=p.fuel.capacity*build.load/100;const mass=dryMass+fuelMass;const twr=p.engine.thrust/(mass*9.81);const stability=Math.max(0,p.fins.stability-weather.wind*.65+(p.nose.id==='needle'?4:0));const heat=Math.min(p.nose.heat,p.hull.heat);const compatible=p.fuel.id===p.engine.fuel;
 const issues=[];
 if(!compatible)issues.push({level:'danger',title:'Propellant mismatch',text:`${p.engine.name} needs ${p.engine.fuel}. Change the tank before ignition.`});
 if(twr<1.15)issues.push({level:'danger',title:'Not enough lift',text:'Thrust cannot safely lift this mass. Fit a stronger engine.'});
 if(stability<65)issues.push({level:'danger',title:'Unstable in this wind',text:'Fit swept or grid fins, or wait for lighter winds.'});
 if(heat<900)issues.push({level:'danger',title:'Low heat tolerance',text:'The dome or salvaged shell may fail during ascent. Use a stronger nose and hull.'});
 if(p.recovery.id!=='chute')issues.push({level:'warn',title:'Hard landing expected',text:'Struts alone cannot slow a free fall. Fit a recovery chute.'});
 if(build.load<65)issues.push({level:'warn',title:'Limited flight range',text:'A low fuel load may run out before you reach 100 km.'});
 return {p,dryMass,fuelMass,mass,twr,stability,heat,compatible,issues,drag:p.nose.drag+p.fins.drag+.12};
}
export function randomBuild(rng=Math.random){
 const theme=Object.keys(THEMES)[Math.floor(rng()*3)]; const build={...DEFAULT,theme,paint:THEMES[theme].color,name:['Nomad','Vanguard','Firefly','Oddity','Stardust','Voyager'][Math.floor(rng()*6)]+' '+String(Math.floor(rng()*99)+1).padStart(2,'0')};
 for(const k of Object.keys(PARTS))build[k]=PARTS[k][Math.floor(rng()*PARTS[k].length)].id;
 if(rng()<.72)build.fuel=partsFor(build).engine.fuel;
 build.load=[55,75,100][Math.floor(rng()*3)];return build;
}
export function createFlight(build,weather=WEATHER[0]){
 return {build:{...build},weather:{...weather},stats:statsFor(build,weather),time:0,altitude:0,velocity:0,fuel:statsFor(build,weather).fuelMass,maxAltitude:0,maxSpeed:0,temperature:20,phase:'powered',status:'flying',reachedSpace:false,chute:false,aborted:false,cause:null,events:[]};
}
export function stepFlight(f,dt,throttle=1){
 if(f.status!=='flying')return f;
 const s=f.stats,p=s.p;f.time+=dt;
 const fail=(cause)=>{f.status='destroyed';f.cause=cause;f.phase='explosion';return f;};
 if(!s.compatible && f.time>.6)return fail({title:'Ignition failure',text:`The ${p.engine.name} cannot use ${p.fuel.name.toLowerCase()}. Match the engine and propellant.`});
 if(s.twr<1 && f.time>2)return fail({title:'Launch pad impact',text:'The engine could not lift the rocket. Choose a chemical engine or reduce the mass.'});
 const burning=f.fuel>0&&!f.aborted;const used=burning?Math.min(f.fuel,p.engine.flow*throttle*dt):0;f.fuel-=used;
 const thrust=burning?p.engine.thrust*(used/(p.engine.flow*dt)):0;
 const density=1.225*Math.exp(-Math.max(0,f.altitude)/8500);const drag=.5*density*f.velocity*Math.abs(f.velocity)*s.drag*1.8;
 const gravity=9.81*(6371000/(6371000+Math.max(0,f.altitude)))**2;
 const acceleration=(thrust-drag)/(s.dryMass+f.fuel)-gravity;
 f.velocity+=acceleration*dt;f.altitude+=f.velocity*dt;
 f.temperature=20+Math.max(0,density*f.velocity*f.velocity*.014);
 f.maxAltitude=Math.max(f.maxAltitude,f.altitude);f.maxSpeed=Math.max(f.maxSpeed,Math.abs(f.velocity));
 if(f.altitude>170&&s.stability<65&&f.time>5+(s.stability/10))return fail({title:'Lost aerodynamic control',text:`Stability was ${Math.round(s.stability)}% in ${f.weather.wind} km/h crosswinds. Try swept or grid fins.`});
 if(f.temperature>s.heat)return fail({title:'Thermal breakup',text:`Air friction exceeded the ${s.heat}°C heat limit. Fit a titanium hull and a needle nose, or lower the throttle.`});
 if(f.altitude>=100000&&!f.reachedSpace){f.reachedSpace=true;f.events.push('Kármán line crossed');}
 if(f.velocity<0){
   f.phase='descent';
   if(f.altitude<4000&&p.recovery.id==='chute'){f.chute=true;f.phase='recovery';f.velocity=Math.max(f.velocity,-32);if(f.altitude<1000)f.velocity=Math.max(f.velocity,-7);}
 }else f.phase=burning?'powered':'coast';
 if(f.altitude<=0&&f.time>2){f.altitude=0;if(f.chute&&Math.abs(f.velocity)<=p.recovery.landing+1){f.status=f.reachedSpace?'success':'recovered';f.phase='landed';f.cause=f.reachedSpace?{title:'Space reached. Rocket recovered.',text:'You crossed 100 km and returned in one piece. That’s a mission worth repeating.'}:{title:'Safe return. Space is still waiting.',text:'You landed safely but missed 100 km. Try more fuel, a stronger engine, or a lighter build.'};}else return fail({title:'Destroyed on impact',text:`Impact at ${Math.round(Math.abs(f.velocity))} m/s exceeded the landing limit. Add a recovery chute for a safe return.`});}
 return f;
}
export function simulate(build,weather=WEATHER[0]){const f=createFlight(build,weather);for(let i=0;i<60000&&f.status==='flying';i++)stepFlight(f,.05);return f;}
