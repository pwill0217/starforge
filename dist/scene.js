import * as THREE from './vendor/three.module.js';
import { OrbitControls } from './vendor/OrbitControls.js';
import { THEMES } from './game.js';
const TAU=Math.PI*2;
export function createScene(host){
 const scene=new THREE.Scene();scene.background=new THREE.Color('#1c2a31');scene.fog=new THREE.FogExp2('#1c2a31',.027);
 const camera=new THREE.PerspectiveCamera(36,1,.1,1500);camera.position.set(11,7.4,15.6);
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;host.prepend(renderer.domElement);
 const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,4.1,0);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=11;controls.maxDistance=28;controls.maxPolarAngle=Math.PI*.53;controls.minPolarAngle=.25;controls.autoRotate=true;controls.autoRotateSpeed=.35;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;controls.autoRotate=!reduced;
 scene.add(new THREE.HemisphereLight('#bddce9','#423c31',2.6));
 const key=new THREE.DirectionalLight('#fff4df',4);key.position.set(-6,12,9);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-10;key.shadow.camera.right=10;key.shadow.camera.top=12;key.shadow.camera.bottom=-10;key.shadow.bias=-.0005;scene.add(key);
 const rim=new THREE.DirectionalLight('#9db8ff',2.5);rim.position.set(7,6,-6);scene.add(rim);
 const orange=new THREE.PointLight('#ff7048',20,14);orange.position.set(-4,2,3);scene.add(orange);
 const mat=(color,metalness=.25,roughness=.45,extra={})=>new THREE.MeshStandardMaterial({color,metalness,roughness,...extra});
 const mesh=(geo,material,x=0,y=0,z=0,parent=scene)=>{const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
 const cyl=(r1,r2,h,m,x,y,z,parent=scene)=>mesh(new THREE.CylinderGeometry(r1,r2,h,64),m,x,y,z,parent);
 const ground=new THREE.Group();scene.add(ground);
 mesh(new THREE.PlaneGeometry(400,400),mat('#1d2b31',.3,.85),0,-.39,0,ground).rotation.x=-Math.PI/2;
 const grid=new THREE.GridHelper(200,100,'#41545b','#32424a');grid.position.y=-.38;grid.material.transparent=true;grid.material.opacity=.45;ground.add(grid);
 const platform=mat('#35454d',.65,.5);cyl(3.15,3.4,.32,platform,0,-.18,0,ground);cyl(2.94,2.94,.04,mat('#627378',.4,.65),0,0,0,ground);cyl(2.73,2.73,.03,mat('#28363c',.55,.8),0,.04,0,ground);
 const padRing=mesh(new THREE.TorusGeometry(2.83,.027,8,100),mat('#ff8355',.3,.3,{emissive:'#ff622e',emissiveIntensity:.4}),0,.08,0,ground);padRing.rotation.x=Math.PI/2;
 for(let i=0;i<12;i++){const a=i/12*TAU;const bar=mesh(new THREE.BoxGeometry(.09,.04,.36),mat('#a9b1a5'),Math.sin(a)*2.48,.07,Math.cos(a)*2.48,ground);bar.rotation.y=a;}
 for(let i=0;i<4;i++){const a=i*TAU/4+.8;const x=Math.sin(a)*3.6,z=Math.cos(a)*3.6;cyl(.08,.12,.42,mat('#42565d'),x,-.12,z,ground);mesh(new THREE.SphereGeometry(.085,12,8),mat('#ffe9ad',0,.2,{emissive:'#ffde9f',emissiveIntensity:3}),x,.12,z,ground);}
 // Distant structural lines establish the scale of the launch range.
 const guideMat=new THREE.LineBasicMaterial({color:'#536570',transparent:true,opacity:.28});
 for(const x of [-12,12]){scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x,0,-18),new THREE.Vector3(x,18,-18)]),guideMat));}
 const starsGeo=new THREE.BufferGeometry();const stars=[];for(let i=0;i<800;i++){stars.push((Math.random()-.5)*450,20+Math.random()*260,-80-Math.random()*230);}starsGeo.setAttribute('position',new THREE.Float32BufferAttribute(stars,3));const starsMesh=new THREE.Points(starsGeo,new THREE.PointsMaterial({size:.34,color:'#d8ecff',transparent:true,opacity:0}));scene.add(starsMesh);
 let rocket=new THREE.Group();scene.add(rocket);let flame,flameCore,chute,flight=null,explosionTime=-1;const debris=[];const smoke=[];const clock=new THREE.Clock();let running=true;
 const exhaustMat=mat('#ff9856',0,.2,{emissive:'#ff5b13',emissiveIntensity:3,transparent:true,opacity:.92});
 const labelTexture=(text,body,ink)=>{const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;const ctx=canvas.getContext('2d');ctx.fillStyle=body;ctx.fillRect(0,0,1024,512);ctx.fillStyle=ink;ctx.font='bold 40px monospace';ctx.textAlign='center';ctx.fillText('S T A R F O R G E',512,190);ctx.font='bold 100px sans-serif';ctx.fillText('01',512,315);ctx.fillRect(438,350,148,4);const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;return t;};
 function dispose(group){group.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material]){m.map?.dispose();m.dispose();}}});}
 function build(config){
  dispose(rocket);scene.remove(rocket);rocket=new THREE.Group();scene.add(rocket);const theme=THEMES[config.theme];const paint=mat(config.paint,.35,.34);const body=mat(config.hull==='titanium'?(config.theme==='retro'?'#b7c1c5':theme.body):theme.body,config.hull==='titanium'?.8:config.theme==='steam'?.7:.28,config.hull==='scrap'?.85:.38);const dark=mat(theme.dark,.7,.35);const silver=mat(config.theme==='steam'?'#e8bf78':'#a9b4b6',.8,.32);const glass=mat(theme.glow,.5,.12,{emissive:theme.glow,emissiveIntensity:.3});
  const band=(r,h,y,m=silver)=>cyl(r,r,h,m,0,y,0,rocket);
  if(config.hull==='scrap'){for(let i=0;i<4;i++){const patch=mesh(new THREE.BoxGeometry(.42,.48,.035),i%2?dark:silver,Math.sin(i*1.5)*.74,2.1+i*.55,Math.cos(i*1.5)*.74,rocket);patch.rotation.y=i*1.5;}}
  const isCyber=config.theme==='cyber',isSteam=config.theme==='steam';
  cyl(.72,.75,3.55,body,0,3.18,0,rocket);band(.762,.12,1.51,dark);band(.752,.09,1.78);band(.744,.055,2.3,dark);band(.739,.06,4.44);band(.745,.17,4.98,paint);band(.75,.075,2.0,mat(({kerolox:'#ff9d63',methalox:'#8ae4df',steam:'#e2b879',xenon:'#b597ff'})[config.fuel],.4,.3));
  const decal=new THREE.MeshStandardMaterial({map:labelTexture('01',theme.body,isCyber?'#acb8d7':'#344047'),metalness:.25,roughness:.5});
  const labeled=mesh(new THREE.CylinderGeometry(.724,.73,1.7,64,1,true),decal,0,3.4,0,rocket);labeled.rotation.y=Math.PI*.9;
  cyl(.82,.72,.55,body,0,5.28,0,rocket);band(.84,.1,5.58,paint);
  if(config.nose==='bubble'){const bubble=mesh(new THREE.SphereGeometry(.87,40,24,0,TAU,0,Math.PI/2),glass,0,6.21,0,rocket);cyl(.87,.83,.6,body,0,5.91,0,rocket);band(.9,.12,6.23,silver);}
  else {cyl(.73,.83,.79,body,0,5.97,0,rocket);band(.745,.07,6.36,silver);const h=config.nose==='needle'?2.25:1.7;const pts=[];for(let i=0;i<=24;i++){const t=i/24;pts.push(new THREE.Vector2(.75*Math.pow(1-t,.72),t*h));}mesh(new THREE.LatheGeometry(pts,64),paint,0,6.4,0,rocket);}
  // The capsule's inset porthole is a physical part, visible from the default camera.
  const port=new THREE.Group();port.position.set(.27,5.96,.72);port.rotation.y=.36;rocket.add(port);const bezel=mesh(new THREE.TorusGeometry(.29,.065,12,40),silver,0,0,0,port);mesh(new THREE.SphereGeometry(.235,32,24),glass,0,0,.035,port).scale.z=.3;
  for(let i=0;i<8;i++){const a=i*TAU/8;mesh(new THREE.SphereGeometry(.022,8,6),dark,Math.cos(a)*.3,Math.sin(a)*.3,.045,port);}
  cyl(.62,.47,.52,dark,0,1.22,0,rocket);band(.63,.1,1.41,paint);cyl(.32,.57,.56,silver,0,.77,0,rocket);cyl(.53,.52,.08,dark,0,.48,0,rocket);
  if(config.engine==='titan'){for(const x of [-.71,.71]){cyl(.23,.31,.85,dark,x,1.09,0,rocket);cyl(.17,.3,.4,silver,x,.6,0,rocket);}}
  if(config.engine==='steam'){for(let i=0;i<4;i++)band(.66,.045,1.03+i*.11,silver);}
  if(config.engine==='ion'){band(.6,.14,.68,glass);band(.6,.07,.46,glass);}
  if(config.fins!=='none'){
   for(let i=0;i<4;i++){const finGroup=new THREE.Group();finGroup.rotation.y=i*Math.PI/2+.12;rocket.add(finGroup);const shape=new THREE.Shape();const extent=config.fins==='stub'?1.25:1.72;
    shape.moveTo(.69,2.95);shape.lineTo(extent,1.19);shape.lineTo(extent,.45);shape.lineTo(.7,.9);shape.closePath();const fin=mesh(new THREE.ExtrudeGeometry(shape,{depth:.11,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.055,bevelThickness:.035}),paint,0,0,-.055,finGroup);
    if(config.fins==='grid'){for(let j=0;j<3;j++)mesh(new THREE.BoxGeometry(.64,.045,.04),dark,1.24,1.15+j*.23,.1,finGroup);}
    else {const strip=mesh(new THREE.BoxGeometry(.065,1.4,.14),silver,1.15,1.8,.035,finGroup);strip.rotation.z=-.49;}
   }
  }
  for(let i=0;i<(isSteam?12:8);i++){const a=i/ (isSteam?12:8)*TAU;for(const y of [1.8,4.43,5.57])mesh(new THREE.SphereGeometry(isSteam?.035:.021,8,6),silver,Math.sin(a)*.759,y,Math.cos(a)*.759,rocket);}
  if(isSteam){for(const a of [-1,1]){const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(a*.64,1.9,.42),new THREE.Vector3(a*.96,2.3,.5),new THREE.Vector3(a*.96,4.2,.5),new THREE.Vector3(a*.64,4.8,.42)]);mesh(new THREE.TubeGeometry(curve,32,.065,8,false),silver,0,0,0,rocket);}for(let i=0;i<5;i++)band(.77,.045,2.4+i*.4,silver);}
  if(isCyber){for(let i=0;i<4;i++){const a=i*Math.PI/2;const strip=mesh(new THREE.BoxGeometry(.035,2.4,.045),glass,Math.sin(a)*.748,3.15,Math.cos(a)*.748,rocket);strip.rotation.y=a;}cyl(.025,.045,1.2,silver,.67,6.33,-.3,rocket);}
  if(config.recovery==='legs'){for(let i=0;i<3;i++){const a=i*TAU/3;const leg=mesh(new THREE.BoxGeometry(.09,1.45,.1),silver,Math.sin(a)*.95,.85,Math.cos(a)*.95,rocket);leg.rotation.z=-Math.sin(a)*.3;leg.rotation.x=Math.cos(a)*.3;}}
  if(config.recovery==='chute')band(.832,.13,5.66,dark);
  flame=mesh(new THREE.ConeGeometry(.39,2.5,24),exhaustMat.clone(),0,-.79,0,rocket);flame.rotation.z=Math.PI;flame.visible=false;
  flameCore=mesh(new THREE.ConeGeometry(.22,1.5,20),mat('#fff2bc',0,.1,{emissive:'#ffdda3',emissiveIntensity:4}),0,-.31,.02,rocket);flameCore.rotation.z=Math.PI;flameCore.visible=false;
  chute=new THREE.Group();rocket.add(chute);mesh(new THREE.SphereGeometry(2.7,32,20,0,TAU,0,Math.PI/2),new THREE.MeshStandardMaterial({color:config.paint,side:THREE.DoubleSide,roughness:1}),0,12.3,0,chute);
  for(let i=0;i<8;i++){const a=i/8*TAU;const points=[new THREE.Vector3(Math.sin(a)*2.7,12.3,Math.cos(a)*2.7),new THREE.Vector3(0,7,0)];chute.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:'#d9dad2'})));}chute.visible=false;
  rocket.rotation.y=.07;rocket.position.y=.08;flight=null;explosionTime=-1;ground.position.y=0;starsMesh.material.opacity=0;scene.background.set('#1c2a31');scene.fog.color.set('#1c2a31');scene.fog.density=.027;resetView();
 }
 function resetView(){camera.position.set(11,7.4,15.6);controls.target.set(0,4.1,0);controls.update();}
 function burst(){if(explosionTime>=0)return;explosionTime=clock.elapsedTime;rocket.visible=false;for(let i=0;i<65;i++){const m=mesh(new THREE.IcosahedronGeometry(.07+Math.random()*.19,0),mat(i%3?'#ff773d':'#ffe5a4',.1,.4,{emissive:'#ff5511',emissiveIntensity:i%3?1:3}),0,3.7,0);m.userData.v=new THREE.Vector3((Math.random()-.5)*9,Math.random()*9,(Math.random()-.5)*9);debris.push(m);}}
 function setFlight(f){flight=f;controls.autoRotate=false;if(f?.status==='destroyed')burst();}
 const observer=new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();});observer.observe(host);
 function frame(){if(!running)return;requestAnimationFrame(frame);const dt=Math.min(clock.getDelta(),.05),t=clock.elapsedTime;
  if(flight){const h=Math.max(0,flight.altitude);const space=Math.min(1,h/90000);const col=new THREE.Color('#1c2a31').lerp(new THREE.Color('#070b1c'),space);scene.background.copy(col);scene.fog.color.copy(col);starsMesh.material.opacity=space*.85;ground.position.y=-Math.min(90,h/160);flame.visible=flight.phase==='powered'&&flight.status==='flying';flameCore.visible=flame.visible;flame.scale.set(1,1+Math.sin(t*36)*.13,1);chute.visible=flight.chute&&flight.status==='flying';rocket.rotation.z=flight.phase==='descent'&&!flight.chute?Math.sin(t*.8)*.1:Math.sin(t*7)*.004;rocket.position.y=.08+Math.sin(t*2)*.055;
   if(flight.chute){camera.position.lerp(new THREE.Vector3(13,9,20),dt);controls.target.lerp(new THREE.Vector3(0,6.4,0),dt);}
   if(flame.visible&&!reduced&&Math.random()>.35){const puff=mesh(new THREE.SphereGeometry(.3,8,6),new THREE.MeshBasicMaterial({color:'#9da4a6',transparent:true,opacity:.28,depthWrite:false}),Math.random()*.5-.25,-1.7,Math.random()*.5-.25);puff.userData.life=0;smoke.push(puff);}
  }
  for(let i=smoke.length-1;i>=0;i--){const puff=smoke[i];puff.userData.life+=dt;puff.position.y-=dt*9;puff.scale.addScalar(dt*1.6);puff.material.opacity=Math.max(0,.28-puff.userData.life*.15);if(puff.userData.life>2){scene.remove(puff);dispose(puff);smoke.splice(i,1);}}
  for(const m of debris){m.position.addScaledVector(m.userData.v,dt);m.userData.v.y-=dt*5;m.rotation.x+=dt*3;m.rotation.z+=dt*2;if(clock.elapsedTime-explosionTime>2)m.scale.multiplyScalar(.965);}
  controls.update();renderer.render(scene,camera);
 }
 frame();
 return {build,setFlight,resetView,rotate:()=>{controls.autoRotate=!controls.autoRotate;return controls.autoRotate;},zoom:(n)=>{camera.position.sub(controls.target).multiplyScalar(n).add(controls.target);controls.update();},clearFlight:()=>{flight=null;for(const m of debris){scene.remove(m);dispose(m);}debris.length=0;rocket.visible=true;controls.autoRotate=!reduced;},dispose:()=>{running=false;observer.disconnect();controls.dispose();renderer.dispose();},get available(){return true;}};
}
