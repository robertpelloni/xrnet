import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export const SpatialViewer = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })

    const width = containerRef.current.clientWidth
    const height = 150
    renderer.setSize(width, height)
    containerRef.current.appendChild(renderer.domElement)

    const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16)
    const material = new THREE.MeshNormalMaterial()
    const knot = new THREE.Mesh(geometry, material)
    scene.add(knot)

    camera.position.z = 30

    const animate = () => {
      requestAnimationFrame(animate)
      knot.rotation.x += 0.01
      knot.rotation.y += 0.01
      renderer.render(scene, camera)
    }

    animate()

    return () => {
      renderer.dispose()
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div ref={containerRef} className="spatial-canvas-container" style={{ position: 'relative' }}>
      <div className="spatial-health-overlay" style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10, background: 'rgba(0,0,0,0.7)', padding: '5px 10px', borderRadius: '4px', fontSize: '0.7rem', border: '1px solid #333' }}>
        <div style={{ color: '#00ffcc' }}>● Spatial Sync: 100%</div>
        <div style={{ color: '#646cff' }}>● AI Models: LWM Active</div>
      </div>
    </div>
  )
}
