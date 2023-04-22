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

  constructor(private canvas: HTMLCanvasElement) {
    this.engine = new Engine(this.canvas, true);
    this.scene = this.CreateSence();
    this.CreateBarrel().then((meshs) => {
      meshs.map((mesh) => {
        mesh.checkCollisions = true; //开启碰撞检测
      });
      meshs[0].receiveShadows = true;
      meshs[0].scaling = new Vector3(2, 2, 2);
      meshs[0].position = new Vector3(-2, 0, 0);
    });
    this.run();
  }
  CreateSence(): Scene {
    const scene = new Scene(this.engine);

    this.CreateCamera();
    this.CreateLights(scene);

    this.CreateGround();
    this.CreatePhysics(scene);
    this.CreateSideLight();
    return scene;
  }
  // 加载旋转模型
  async CreateSideLight(): Promise<void> {
    // ImportMeshAsync;
    // 此处需要引入loader 否则会报错
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

    this.CreateAnimations();
  }
  CreateAnimations(): void {
    const fps = 60;
    const rotateFrames = [];
    const slideFrames = [];
    const fadesFrames = [];
    const rotateAnim = new Animation(
      "rotateAnim",
      "rotation.z",
      fps,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );
    const sliderAnim = new Animation(
      "sliderAnim",
      "position",
      fps,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );
    const fadesAnim = new Animation(
      "sliderAnim",
      "visibility",
      fps,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );

    rotateFrames.push({ frame: 0, value: 0 });
    rotateFrames.push({ frame: 180, value: Math.PI / 2 });

    slideFrames.push({ frame: 0, value: new Vector3(0, 2, 0) });
    slideFrames.push({ frame: 45, value: new Vector3(-3, 0, 0) });
    slideFrames.push({ frame: 90, value: new Vector3(0, 2, 0) });
    slideFrames.push({ frame: 135, value: new Vector3(3, 0, 0) });
    slideFrames.push({ frame: 180, value: new Vector3(0, 2, 0) });

    fadesFrames.push({ frame: 0, value: 1 });
    fadesFrames.push({ frame: 180, value: 0 });

    rotateAnim.setKeys(rotateFrames);
    sliderAnim.setKeys(slideFrames);
    fadesAnim.setKeys(fadesFrames);
    this.target.animations.push(rotateAnim);
    this.target.animations.push(sliderAnim);
    this.target.animations.push(fadesAnim);

    const onAnimationEnd = () => {
      console.log("animationEnd");
      this.target.setEnabled(false);
    };

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

    this.scene.onPointerDown = async () => {
      await this.scene
        .beginDirectAnimation(this.target, [fadesAnim], 0, 180)
        .waitAsync();
      AnimationControll.stop();
    };
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
    camera.attachControl();
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
