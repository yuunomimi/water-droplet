import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
});

renderer.setClearColor(0x000000, 1); // Set background color to white
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.z = 5;

const orbitControls = new OrbitControls(camera, renderer.domElement);

// Light
const pointLight = new THREE.PointLight(0xffffff, 1000, 100);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Object
const geometry = new THREE.SphereGeometry(1, 32, 32);
const originalPosition = geometry.attributes.position.clone();
const deformDroplet = (t: number) => {
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    const x = originalPosition.getX(i);
    const y = originalPosition.getY(i);
    const z = originalPosition.getZ(i);

    // 球の下側ほど 0、上側ほど 1
    const normalizedY = (y + 1) / 2;

    // 滑らかな変化
    const smooth = normalizedY * normalizedY * (3 - 2 * normalizedY);

    // 潰した後の高さ
    const targetY = 0.2 + smooth * 1.2;

    // 横方向にも少し広げる
    const scale = 1.0 + (1.0 - smooth) * 0.3;

    const targetX = x * scale;
    const targetZ = z * scale;

    // 元の球から目標形状へ徐々に変形
    const currentX = x + (targetX - x) * t;
    const currentY = y + (targetY - y) * t - t; // 下方向に少し押し下げる
    const currentZ = z + (targetZ - z) * t;

    position.setXYZ(i, currentX, currentY, currentZ);
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();
}
deformDroplet(0); // 初期形状を設定

const material = new THREE.MeshLambertMaterial({
  color: 0x44aaff,
});

const cube = new THREE.Mesh(geometry, material);
scene.add(cube);


// Plane
const planeGeometry = new THREE.PlaneGeometry(10, 10);
const planeMaterial = new THREE.MeshLambertMaterial({
  color: 0x00ff00,
  side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = Math.PI / 2;
plane.position.y = -2;
scene.add(plane);

// Animation
let time = 0;
function animate() {
  time += 0.01;
  requestAnimationFrame(animate);
  orbitControls.update();

  deformDroplet(time%1);

  renderer.render(scene, camera);
}

animate();

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});