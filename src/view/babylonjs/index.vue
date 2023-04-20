<template>
  <div class="content">
    <h3>babylonjs example</h3>
    <canvas id="babylonCanvas"></canvas>
  </div>
</template>
<script setup lang="ts">
import { onMounted } from "vue";
import { BasicSence } from "./example/PhyscisForces";
onMounted(() => {
  let canvas = document.getElementById("babylonCanvas") as HTMLCanvasElement;
  new BasicSence(canvas);
});
</script>
<style>
.content {
  width: 100%;
  height: 100vh;
  background: #ccc;
  text-align: center;
  padding-top: 10vh;
  box-sizing: border-box;
}

#babylonCanvas {
  width: 70%;
  height: 70%;
  box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.5);
  margin-top: 10px;
}
</style>
