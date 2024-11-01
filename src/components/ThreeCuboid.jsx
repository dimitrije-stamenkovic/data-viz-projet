// src/components/ThreeCuboid.jsx
import { onCleanup, onMount } from "solid-js";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";

export default function ThreeCuboid() {
  let container;

  onMount(() => {
    // Scene, Camera, Renderer setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Create cuboid edges only
    const geometry = new THREE.BoxGeometry(2, 1, 3); // Width, Height, Depth
    const edges = new THREE.EdgesGeometry(geometry);
    const material = new THREE.LineBasicMaterial({ color: 0x0077ff });
    const cuboid = new THREE.LineSegments(edges, material);
    scene.add(cuboid);

    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
    scene.add(ambientLight);

    // Point light positioned to shine on the cuboid
    const pointLight = new THREE.PointLight(0xffffff, 2);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Additional Directional Light for sharp shadows
    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(-5, 5, 5);
    scene.add(directionalLight);

    // Camera positioning
    camera.position.z = 5;

    // Add red points inside the cuboid
    const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const points = [
      { x: -0.5, y: -0.2, z: 0 }, // Sample points inside the cuboid
      { x: 0.5, y: 0.2, z: -1 },
      { x: -0.3, y: 0.3, z: 1 },
    ];

    points.forEach(({ x, y, z }) => {
      const pointGeometry = new THREE.SphereGeometry(0.05); // Small red sphere
      const point = new THREE.Mesh(pointGeometry, pointMaterial);
      point.position.set(x, y, z);
      scene.add(point);
    });

    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.target.set(0, 0, 0);
    controls.update();

    // Render loop
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Cleanup on component unmount
    onCleanup(() => {
      renderer.dispose();
      controls.dispose();
    });

    // Responsive resizing
    window.addEventListener('resize', () => {
      renderer.setSize(container.clientWidth, container.clientHeight);
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
    });
  });

  return <div ref={container} style={{ width: "100%", height: "100vh" }} />;
}