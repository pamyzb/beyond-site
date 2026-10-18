"use client";
import { useEffect, useRef } from 'react';

export function HeroGlass() {
  const host=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const container=host.current!,hero=container.parentElement!;
    const abort=new AbortController();
    let disposed=false;
    let cleanup=()=>{};
    async function setup(){
      const [THREE,{SVGLoader},{RoomEnvironment},svg]=await Promise.all([
        import('three'),import('three/addons/loaders/SVGLoader.js'),
        import('three/addons/environments/RoomEnvironment.js'),
        fetch('/assets/figma/hero-glass-mask.svg',{signal:abort.signal}).then(r=>{if(!r.ok)throw new Error('Logo unavailable');return r.text();}),
      ]);
      if(disposed)return;
      const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
      renderer.setClearColor(0xffffff,0);
      renderer.toneMapping=THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure=1.15;
      renderer.domElement.setAttribute('aria-hidden','true');
      container.appendChild(renderer.domElement);
      const scene=new THREE.Scene();
      const camera=new THREE.PerspectiveCamera(45,1,1,3000);
      camera.position.z=1000;
      const room=new RoomEnvironment();
      const pmrem=new THREE.PMREMGenerator(renderer);
      const environment=pmrem.fromScene(room,.04);
      scene.environment=environment.texture;
      room.dispose();pmrem.dispose();
      const data=new SVGLoader().parse(svg);
      const shapes=data.paths.flatMap(path=>path.toShapes());
      const geometry=new THREE.ExtrudeGeometry(shapes,{depth:46,bevelEnabled:true,bevelThickness:9,bevelSize:8,bevelSegments:6,curveSegments:24,steps:1});
      geometry.center();geometry.rotateX(Math.PI);geometry.computeVertexNormals();
      const material=new THREE.MeshPhysicalMaterial({color:0xb5c2f4,metalness:0,roughness:.12,transmission:.86,thickness:52,ior:1.46,clearcoat:1,clearcoatRoughness:.05,envMapIntensity:1.8,attenuationColor:0xaccaff,attenuationDistance:500,side:THREE.DoubleSide});
      const logo=new THREE.Mesh(geometry,material);
      scene.add(logo);
      scene.add(new THREE.HemisphereLight(0xffffff,0x506ab0,2));
      const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(-300,400,700);scene.add(key);
      const rim=new THREE.DirectionalLight(0xadcaff,2);rim.position.set(400,-200,-100);scene.add(rim);
      let width=1,height=1,frame=0,last=0,active=true,interacted=false;
      let x=0,y=0,targetX=0,targetY=0,rx=-.16,ry=.32,rz=-.12,tx=rx,ty=ry;
      let previous:{x:number;y:number}|null=null;
      const reduced=matchMedia('(prefers-reduced-motion: reduce)');
      const fine=matchMedia('(hover: hover) and (pointer: fine)');
      const render=(now:number)=>{
        frame=0;if(disposed||!active||document.hidden)return;
        const dt=last?Math.min((now-last)/16.667,3):1;last=now;
        const follow=reduced.matches?1:1-Math.pow(.62,dt);
        x+=(targetX-x)*follow;y+=(targetY-y)*follow;rx+=(tx-rx)*follow;ry+=(ty-ry)*follow;
        logo.position.set(x-width/2,height/2-y,0);logo.rotation.set(rx,ry,rz);
        renderer.render(scene,camera);
        container.dataset.ready='true';
        if(Math.abs(x-targetX)+Math.abs(y-targetY)+100*(Math.abs(rx-tx)+Math.abs(ry-ty))>.1)frame=requestAnimationFrame(render);
        else last=0;
      };
      const wake=()=>{if(!frame&&active&&!document.hidden)frame=requestAnimationFrame(render);};
      const resize=()=>{
        const nextWidth=container.clientWidth,nextHeight=container.clientHeight;
        if(interacted){x*=nextWidth/width;targetX*=nextWidth/width;y*=nextHeight/height;targetY*=nextHeight/height;}
        width=nextWidth;height=nextHeight;
        renderer.setSize(width,height);
        camera.aspect=width/height;camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(height/2000));camera.updateProjectionMatrix();
        const size=hero.clientWidth<640?170:hero.clientWidth<1440?290:360;
        logo.scale.setScalar(size/480);
        if(!interacted){x=targetX=width/2;y=targetY=height/2;}
        wake();
      };
      const move=(event:PointerEvent)=>{
        if(reduced.matches||!fine.matches||event.pointerType==='touch')return;
        const heroBounds=hero.getBoundingClientRect();
        if(event.clientY<heroBounds.top||event.clientY>heroBounds.bottom)return;
        const bounds=container.getBoundingClientRect();
        interacted=true;targetX=event.clientX-bounds.left;targetY=event.clientY-bounds.top;
        if(previous){ty+=(event.clientX-previous.x)*.006;tx+=(event.clientY-previous.y)*.003;}
        previous={x:event.clientX,y:event.clientY};wake();
      };
      const leave=()=>{previous=null;};
      const visibility=()=>{last=0;if(document.hidden){cancelAnimationFrame(frame);frame=0;}else wake();};
      const motionChange=()=>{if(reduced.matches){previous=null;tx=-.16;ty=.32;}wake();};
      const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(container);
      const intersection=new IntersectionObserver(entries=>{active=entries[0].isIntersecting;if(active)wake();else{cancelAnimationFrame(frame);frame=0;last=0;}},{rootMargin:'100px'});intersection.observe(hero);
      const header=document.querySelector('.site-header:not(.hero-header-reveal)');
      hero.addEventListener('pointermove',move);hero.addEventListener('pointerleave',leave);
      header?.addEventListener('pointermove',move as EventListener);
      document.addEventListener('visibilitychange',visibility);reduced.addEventListener('change',motionChange);
      const contextLost=(event:Event)=>{event.preventDefault();active=false;container.dataset.ready='false';};
      renderer.domElement.addEventListener('webglcontextlost',contextLost);
      cleanup=()=>{
        cancelAnimationFrame(frame);resizeObserver.disconnect();intersection.disconnect();
        hero.removeEventListener('pointermove',move);hero.removeEventListener('pointerleave',leave);header?.removeEventListener('pointermove',move as EventListener);
        document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',motionChange);
        renderer.domElement.removeEventListener('webglcontextlost',contextLost);
        geometry.dispose();material.dispose();environment.dispose();renderer.dispose();renderer.domElement.remove();
      };
      resize();
    }
    void setup().catch(error=>{if(!disposed){cleanup();container.dataset.ready='false';console.warn('3D logo unavailable; using static logo.',error);}});
    return ()=>{disposed=true;abort.abort();cleanup();};
  },[]);
  return <div ref={host} className="hero-three" aria-hidden="true"><img className="hero-three-fallback" src="/assets/figma/hero-glass-rim-depth.svg" alt=""/></div>;
}

