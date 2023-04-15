# Vue 3 + TypeScript + Vite + babylonjs

指令:npm run dev

# 描述

通过 B 站学习 babylonjs,观看的资料为 <babylon101 课程>

# 记录

### 基本纹理概念(待补充)

1.bump 凹凸纹理  
2.normal 法线  
3.AO 金属度  
4.diffuse 漫反射  
5.Rough 粗糙度  
6.specular 镜面

### 免费素材地址:https://polyhaven.com/textures

### PBR 环境场景

1.首先下载 hdr 文件,然后在https://www.babylonjs.com/tools/ibl/#进行转换为env文件  
2.再引入

### 下载的 blender 文件 处理步骤

1.下载的 blender 模型,导入到 blender 中,  
2.配置勾选不要法向,不要动画,进行导出  
3.把模型拖拽到:http://sandbox.babylonjs.com/ 进行查看

### 矢量 3d 模型下载地址:https://www.kenney.nl

# 常用方法

### mesh

```js
box.position = new Vector3(0, 3, 4); // 定位
box.material = this.CreateWallMaterials(); // 设置材料
boxLeft.rotation.y = Math.PI / 2; // 角度旋转
```

#### 反转纹理

```js
wallMat.bumpTexture = normalTex;
wallMat.invertNormalMapX = true;
wallMat.invertNormalMapY = true;
```

#### 加载 pbr 环境场景

```js
const envTex = CubeTexture.CreateFromPrefilteredData(
  "./environment/outDoor2.env",
  scene
);
scene.environmentTexture = envTex;
scene.createDefaultSkybox(envTex, true);
scene.environmentIntensity = 0.25; // 环境光强度
```

#### 加载 arm 叠加图层

```js
// 设置成 pbr 材料模式进行加载
const pbr = new PBRMaterial("pbr", this.scene);

//ao+rough+Metall 三种属性聚合图
// 此处对应 arm 文件的三个属性
pbr.useAmbientOcclusionFromMetallicTextureRed = true;
pbr.useRoughnessFromMetallicTextureGreen = true;
pbr.useMetallnessFromMetallicTextureBlue = true;
pbr.metallicTexture = new Texture(
  "./Materials/Asphalt/asphalt_02_arm_1k.png",
  this.scene
);
pbr.roughness = 1; // 设置粗糙度,改变反光效果
```

#### 加载模型

```js
await SceneLoader.ImportMeshAsync(
  "",
  "./Model/",
  "Barrel_01_2k.glb",
  this.scene,
  (evt) => {
    const total = evt.total; // 总的加载进度
    const loaded = evt.loaded; // 当前加载进度
    const progress = ((loaded * 100) / total).tofixed(); // 进度值百分比
    // 可用于自定义加载动画
  }
);
SceneLoader.ImportMesh(
  "",
  "./Model/",
  "Barrel_01_2k.glb",
  this.scene,
  onSuccess(),
  onError()
);
```

#### 调整贴图的密度尺寸

```js
diffuseTex.uScale = 4;
diffuseTex.vScale = 4;
```

### light

#### 环境光

```js
hemLight.intensity = 1;
hemLight.diffuse = new Color3(1, 0, 0); // 给灯光加颜色
hemLight.groundColor = new Color3(0, 0, 1); // 地面光,可营造渐变日落场景色
hemLight.specular = new Color3(0, 1, 0); // 模型上显示的反射光、色彩
```

#### 方向光(有方向的光)

```js
const directionalLight = new DirectionalLight(
  "dirLight",
  new Vector3(0, -1, 1),
  this.scene
);
```

#### 点光源

```js
const pointLight = new PointLight(
  "pointLight",
  new Vector3(0, -0.2, 0),
  this.scene
);
pointLight.diffuse = new Color3(172 / 255, 246 / 255, 183 / 255);
pointLight.intensity = 0.4;
pointLight.parent = this.lightTubes[0];

// 克隆一个灯光
// const pointClone = pointLight.clone("pointClone") as PointLight;
// 重新设置父级
//pointClone.parent = this.lightTubes[newIndex];
```

#### 聚光灯

```js
const spotLight = new SpotLight(
  "spotLight",
  new Vector3(0, 2, -8),
  new Vector3(0, 1, 8),
  Math.PI / 2,
  10,
  this.scene
);

spotLight.intensity = 1.5;
spotLight.shadowEnabled = true;
```

#### 点光源制造影子

```js
spotLight.shadowMinZ = 1;
spotLight.shadowMaxZ = 10;
// 生成一个2048像素画质的影子
const shadowGen = new ShadowGenerator(2048, spotLight);
shadowGen.useBlurCloseExponentialShadowMap = true; // 阴影模糊,需要搭配shadowMinZ来使用
this.shadowGen = shadowGen;
this.ball.receiveShadows = true;
shadowGen.addShadowCaster(this.ball);
// 给mesh模型循环添加影子
this.models.map((mesh) => {
  mesh.receiveShadows = true;
  shadowGen.addShadowCaster(mesh);
});
```

#### 加入辉光,即发光层

```js
const glowLayer = new GlowLayer("glow", this.scene);
glowLayer.intensity = 1;
```

### 相机

```js


this.camera = new ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 2,
      3,
      Vector3.Zero(),
      this.scene
    );
    this.camera.attachControl(this.canvas, true);
    this.camera.wheelPrecision = 100; // 滚轮速度
    this.camera.minZ = 0.3; // 可查看最小距离,防止提前穿透模型

    this.camera.lowerRadiusLimit = 2; // 控制可缩放的级别限制
    this.camera.upperRadiusLimit = 6; // 控制可缩放的级别限制

    this.camera.panningSensibility = 0; // 禁止右键平移模型

    // this.camera.useBouncingBehavior = true; // 缩放达到limit,回弹到默认尺寸

    // this.camera.useAutoRotationBehavior = true; // 自动旋转 当用户交互时,2秒后继续开始动画
    // this.camera.autoRotationBehavior!.idleRotationSpeed = 1; // 旋转速度
    // this.camera.autoRotationBehavior!.idleRotationSpinupTime = 4000; // 旋转速度从0缓慢上升到设定的旋转速度的时间
    // this.camera.autoRotationBehavior!.idleRotationWaitTime = 4000; // 交互暂停间隔时间
    // this.camera.autoRotationBehavior!.zoomStopsAnimation = true; // 缩放时也同样暂定动画



    this.camera.useFramingBehavior = true; // 是否使用框架模式
    // models.meshes[1].showBoundingBox = true; // 可以查看模型边界线
    // this.camera.setTarget(models.meshes[1]); // 设置相机目标
    this.camera.framingBehavior!.radiusScale = 2; // 相机观看模型的limit
    this.camera.framingBehavior!.framingTime = 4000; // 相机观看模型limit过度时间
```

### 渲染器

```js
this.engine.runRenderLoop(() => {
  this.scene.render();
});
```

### 加载器

```js
this.engine.displayLoadingUI(); // 启用默认加载动画
this.engine.hideLoadingUI(); // 关闭默认加载动画
```

# 注意事项

### 导入模型时,需要引入@babylonjs/loader

否则 SceneLoader.ImportMesh()会报错
