import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function initScene(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf5f5f5);

  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 5, 10);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  const gridHelper = new THREE.GridHelper(20, 20);
  scene.add(gridHelper);

  return { scene, camera, renderer, controls };
}

export function createRack(x, y, z, uHeight = 42) {
  const group = new THREE.Group();

  const geometry = new THREE.BoxGeometry(0.8, uHeight * 0.04445, 0.6);
  const material = new THREE.MeshPhongMaterial({ color: 0x333333 });
  const rack = new THREE.Mesh(geometry, material);
  group.add(rack);

  const edgesGeometry = new THREE.EdgesGeometry(geometry);
  const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
  const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
  group.add(edges);

  for (let i = 1; i <= uHeight; i++) {
    const yPos = -uHeight * 0.022225 + (i - 0.5) * 0.04445;
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.39, yPos, 0.31),
      new THREE.Vector3(0.39, yPos, 0.31)
    ]);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x666666 });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    group.add(line);
  }

  group.position.set(x, y + uHeight * 0.022225, z);
  return group;
}

export function animate(scene, camera, renderer, controls) {
  function loop() {
    requestAnimationFrame(loop);
    controls.update();
    renderer.render(scene, camera);
  }
  loop();
}
