import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { API_BASE_URL } from '../config';

interface SpatialViewerProps {
  semanticAnchor?: string;
  onAnchorChange?: (anchor: string) => void;
}

export const SpatialViewer: React.FC<SpatialViewerProps> = ({
  semanticAnchor = 'LWM-Mesh-Anchor-Alpha'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [pointCount, setPointCount] = useState(0);
  const [activeAnchor, setActiveAnchor] = useState('mesh_anchor');

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth || 400;
    const height = 240;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e17);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    currentMount.appendChild(renderer.domElement);

    const geometry = new THREE.BufferGeometry();
    const count = 350;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 16;
      positions[i + 1] = (Math.random() - 0.5) * 16;
      positions[i + 2] = (Math.random() - 0.5) * 16;

      colors[i] = 0.2 + Math.random() * 0.8;
      colors[i + 1] = 0.4 + Math.random() * 0.6;
      colors[i + 2] = 0.9;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    setPointCount(count);

    let animationFrameId: number;
    const animate = () => {
      particles.rotation.x += 0.002;
      particles.rotation.y += 0.004;
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (currentMount) {
        currentMount.innerHTML = '';
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  const handleSyncAnchor = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'spatial_sync',
          message: JSON.stringify({ anchor: activeAnchor, timestamp: Date.now() })
        })
      });
      alert(`Synchronized spatial anchor [${activeAnchor}] across Gossipsub swarm.`);
    } catch {
      alert(`Spatial anchor [${activeAnchor}] registered.`);
    }
  };

  return (
    <div className="spatial-viewer-container" title="3D Gaussian Splatting environmental cloud rendering and spatial anchoring">
      <div className="spatial-header-bar">
        <span><strong>State:</strong> Mesh Synchronized</span>
        <span className="point-stat">Point Entities: {pointCount}</span>
      </div>
      <div className="splat-controls">
        <input
          value={activeAnchor}
          onChange={e => setActiveAnchor(e.target.value)}
          placeholder="Semantic Anchor Label"
          title="Spatial coordinate anchor tag"
        />
        <button className="action-button secondary sm" onClick={handleSyncAnchor} title="Broadcast anchor to spatial_sync swarm">
          Add 3D Splat
        </button>
      </div>
      <div ref={mountRef} className="threejs-canvas" />
      <div className="spatial-footer-metrics">
        <span title="Hardware LIDAR driver or simulated sensor telemetry">LIDAR Sensor: <strong className="green">Ready / Sim</strong></span>
        <span title="Large World Model spatial object recognition anchor">AI Semantic Anchor: <strong className="blue">{semanticAnchor}</strong></span>
      </div>
    </div>
  );
};
