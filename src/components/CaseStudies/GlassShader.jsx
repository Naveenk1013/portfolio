import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const GlassSphere = () => {
    const meshRef = useRef();
    
    // Shader for glass-like refraction
    const shaderArgs = useMemo(() => ({
        uniforms: {
            uTime: { value: 0 },
            uColor: { value: new THREE.Color('#5227ff') },
        },
        vertexShader: `
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vViewDir;
            
            void main() {
                vUv = uv;
                vNormal = normalize(normalMatrix * normal);
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vViewDir = normalize(cameraPosition - worldPosition.xyz);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uTime;
            uniform vec3 uColor;
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vViewDir;
            
            void main() {
                float fresnel = pow(1.0 - dot(vNormal, vViewDir), 3.0);
                vec3 color = mix(uColor * 0.5, uColor, fresnel);
                float alpha = mix(0.1, 0.8, fresnel);
                gl_FragColor = vec4(color, alpha);
            }
        `
    }), []);

    useFrame((state) => {
        meshRef.current.material.uniforms.uTime.value = state.clock.getElapsedTime();
        meshRef.current.rotation.y += 0.01;
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[1, 64, 64]} />
            <shaderMaterial 
                args={[shaderArgs]} 
                transparent={true}
                depthWrite={false}
            />
        </mesh>
    );
};

const GlassShader = () => {
    return (
        <div style={{ width: '2.5rem', height: '2.5rem', position: 'relative', marginBottom: '1rem' }}>
            <Canvas camera={{ position: [0, 0, 3] }}>
                <ambientLight intensity={0.5} />
                <GlassSphere />
            </Canvas>
        </div>
    );
};

export default GlassShader;
