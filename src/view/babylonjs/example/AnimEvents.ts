import {
  Scene,
  Engine,
  Vector3,
  FreeCamera,
  HemisphericLight,
  MeshBuilder,
  SceneLoader,
  Texture,
  StandardMaterial,
  AbstractMesh,
  Color3,
  PBRMaterial,
  ShadowGenerator,
  PhysicsImpostor,
  Mesh,
  AmmoJSPlugin,
  Matrix,
  PickingInfo,
  Animation,
  IAnimationKey,
  AnimationGroup,
  AnimationEvent,
} from "@babylonjs/core";
import "@babylonjs/loaders";
import { Ammo } from "../plugin/ammojs";

export class BasicSence {
  scene: Scene;
  engine: Engine;
  lightTubes!: AbstractMesh[];
  models!: AbstractMesh[];
  ball!: AbstractMesh;
  ground!: AbstractMesh;
  shadowGen!: ShadowGenerator;
  cannonBall!: Mesh;
  camera!: FreeCamera;
  splatters!: PBRMaterial[];
  target!: AbstractMesh;
  animationGroups!: AnimationGroup[];

  constructor(private canvas: HTMLCanvasElement) {
    this.engine = new Engine(this.canvas, true);
    this.scene = this.CreateSence();
    this.run();
  }
  CreateSence(): Scene {
    const scene = new Scene(this.engine);

    this.CreateCamera();
    this.CreateLights(scene);

    this.CreateGround();
    this.CreatePhysics(scene);
    this.CreateCharacter2();
    this.CreateCharacter(scene);
    // this.CreateCutsence(scene);

    return scene;
  }
  async CreateCharacter(scene: Scene): Promise<void> {
    // 使用kenney下载模型
    // 在mixamo导入kenney模型并选择动画下载,调整下载参数
    // 在blender中导入kenney模型,并选择着色器,
    // 选择添加图片纹理,调整参数(环境色为黑色,阿尔法通道为1,roughness为1)
    // 导入mixamo动画,然后重命名,再删除
    // 统一为模型添加导入的动画
    // 导出glb文件可用
    // ImportMeshAsync;
    // 此处需要引入loader 否则会报错
    const { meshes, animationGroups } = await SceneLoader.ImportMeshAsync(
      "",
      "./Model/",
      "jiangShi.glb",
      this.scene
    );
    // 旋转模型
    meshes[0].rotate(Vector3.Up(), -Math.PI / 2);
    meshes[0].position.x = 3;
    // 停止默认动画
    animationGroups[0].stop();
    // 播放动画(true:循环播放)
    animationGroups[0].play(true);

    // 注册动画解析
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
    scene.onPointerDown = () => {
      animationGroups[1].play(true);
    };
  }
  async CreateCharacter2(): Promise<void> {
    const { meshes, animationGroups } = await SceneLoader.ImportMeshAsync(
      "",
      "./Model/",
      "jiangShi2.glb",
      this.scene
    );
    // 旋转模型
    meshes[0].rotate(Vector3.Up(), Math.PI / 2);
    meshes[0].position.x = -3;

    this.animationGroups = animationGroups;
    // 停止默认动画
    this.animationGroups[0].stop();
    // 播放动画(true:循环播放)
    this.animationGroups[0].play(true);
  }
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

  CreateLights(scene: Scene): void {
    const hemLight = new HemisphericLight(
      "hemLight",
      new Vector3(0, 1, 0),
      this.scene
    );
    scene.collisionsEnabled = true; // 开启碰撞检测
  }
  CreateCamera(): void {
    const camera = new FreeCamera("camera", new Vector3(0, 3, -13), this.scene);

    camera.minZ = 0.3; // 靠近物体的最小距离,防止穿模型
    camera.speed = 0.1; // 相机运动的速度
    camera.angularSensibility = 8000; // 相机旋转速度,越大越慢
    // camera.applyGravity = true; // 相机添加重力
    camera.checkCollisions = true; // 相机添加碰撞检测
    camera.ellipsoid = new Vector3(1, 1, 1); // 将相机视为”长宽高为1“的一个椭圆物体
    this.camera = camera;
  }
  CreateGround(): void {
    this.ground = MeshBuilder.CreateGround(
      "ground",
      { width: 10, height: 10 },
      this.scene
    );
    this.ground.checkCollisions = true; //开启碰撞检测
    this.ground.material = this.CreateGroundMaterials();
  }
  async CreatePhysics(scene: Scene): Promise<void> {
    const ammo = await Ammo();
    const phyics = new AmmoJSPlugin(true, ammo);
    scene.enablePhysics(new Vector3(0, -9.81, 0), phyics);
    this.CreateImportors();
    this.CreateWall();
  }
  CreateImportors(): void {
    this.ground.physicsImpostor = new PhysicsImpostor(
      this.ground,
      PhysicsImpostor.BoxImpostor,
      {
        mass: 0, // 物体质量
        friction: 0.1, // 物体摩擦力
        restitution: 0.5, // 碰撞恢复
      }
    );
  }
  CreateGroundMaterials(): StandardMaterial {
    const groundMat = new StandardMaterial("groundMat", this.scene);
    const uvScale = 4;
    const texArry: Texture[] = [];
    const diffuseTex = new Texture(
      "./Materials/Road/grassy_cobblestone_diff_1k.png",
      this.scene
    );

    texArry.push(diffuseTex);
    groundMat.diffuseTexture = diffuseTex;

    const normalTex = new Texture(
      "./Materials/Road/grassy_cobblestone_nor_gl_1k.png",
      this.scene
    );
    texArry.push(normalTex);
    groundMat.bumpTexture = normalTex;
    groundMat.invertNormalMapX = true;
    groundMat.invertNormalMapY = true;

    const aoTex = new Texture(
      "./Materials/Road/grassy_cobblestone_ao_1k.png",
      this.scene
    );
    texArry.push(aoTex);
    groundMat.ambientTexture = aoTex;
    const specTex = new Texture(
      "./Materials/Road/grassy_cobblestone_rough_1k.png",
      this.scene
    );
    texArry.push(specTex);
    groundMat.specularTexture = specTex;
    // 调整贴图的密度尺寸
    texArry.forEach((tex) => {
      tex.uScale = uvScale;
      tex.vScale = uvScale;
    });

    return groundMat;
  }
  CreateWallMaterials(): StandardMaterial {
    const wallMat = new StandardMaterial("wallMat", this.scene);
    const uvScale = 1;
    const texArry: Texture[] = [];
    const diffuseTex = new Texture(
      "./Materials/Wall/brick_wall_04_diff_1k.png",
      this.scene
    );

    wallMat.diffuseTexture = diffuseTex;
    texArry.push(diffuseTex);
    const normalTex = new Texture(
      "./Materials/Wall/brick_wall_04_nor_gl_1k.png",
      this.scene
    );
    texArry.push(normalTex);
    wallMat.bumpTexture = normalTex;
    wallMat.invertNormalMapX = true;
    wallMat.invertNormalMapY = true;

    const aoTex = new Texture(
      "./Materials/Wall/brick_wall_04_ao_1k.png",
      this.scene
    );
    wallMat.ambientTexture = aoTex;
    texArry.push(aoTex);
    const specTex = new Texture(
      "./Materials/Wall/brick_wall_04_rough_1k.png",
      this.scene
    );
    wallMat.specularTexture = specTex;
    texArry.push(specTex);

    // 调整贴图的密度尺寸
    texArry.forEach((tex) => {
      tex.uScale = uvScale;
      tex.vScale = uvScale;
    });
    return wallMat;
  }
  // 创建三面墙
  CreateWall() {
    const box = MeshBuilder.CreateBox(
      "box",
      {
        width: 10,
        height: 6,
        depth: 0.3,
      },
      this.scene
    );
    box.position = new Vector3(0, 3, 4);
    box.material = this.CreateWallMaterials();

    const boxLeft = box.clone("boxLeft");
    boxLeft.position = new Vector3(-5, 3, 0);
    boxLeft.rotation.y = Math.PI / 2;

    const boxRight = box.clone("boxRight");
    boxRight.position = new Vector3(5, 3, 0);
    boxRight.rotation.y = Math.PI / 2;
    this.models = [];
    this.models.push(box);
    this.models.push(boxLeft);
    this.models.push(boxRight);
    box.checkCollisions = true; //开启碰撞检测
    boxLeft.checkCollisions = true; //开启碰撞检测
    boxRight.checkCollisions = true; //开启碰撞检测
    box.physicsImpostor = new PhysicsImpostor(
      box,
      PhysicsImpostor.BoxImpostor,
      {
        mass: 0, // 物体质量
        friction: 0, // 物体摩擦力
        restitution: 0.5, // 碰撞恢复
      }
    );
    boxLeft.physicsImpostor = new PhysicsImpostor(
      boxLeft,
      PhysicsImpostor.BoxImpostor,
      {
        mass: 0, // 物体质量
        friction: 0, // 物体摩擦力
        restitution: 0.5, // 碰撞恢复
      }
    );
    boxRight.physicsImpostor = new PhysicsImpostor(
      boxRight,
      PhysicsImpostor.BoxImpostor,
      {
        mass: 0, // 物体质量
        friction: 0, // 物体摩擦力
        restitution: 0.5, // 碰撞恢复
      }
    );
  }

  async CreateBarrel(): Promise<AbstractMesh[]> {
    // ImportMeshAsync;
    // 此处需要引入loader 否则会报错
    const { meshes } = await SceneLoader.ImportMeshAsync(
      "",
      "./Model/",
      "Barrel_01_2k.glb",
      this.scene
    );

    return meshes;
  }

  run() {
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }
}
