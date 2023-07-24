import React, { useEffect, useRef } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { FontLoader } from './FontLoader';
import { TextGeometry } from './TextGeometry';
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Object3D, Vector3 } from "three";
import './App.css';
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import fontum from './fonts/font.json';
import * as THREE from "three"

extend({TextGeometry})

function SampledSurface(props) {
  const objects = useRef();
  const { instance } = props;

  useEffect(() => {
    if (objects.current && objects.current.children[0] && instance.current) {
      const sampler = new MeshSurfaceSampler(objects.current.children[0]).build();
      const _position = new Vector3();
      const _normal = new Vector3();
      const dummy = new Object3D();
  
      const minY = -1; // Minimum Y pozisyonu
      const maxY = 1; // Maksimum Y pozisyonu
  
      for (let i = 0; i < 3000; i++) {
        sampler.sample(_position, _normal);
        _normal.add(_position);
        const scl = Math.random() * (4 - 1) + 1;
        dummy.position.copy(new Vector3(_position.x - 2.5, _position.y - 1, _position.z));
        dummy.scale.copy(new Vector3(scl, scl, scl));
        dummy.lookAt(_normal);
        dummy.updateMatrix();
  
        const heightValue = (_position.y - minY) / (maxY - minY);
        const colorValue = getColorFromHeight(heightValue);
        instance.current.setColorAt(i, colorValue);
        instance.current.castShadow = true;
  
        instance.current.setMatrixAt(i, dummy.matrix);
      }
  
      instance.current.instanceMatrix.needsUpdate = true;
      objects.current.add(instance.current);
    }
  }, [props.children]);
  
  // Yardımcı fonksiyon: Yükseklik değerine göre renkleri hesaplayın
  function getColorFromHeight(heightValue) {
    const hue = (3 - heightValue) * 0.1; // Renk geçişini 0.1 değeri üzerinden yapalım
    const saturation = 1;
    const lightness = 0.50;
    const colorValue = new THREE.Color().setHSL(hue, saturation, lightness);
    return colorValue;
  }
  
  return (
    <group {...props} ref={objects}>
      {props.children}
    </group>
  );
}

function TextMesh() {
  const font = new FontLoader().parse(fontum);

  return(
    <mesh rotation={[-.6, -0.2, -.3]} visible={false} position={[-2,-.5,0]} >
      <textGeometry args={["@", {font, size: 4, height:.25}]}/>
      <meshStandardMaterial attach="material" color={"white"}/>
    </mesh>
  )
  
}

function Ol(){
  const instance = useRef();
  const spheres = useRef([]);
  const sphereCon = useRef();

  useFrame(({ clock }) => {
    instance.current.rotation.z -= 0.0001
    sphereCon.current.rotation.z -= 0.0002
  })


  return (
    <>
    <instancedMesh receiveShadow  ref={instance} args={[null, null, 3000]} rotation={[-.8, -.1, -.3]}>
          <sphereGeometry args={[.005, 16, 16]} />
          <meshStandardMaterial attach="material" color={0x00ffaa} />
        </instancedMesh>
        <SampledSurface instance={instance}>
          <TextMesh />
        </SampledSurface>
        <mesh ref={sphereCon}>
        {Array.from({ length: 1500 }, (_, index) => {
          const posx = (Math.random() - 0.5) * 13;
          const posy = (Math.random() - 0.5) * 13;
          const posz = (Math.random() - 0.5) * 13;
          return (
            <mesh
              key={index}
              ref={(ref) => (spheres.current[index] = ref)}
              position={[posx, posy, posz]}
              receiveShadow 
              >
              <sphereGeometry args={[0.03, 16, 16]} />
              <meshStandardMaterial color={"hsl(85.83333333333333, 63.716814159292035%, 44.31372549019608%)"} />
            </mesh>
          );
        })}
        </mesh>
    </>
  )
}




function App() {
  
  return (
    <div className="container">
      <Canvas shadows>
        <PerspectiveCamera maxDistance={2} position={[0, 0, 10]} fov={175} />
        <directionalLight castShadow intensity={3} color="white" position={[0, 0.1, .02]} />
        <Ol/>
        
        <OrbitControls enablePan={false} enableDamping={false} />
      </Canvas>
    </div>
  );
}

export default App;