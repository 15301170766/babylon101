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

box.position = new Vector3(0, 3, 4); // 定位
box.material = this.CreateWallMaterials(); // 设置材料
boxLeft.rotation.y = Math.PI / 2; // 角度旋转

#### 反转纹理

wallMat.bumpTexture = normalTex;  
wallMat.invertNormalMapX = true;  
wallMat.invertNormalMapY = true;

#### 加载 pbr 环境场景

const envTex = CubeTexture.CreateFromPrefilteredData(
"./environment/outDoor2.env",
scene
);
scene.environmentTexture = envTex;
scene.createDefaultSkybox(envTex, true);
scene.environmentIntensity = 0.25; // 环境光强度

#### 加载 arm 叠加图层

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

#### 加载模型

await SceneLoader.ImportMeshAsync("","./Model/","Barrel_01_2k.glb",this.scene);
SceneLoader.ImportMesh("","./Model/","Barrel_01_2k.glb",this.scene,onSuccess(),onError());

#### 调整贴图的密度尺寸

diffuseTex.uScale = 4;  
diffuseTex.vScale = 4;

### light

#### 环境光

hemLight.intensity = 1;  
hemLight.diffuse = new Color3(1, 0, 0); // 给灯光加颜色
hemLight.groundColor = new Color3(0, 0, 1); // 地面光,可营造渐变日落场景色
hemLight.specular = new Color3(0, 1, 0); // 模型上显示的反射光、色彩

#### 加入辉光,即发光层

const glowLayer = new GlowLayer("glow", this.scene);
glowLayer.intensity = 1;

### 相机

camera.attachControl(); // 相机的控制
camera.speed = 0.25; // 相机的速度

### 渲染器

this.engine.runRenderLoop(() => {
this.scene.render();
});

# 注意事项

### 导入模型时,需要引入@babylonjs/loader

否则 SceneLoader.ImportMesh()会报错
