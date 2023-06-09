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

### 模型贴图材料:https://www.kenney.nl

### 模型动画:https://www.mixamo.com/

```js
1.先上传kenney下载的模型
2.选择动画
3.下载
3.1 下载时调整参数为60帧,without skin
```

### PBR 环境场景

1.首先下载 hdr 文件,然后在https://www.babylonjs.com/tools/ibl/  
1.1#进行转换为 env 文件  
2.再引入

### 下载的 blender 文件 处理步骤

1.下载的 blender 模型,导入到 blender 中,  
2.配置勾选不要法向,不要动画,进行导出  
3.把模型拖拽到:http://sandbox.babylonjs.com/ 进行查看

### 矢量 3d 模型下载地址:https://www.kenney.nl

### 键盘数字对应查询 https://www.toptal.com/developers/keycode

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

// models.isVisible = false; // 可是设置物体是否可见
// models.visibility = 1; // 可是设置物体透明度
```

#### 模型合并,用于动画时

```js
const { meshes } = await SceneLoader.ImportMeshAsync(
      "",
      "./Model/",
      "vintage_pocket_watch_1k.glb",
      this.scene
    );
    // 删除根部模型
    meshes.shift();
    // 合并零碎模型进行动画
    this.target = Mesh.MergeMeshes(
      meshes as Mesh[],
      true,
      true,
      undefined,
      false,
      true
    ) as AbstractMesh;
    this.target.scaling = new Vector3(50, 50, 50);
    this.target.position = new Vector3(0, 2, 0);
    this.target.rotation = new Vector3(0, Math.PI / 1, 0);
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

#### free 相机

```js
const camera = new FreeCamera("camera", new Vector3(2, 2, 1), this.scene);
camera.attachControl();
camera.minZ = 0.3; // 靠近物体的最小距离,防止穿模型
camera.speed = 0.5; // 相机运动的速度
camera.angularSensibility = 4000; // 相机旋转速度,越大越慢
camera.applyGravity = true; // 相机添加重力  ==>scene 也要添加重力效果
camera.checkCollisions = true; // 相机添加碰撞检测 ===>scene 也要添加碰撞检测
// 对应的模型也要开启碰撞检测;
//  meshs.map((mesh) => {
//         mesh.checkCollisions = true; //开启碰撞检测
//       });
camera.ellipsoid = new Vector3(1, 1, 1); // 将相机视为”长宽高为1“的一个椭圆物体
// 设置WASD 来控制上下左右
camera.keysUp.push(87);
camera.keysDown.push(65);
camera.keysLeft.push(83);
camera.keysRight.push(68);
```

#### 自由移动相机

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

### 事件绑定 action

#### 点击事件

```js
models.actionManager = new ActionManager(this.scene); // 注册事件管理
// 绑定事件
models.actionManager.registerAction(
  new SetValueAction(
    ActionManager.OnPickDownTrigger, // 点击事件
    models,
    "scaling",
    new Vector3(3, 3, 3) // 缩放3倍
  )
);
```

#### 根据持续时间发生事件

```js
  models.actionManager = new ActionManager(this.scene); // 注册事件管理
    // 绑定事件
    models.actionManager
      .registerAction(
        new InterpolateValueAction(
          ActionManager.OnPickDownTrigger, // 点击事件
          models,
          "roughness",
          0,
          3000
        )
      )!
      .then(
        // 再次点击事件
        new InterpolateValueAction(
          ActionManager.NothingTrigger,
          models,
          "roughness",
          1,
          3000
        )
      );
```

#### 自动触发事件,根据渲染帧率自动发生

```js
this.scene.actionManager = new ActionManager(this.scene); // 注册事件管理
// 绑定事件
this.scene.actionManager.registerAction(
  // 给scene注册事件
  new IncrementValueAction(
    ActionManager.OnEveryFrameTrigger, // 每帧自动触发的事件
    models,
    "rotation.y",
    0.01
  )
);
```

### 渲染器

```js
this.engine.runRenderLoop(() => {
  this.scene.render();
});
```

#### 设置重力效果(y 轴)

```js
scene.onPointerDown = (evt) => {
  // 鼠标左键点击
  if (evt.button === 0) this.engine.enterPointerlock(); // 进入鼠标锁定模式
  if (evt.button === 1) this.engine.exitPointerlock(); // 退出鼠标锁定模式(鼠标中键)
};

const framesPersecond = 60; // 设置帧率60
const gravity = -9.81; // 设置重力
// y轴设置重力,可以施加一个平滑运动的重力效果 ==>camera、meshes 也要添加重力效果
scene.gravity = new Vector3(0, gravity / framesPersecond, 0);
scene.collisionsEnabled = true; // 开启碰撞检测 ==>camera、meshes 也要添加碰撞检测
```

#### 物体碰撞

```js
this.ball.physicsImpostor = new PhysicsImpostor(
  this.ball,
  PhysicsImpostor.BoxImpostor,
  {
    mass: 1, // 物体质量 不可移动的物体可以设置为0
    friction: 0.001, // 物体摩擦力
    restitution: 0.5, // 碰撞恢复
  }
);

// 添加插件 cannon @types/cannon
// 场景添加重力和物理反弹效果
scene.enablePhysics(
  new Vector3(0, -9.81, 0),
  new CannonJSPlugin(true, 10, CANNON)
);
```

#### 碰撞事件注册

```js
box.physicsImpostor.registerOnPhysicsCollide(
  this.ball.physicsImpostor,
  this.DetectCollisions
);
```

#### 碰撞事件注销

```js
// 注销碰撞
box.physicsImpostor.unregisterOnPhysicsCollide(
  this.ball.physicsImpostor,
  this.DetectCollisions
);
```

#### 多个碰撞注册

```js
box.physicsImpostor.registerOnPhysicsCollide(
  [this.ball.physicsImpostor, this.ground.physicsImpostor],
  this.DetectCollisions
);
```

#### 碰撞回调

```js
DetectCollisions(boxCol: PhysicsImpostor, colAgainst: any): void {
    // boxCol.object.scaling = new Vector3(3, 3, 3); // 碰撞放大
    // boxCol.setScalingUpdated(); // 更新放大后的模型,防止穿模型
    const redMat = new StandardMaterial("mat", this.scene);
    redMat.diffuseColor = new Color3(1, 0, 0);
    (colAgainst.object as AbstractMesh).material = redMat;
  }

```

#### 模型交叉检测

```js
//模型是否发生交叉,持续监测
   DetectTrigger(): void {
    let count = 0;
    this.scene.registerBeforeRender(() => {
      // 持续监测
      if (box.intersectsMesh(this.ball)) count++;
      if (count === 1) {
        console.log(box.intersectsMesh(this.ball)); // 模型是否发生交叉
      }
    });
  }
```

#### 给模型加上速度

```js

  meshes[0].setParent(rocketCol); // 设置模型的上级
    rocketCol.rotate(Vector3.Forward(), 1.5); // 角度倾斜
    const rocketPhysics = () => {
      this.camera.position = new Vector3(
        rocketCol.position.x,
        rocketCol.position.y,
        this.camera.position.z
      ); // 相机跟踪
      rocketCol.physicsImpostor!.setLinearVelocity(rocketCol.up.scale(5)); // 沿着y轴上升1
      rocketCol.physicsImpostor!.setAngularVelocity(rocketCol.up); //模型旋转
    };
    let gameOver = false;
    if (!gameOver) {
      this.scene.registerBeforeRender(rocketPhysics); // 注册一个每帧触发的事件
    }
    this.scene.onPointerDown = () => {
      gameOver = true;
      this.scene.unregisterBeforeRender(rocketPhysics); // 注册一个每帧触发的事件
    };
```

#### 给模型添加力

```js
// 先给物体添加质量
box.physicsImpostor = new PhysicsImpostor(box, PhysicsImpostor.BoxImpostor, {
  mass: 0.5, // 物体质量
  friction: 1, // 物体摩擦力
});
//
box.actionManager = new ActionManager(this.scene); // 注册事件
box.actionManager.registerAction(
  // 通过点击在相对位置添加一个力
  // add为追加方向力
  new ExecuteCodeAction(ActionManager.OnPickDownTrigger, () => {
    box.physicsImpostor?.applyImpulse(
      new Vector3(-3, 0, 0),
      box.getAbsolutePosition().add(new Vector3(0, 2, 0))
    );
  })
);
```

#### 射击小球

```js
   const clone = this.cannonBall.clone("cloneBall");
    clone.position = this.camera.position;
    // 启用小球
    clone.setEnabled(true);
    // 在相机的位置发射
    clone.physicsImpostor?.applyForce(
      this.camera.getForwardRay().direction.scale(1000),
      clone.getAbsolutePosition()
    );
    // 接触地板后,3秒后消失
    clone.physicsImpostor?.registerOnPhysicsCollide(
      this.ground.physicsImpostor as PhysicsImpostor,
      () => {
        setTimeout(() => {
          clone.dispose();
        }, 3000);
      }
    );


  // 左键注册发射
    scene.onPointerDown = (evt) => {
      if (evt.button === 2) {
        this.ShootCannonBall();
      }
    };
```

#### 创造射线

```js
this.scene.onPointerDown = () => {
      // 创造射线
      const ray = this.scene.createPickingRay(
        this.scene.pointerX,
        this.scene.pointerY,
        Matrix.Identity(),
        this.camera
      );

      const raycastHit = this.scene.pickWithRay(ray) as PickingInfo;
      if (raycastHit.hit && raycastHit.pickedMesh!.name === "boxBox") {
        // 创建一个图层
        const decal = MeshBuilder.CreateDecal("decal", raycastHit.pickedMesh, {
          position: raycastHit.pickedPoint,
          normal: raycastHit.getNormal(true),
          size: new Vector3(1, 1, 1),
        });
        // 随机的贴图
        decal.material =
          this.splatters[Math.floor(Math.random() * this.splatters.length)];
        // 设置图层的上级为点击的小球,让贴图可以跟随小球运动
        decal.setParent(raycastHit.pickedMesh);
        raycastHit.pickedMesh?.physicsImpostor?.applyImpulse(
          ray.direction.scale(2),
          raycastHit.pickedPoint
        );
      }
    };
```

### 加载器

```js
this.engine.displayLoadingUI(); // 启用默认加载动画
this.engine.hideLoadingUI(); // 关闭默认加载动画
```

### 动画

#### 创建动画

```js
const fps = 60;
const rotateFrames = [];
const rotateAnim = new Animation(
  "rotateAnim",
  "rotation.z",
  fps,
  Animation.ANIMATIONTYPE_FLOAT,
  Animation.ANIMATIONLOOPMODE_CYCLE
);
rotateFrames.push({ frame: 0, value: 0 });
rotateFrames.push({ frame: 180, value: Math.PI / 2 });
rotateAnim.setKeys(rotateFrames);
this.target.animations.push(rotateAnim);

// 循环播放所有动画
// this.scene.beginAnimation(this.target, 0, 180, true);
// 循环播放数组中的动画
const AnimationControll = this.scene.beginDirectAnimation(
  this.target,
  [rotateAnim, sliderAnim],
  0,
  180,
  true,
  1,
  onAnimationEnd
);

const onAnimationEnd = () => {
  console.log("animationEnd");
  this.target.setEnabled(false);
};
```

#### 等待动画的调用

```js
await this.scene
  .beginDirectAnimation(this.target, [fadesAnim], 0, 180)
  .waitAsync();
AnimationControll.stop();
```

#### 导入带有动画的模型

```js
const { meshes, animationGroups } = await SceneLoader.ImportMeshAsync(
  "",
  "./Model/",
  "jiangShi.glb",
  this.scene
);
// 旋转模型
meshes[0].rotate(Vector3.Up(), Math.PI);
// 停止默认动画
animationGroups[0].stop();
// 播放动画(true:循环播放)
animationGroups[0].play(true);
```

#### 场景动画

```js
 // 转场动画
  async CreateCutsence(scene: Scene): Promise<void> {
    const canKeys = [];
    const fps = 60;
    const carAnim = new Animation(
      "carAnim",
      "position",
      fps,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );
    canKeys.push({ frame: 0, value: new Vector3(3, 2, -3) });
    canKeys.push({ frame: 5 * fps, value: new Vector3(-3, 2, -3) });
    canKeys.push({ frame: 3 * fps, value: new Vector3(-3, 2, -3) });
    canKeys.push({ frame: 12 * fps, value: new Vector3(0, 3, -13) });
    carAnim.setKeys(canKeys);
    this.camera.animations.push(carAnim);
    await scene.beginAnimation(this.camera, 0, 12 * fps).waitAsync();
    this.CutsenceEnd();
  }
  CutsenceEnd(): void {
    this.camera.attachControl();
    // 停止默认动画
    this.animationGroups[1].stop();
    // 播放动画(true:循环播放)
    this.animationGroups[2].play(true);
  }
```

#### 动画解析,给第 n 帧添加触发事件

```js
const attactAnim = animationGroups[1].targetedAnimations[0].animation;
// 第50帧触发的事件
const attactEvent = new AnimationEvent(
  50,
  () => {
    // 第50帧触发事件
    this.animationGroups[0].stop();
    this.animationGroups[2].play(true);
  },
  false
);
// 给解析动画添加事件
attactAnim.addEvent(attactEvent);
```

#### 模型上的多动画渐变

```js
//  通过设置权重达到一个动画切换渐变效果 // 没有成功
  *animationBlending(
    toAnim: AnimationGroup,
    fromAnim: AnimationGroup
  ): AsyncCoroutine<void> {
    let currentWeight = 1;
    let newWeight = 0;
    toAnim.play(true);
    while (newWeight < 1) {
      newWeight += 0.01;
      currentWeight -= 0.01;
      toAnim.setWeightForAllAnimatables(newWeight);
      fromAnim.setWeightForAllAnimatables(currentWeight);
      yield;
    }
  }

  this.scene.onPointerDown = () => {
      this.scene.onBeforeRenderObservable.runCoroutineAsync(
        this.animationBlending(run, idle)
      );
    };
```

### 背景音乐

#### 设置背景音乐\自动播放\播放声音

```js
// 设置背景音乐,和自动播放,和播放声音
const backgroundMusic = new Sound(
  "backgroundMusic",
  "./mp3/Letting.mp3",
  this.scene,
  null,
  {
    volume: 0,
    autoplay: true,
  }
);
// 30秒,音量从0渐变道0.75
backgroundMusic.setVolume(0.75, 30);
```

#### 设置背景音乐,固定在目标位置

```js
// 设置背景音乐,固定在目标位置
const backgroundMusic = new Sound(
  "backgroundMusic",
  "./mp3/Letting.mp3",
  this.scene,
  null,
  {
    spatialSound: true, //离目标越近,声音越大
    maxDistance: 10, // 最远距离为10
    volume: 1,
    autoplay: true,
  }
);
// 绑定在模型上,可以跟随模型移动
// backgroundMusic.attachToMesh(this.models[0]);
// 设置在某个固定位置上
backgroundMusic.setPosition(new Vector3(-7, 0, 0));
// 设置播放速度 1为默认值
backgroundMusic.setPlaybackRate(1);
// 判断是否正在播放
// backgroundMusic.isPlaying
// 主动播放音乐
scene.onPointerDown = (evt) => {
  if (evt.button === 2) backgroundMusic.pause();
  if (evt.button === 1) backgroundMusic.play();
};
```

# 注意事项

### 导入模型时,需要引入@babylonjs/loader

```js
否则 SceneLoader.ImportMesh()会报错
```

### 制作带动画的模型

```js
// 使用kenney下载模型
// 在mixamo导入kenney模型并选择动画下载,调整下载参数
// 在blender中导入kenney模型,并选择着色器,
// 选择添加图片纹理,调整参数(环境色为黑色,阿尔法通道为1,roughness为1)
// 导入mixamo动画,然后重命名,再删除
// 统一为模型添加导入的动画
// 导出glb文件可用
```

#### ammojs 问题 @1.0.6

```js
// 修改最后一句 this.Ammo = b ==> Ammo = b
const ammo = await Ammo();
const phyics = new AmmoJSPlugin(true, ammo);
scene.enablePhysics(new Vector3(0, -9.81, 0), phyics);
```
