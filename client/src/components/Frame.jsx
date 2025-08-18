import React from 'react'
import { useLoader } from '@react-three/fiber'
import { useGLTF, Text } from '@react-three/drei'
import * as THREE from 'three'

export function Frame({ imgLink = '', rotation, item, ...props }) {
  const { nodes, materials } = useGLTF('./models/items/frame.glb')
  
  if(item.sold==true || !imgLink || imgLink === null){
    return (<></>)
  }else{
    const texture = useLoader(THREE.TextureLoader, imgLink)
    return (
      <group {...props} dispose={null} rotation-y={((rotation || 0) * Math.PI) / 2}>
        <group
          position={[-0.200, 1.786, 0.064]}
          rotation={[Math.PI / 2, 0, -Math.PI / 2]}
          scale={0.855}>
          
          {/* Use the image texture as the material */}
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Plane002.geometry}
            position={[0.2, 0, 0.4]}
            rotation={[Math.PI, 0, Math.PI]}>
            <meshStandardMaterial map={texture} />
          </mesh>
  
          {/* Keep the frame material unchanged */}
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Plane002_1.geometry}
            material={materials.frame}
          />
  
          {/* Show "For Auction" text if auctionActive is true */}
          {item.auctionActive && (
            <mesh
              position={[0, 0.1, 0.1]} // Position above the frame
              rotation={[Math.PI*1.5, 0,0]} // Adjust the rotation as necessary
            >
              {/* <planeBufferGeometry args={[1, 0.5]} /> Adjust size */}
              <Text
                position={[0, 1, 0]} // Slightly in front of the plane
                fontSize={0.5} // Font size of the text
                color="red" // Text color
                anchorX="center" // Center alignment
                anchorY="middle" // Middle alignment
                bold // Bold text
              >
                For Auction
              </Text>
            </mesh>
          )}
        </group>
      </group>
    )
  }
}

// Preload the GLTF model
useGLTF.preload('./models/items/frame.glb')
