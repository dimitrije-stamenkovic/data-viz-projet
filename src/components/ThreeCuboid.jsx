// src/components/ThreeCuboid.jsx
import { onCleanup, onMount,createEffect } from "solid-js";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";

export default function ThreeCuboid(props) {
  let container;
  const { earthquakes, bounds } = props.earthquakeData || {};



  onMount(() => {
    console.log(earthquakes)

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

    const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    if (earthquakes && bounds) {
      // Calculate ranges for normalization
      const latRange = bounds._northEast.lat - bounds._southWest.lat;
      const lngRange = bounds._northEast.lng - bounds._southWest.lng;

      const maxDepth = Math.max(...earthquakes.map(eq => eq.geometry.coordinates[2]));
      const minDepth = Math.min(...earthquakes.map(eq => eq.geometry.coordinates[2]));

      const maxMagnitude = Math.max(...earthquakes.map(eq => eq.properties.mag));

      earthquakes.forEach(feature => {
        const [lng, lat, depth] = feature.geometry.coordinates;
        const magnitude = feature.properties.mag;

        // Normalize each coordinate and start from the cuboid edges
        const x = ((lng - bounds._southWest.lng) / lngRange) * 2 - 1; // Maps to [-1, 1]
        const z = ((lat - bounds._southWest.lat) / latRange) * 1 - 0.5; // Maps to [-0.5, 0.5]
        const y = -0.5 + (depth / maxDepth) * 1; // Maps depth to [0, 1.5]


        // Adjust color based on depth (deeper = darker)
        const colorValue = 1 - (depth - minDepth) / (maxDepth - minDepth); // Maps depth to [0, 1] range
        const color = new THREE.Color(`hsl(${Math.round(colorValue * 240)}, 100%, 50%)`); // Blue for deep, red for shallow

        // Adjust size based on magnitude
        const size = (magnitude / maxMagnitude) * 0.06 + 0.01; // Scale to range [0.05, 0.25]

        // Plot earthquake point in cuboid
        const pointGeometry = new THREE.SphereGeometry(size);
        const pointMaterial = new THREE.MeshBasicMaterial({ color });
        const point = new THREE.Mesh(pointGeometry, pointMaterial);
        point.position.set(x, y, z);
        scene.add(point);
      });
    }

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