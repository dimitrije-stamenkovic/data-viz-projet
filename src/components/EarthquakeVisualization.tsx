import { createEffect, onCleanup, onMount } from 'solid-js';
import * as THREE from 'three';

const earthquakeData = [
  { lat: 34.05, lon: -118.25, depth: 10, magnitude: 4.2 },
  { lat: 37.77, lon: -122.41, depth: 15, magnitude: 3.8 },
  // Add more earthquake data as needed
];

const toCuboidPosition = (lat, lon, depth, cuboidDimensions) => {
  const { width, height, depth: depthSize } = cuboidDimensions;
  const x = (lon / 180) * (width / 2);       // Map lon from -180 to +180
  const y = (lat / 90) * (height / 2);       // Map lat from -90 to +90
  const z = -(depth / 100) * depthSize;      // Depth range mapping
  return [x, y, z];
};

const EarthquakeVisualization = () => {
  let containerRef;

  onMount(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Append renderer to container
    containerRef.appendChild(renderer.domElement);

    // Cuboid dimensions
    const cuboidDimensions = { width: 20, height: 20, depth: 20 };

    // Create the cuboid
    const geometry = new THREE.BoxGeometry(cuboidDimensions.width, cuboidDimensions.height, cuboidDimensions.depth);
    const material = new THREE.MeshBasicMaterial({ color: 0x0000ff, opacity: 0.2, transparent: true });
    const cuboid = new THREE.Mesh(geometry, material);
    scene.add(cuboid);

    // Create earthquake markers
    earthquakeData.forEach(quake => {
      const [x, y, z] = toCuboidPosition(quake.lat, quake.lon, quake.depth, cuboidDimensions);
      const quakeGeometry = new THREE.BoxGeometry(0.2, 0.2, quake.magnitude / 2); // Scale by magnitude
      const quakeMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
      const quakeMesh = new THREE.Mesh(quakeGeometry, quakeMaterial);
      quakeMesh.position.set(x, y, z);
      scene.add(quakeMesh);
    });

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    camera.position.z = 30;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup on unmount
    onCleanup(() => {
      containerRef.removeChild(renderer.domElement);
    });
  });

  return <div ref={containerRef} style={{ height: '500px', width: '100%' }} />;
};

export default EarthquakeVisualization;
