<template>
  <div class="digital-twin">
    <div class="twin-controls">
      <el-button @click="toggleView">切换视图</el-button>
      <el-button @click="resetView">重置视图</el-button>
    </div>
    <div ref="container" class="twin-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { initScene, createRack, animate } from '../utils/three-utils';
import { useTwinStore } from '../stores/twin';

const container = ref(null);
const viewMode = ref('3d');
const scene = ref(null);
const camera = ref(null);
const renderer = ref(null);
const controls = ref(null);
const twinStore = useTwinStore();

const toggleView = () => {
  viewMode.value = viewMode.value === '3d' ? '2d' : '3d';
};

const resetView = () => {
  if (camera.value) {
    camera.value.position.set(0, 5, 10);
    controls.value.update();
  }
};

onMounted(async () => {
  const { scene: s, camera: c, renderer: r, controls: co } = initScene(container.value);
  scene.value = s;
  camera.value = c;
  renderer.value = r;
  controls.value = co;

  const rack1 = createRack(-2, 0, 0);
  const rack2 = createRack(0, 0, 0);
  const rack3 = createRack(2, 0, 0);
  scene.value.add(rack1, rack2, rack3);

  animate(scene.value, camera.value, renderer.value, controls.value);

  await twinStore.fetchModels(1);
});

onUnmounted(() => {
  if (renderer.value) {
    container.value.removeChild(renderer.value.domElement);
  }
});
</script>

<style scoped>
.digital-twin {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.twin-controls {
  padding: 10px;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.twin-container {
  flex: 1;
  position: relative;
}
</style>
