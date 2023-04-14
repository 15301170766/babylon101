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

# 注意事项

### 导入模型时,需要引入@babylonjs/loader

否则 SceneLoader.ImportMesh()会报错
