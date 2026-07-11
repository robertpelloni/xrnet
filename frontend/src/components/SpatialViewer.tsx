import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

interface Splat {
  id: string;
  position: [number, number, number];
  color: [number, number, number, number];
  scale: [number, number, number];
  rotation: [number, number, number, number];
  semantic_label?: string;
}

export const SpatialViewer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [splats, setSplats] = useState<Splat[]>([])
  const [status, setStatus] = useState<string>('Initializing...')
  const sceneRef = useRef<THREE.Scene | null>(null)
  const spheresRef = useRef<Record<string, THREE.Mesh>>({})

  useEffect(() => {
    if (!containerRef.current) return

    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Add some lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 10, 0);
    scene.add(directionalLight);

    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })

    const width = containerRef.current.clientWidth
    const height = 400
    renderer.setSize(width, height)
    containerRef.current.appendChild(renderer.domElement)

    camera.position.z = 5
    camera.position.y = 2
    camera.lookAt(0, 0, 0)

    const animate = () => {
      requestAnimationFrame(animate)

      // Rotate the camera slowly around the scene
      const time = Date.now() * 0.001;
      camera.position.x = Math.sin(time * 0.5) * 5;
      camera.position.z = Math.cos(time * 0.5) * 5;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera)
    }

    animate()

    const fetchSplats = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/spatial/splats');
            const data = await res.json();
            setSplats(data.splats);
            setStatus('Connected');
        } catch (err) {
            console.error("Error fetching splats", err);
            setStatus('Error connecting to backend');
        }
    }

    fetchSplats();
    const interval = setInterval(fetchSplats, 2000);

    return () => {
      clearInterval(interval)
      renderer.dispose()
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }
    }
  }, [])

  // Update Three.js scene when splats change
  useEffect(() => {
    if (!sceneRef.current) return

    const scene = sceneRef.current
    const currentSphereIds = new Set<string>()

    splats.forEach(splat => {
      currentSphereIds.add(splat.id)

      let mesh = spheresRef.current[splat.id]
      if (!mesh) {
        // Create new sphere for this splat
        const geometry = new THREE.SphereGeometry(1, 16, 16)
        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(splat.color[0]/255, splat.color[1]/255, splat.color[2]/255),
          transparent: true,
          opacity: splat.color[3]/255
        })
        mesh = new THREE.Mesh(geometry, material)
        scene.add(mesh)
        spheresRef.current[splat.id] = mesh
      }

      // Update position and scale
      mesh.position.set(splat.position[0], splat.position[1], splat.position[2])
      mesh.scale.set(splat.scale[0], splat.scale[1], splat.scale[2])

      // Update color if it changed
      const material = mesh.material as THREE.MeshStandardMaterial
      material.color.setRGB(splat.color[0]/255, splat.color[1]/255, splat.color[2]/255)
      material.opacity = splat.color[3]/255
    })

    // Remove old spheres
    Object.keys(spheresRef.current).forEach(id => {
      if (!currentSphereIds.has(id)) {
        scene.remove(spheresRef.current[id])
        spheresRef.current[id].geometry.dispose()
        ;(spheresRef.current[id].material as THREE.Material).dispose()
        delete spheresRef.current[id]
      }
    })

  }, [splats])

  const handleUpload = async () => {
    try {
        await fetch('http://localhost:3000/api/spatial/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: 'splat_' + Math.random().toString(36).substr(2, 9),
                position: [(Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5],
                color: [Math.random() * 255, Math.random() * 255, Math.random() * 255, 255],
                scale: [0.1 + Math.random() * 0.5, 0.1 + Math.random() * 0.5, 0.1 + Math.random() * 0.5],
                rotation: [1.0, 0.0, 0.0, 0.0],
                semantic_label: 'test_upload'
            })
        });
    } catch (err) {
        console.error("Error uploading splat", err);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <strong>Status:</strong> {status} | <strong>Objects:</strong> {splats.length}
      </div>
      <button onClick={handleUpload}>Test Upload Splat</button>
      <div ref={containerRef} className="spatial-canvas-container" style={{ height: '400px', background: '#111', marginTop: '10px' }} />
    </div>
  )
}
