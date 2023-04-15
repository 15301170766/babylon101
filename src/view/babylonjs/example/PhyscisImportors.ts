import {
  Scene,
  Engine,
  Vector3,
  FreeCamera,
  HemisphericLight,
  MeshBuilder,
  CubeTexture,
  SceneLoader,
  Texture,
  StandardMaterial,
  SubMesh,
  ArcRotateCamera,
  AbstractMesh,
  GlowLayer,
  Color3,
  Light,
  LightGizmo,
  GizmoManager,
  DirectionalLight,
  PointLight,
  SpotLight,
  ShadowGenerator,
  CannonJSPlugin,
  PhysicsImpostor,
} from "@babylonjs/core";
import "@babylonjs/loaders";
import * as CANNON from "cannon";

export class BasicSence {
  scene: Scene;
  engine: Engine;
  lightTubes!: AbstractMesh[];
  models!: AbstractMesh[];
  ball!: AbstractMesh;
  ground!: AbstractMesh;
  shadowGen!: ShadowGenerator;

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
      this.CreateImportors();
    });
    this.run();
  }
  CreateSence(): Scene {
    const scene = new Scene(this.engine);
    this.CreateCamera();
    this.CreateLights(scene);
    this.CreateBall();
    this.CreateGround();
    this.CreateWall();
    this.CreateSideLight().then((res) => {
      const pointLight = new PointLight(
        "pointLight",
        new Vector3(0, -0.2, 0),
        this.scene
      );
      pointLight.diffuse = new Color3(172 / 255, 246 / 255, 183 / 255);
      pointLight.intensity = 0.4;
      pointLight.parent = this.lightTubes[0];
    });
    return scene;
  }
  CreateLights(scene: Scene): void {
    const hemLight = new HemisphericLight(
      "hemLight",
      new Vector3(0, 1, 0),
      this.scene
    );
    scene.collisionsEnabled = true; // 开启碰撞检测
    // 场景添加重力和物理反弹效果
    scene.enablePhysics(
      new Vector3(0, -9.81, 0),
      new CannonJSPlugin(true, 10, CANNON)
    );
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
    // // 设置WASD 来控制上下左右
    // camera.keysUp.push(87);
    // camera.keysDown.push(65);
    // camera.keysLeft.push(83);
    // camera.keysRight.push(68);
  }
  CreateGround(): void {
    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: 10, height: 10 },
      this.scene
    );
    ground.checkCollisions = true; //开启碰撞检测
    ground.material = this.CreateGroundMaterials();
    this.ground = ground;
  }

  CreateImportors(): void {
    this.ball.physicsImpostor = new PhysicsImpostor(
      this.ball,
      PhysicsImpostor.BoxImpostor,
      {
        mass: 1, // 物体质量 不可移动的物体可以设置为0
        friction: 0.001, // 物体摩擦力
        restitution: 0.5, // 碰撞恢复
      }
    );
    // this.ground.isVisible = false; // 可是设置物体是否可见
    // this.ground.visibility = 1; // 可是设置物体透明度
    this.ground.physicsImpostor = new PhysicsImpostor(
      this.ground,
      PhysicsImpostor.BoxImpostor,
      {
        mass: 0, // 物体质量
        friction: 0.1, // 物体摩擦力
        restitution: 0.5, // 碰撞恢复
      }
    );

    const box = MeshBuilder.CreateBox(
      "box",
      { width: 0.4, height: 0.4 },
      this.scene
    );
    box.position = new Vector3(0.2, 5, -3);
    box.physicsImpostor = new PhysicsImpostor(
      box,
      PhysicsImpostor.BoxImpostor,
      {
        mass: 1, // 物体质量
        friction: 0.1, // 物体摩擦力
        restitution: 0.5, // 碰撞恢复
      }
    );
  }
  CreateBall(): void {
    const ball = MeshBuilder.CreateSphere(
      "ball",
      { diameter: 0.5 },
      this.scene
    );
    ball.position = new Vector3(0, 3, -3);
    this.ball = ball;
    ball.checkCollisions = true; //开启碰撞检测
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

  // 加载侧栏灯
  async CreateSideLight(): Promise<void> {
    // ImportMeshAsync;
    // 此处需要引入loader 否则会报错
    const { meshes } = await SceneLoader.ImportMeshAsync(
      "",
      "./Model/",
      "desk_lamp_arm_01_1k.glb",
      this.scene
    );
    meshes[0].receiveShadows = true;
    meshes[0].rotation = new Vector3(-Math.PI / 4, Math.PI / 2, 0);
    meshes[0].scaling = new Vector3(2, 2, 2);
    meshes[0].position = new Vector3(4.8, 3, 1);
    this.lightTubes = meshes.filter(
      (mesh) => mesh.name === "geo_lamp-head_primitive0"
    );
    meshes.map((mesh) => {
      mesh.checkCollisions = true; //开启碰撞检测
    });

    console.log(this.lightTubes);
    // meshes[0].translate
  }
  // 可拖拽动光的小工具
  CreateGizoms(customLight: Light): void {
    const lightGizmo = new LightGizmo();
    lightGizmo.scaleRatio = 2;
    lightGizmo.light = customLight;

    const gizmoManager = new GizmoManager(this.scene);
    gizmoManager.positionGizmoEnabled = true;
    gizmoManager.rotationGizmoEnabled = true;
    gizmoManager.usePointerToAttachGizmos = false;
    gizmoManager.attachToMesh(lightGizmo.attachedMesh);
  }

  debug(debugOn: boolean = true) {
    if (debugOn) {
      this.scene.debugLayer.show({ overlay: true });
    } else {
      this.scene.debugLayer.hide();
    }
  }

  run() {
    // this.debug(true);
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }
}
