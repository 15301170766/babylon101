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
  ActionManager,
  IncrementValueAction,
} from "@babylonjs/core";
import "@babylonjs/loaders";
import * as CANNON from "cannon";

export class BasicSence {
  scene: Scene;
  engine: Engine;
  camera!: FreeCamera;
  ball!: AbstractMesh;
  ground!: AbstractMesh;

  constructor(private canvas: HTMLCanvasElement) {
    this.engine = new Engine(this.canvas, true);
    this.scene = this.CreateSence();
    this.CreateGarden();
    this.run();
  }
  CreateSence(): Scene {
    const scene = new Scene(this.engine);
    this.CreateCamera();
    this.CreateLights(scene);
    this.CreateGround();
    this.CreateImportors();
    this.CreateWall();
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
    this.camera = camera;
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
  }

  async CreateGarden(): Promise<AbstractMesh[]> {
    const { meshes } = await SceneLoader.ImportMeshAsync(
      "",
      "./Model/",
      "garden_gnome_2k.glb",
      this.scene
    );
    meshes[0].scaling = new Vector3(3, 3, 3);
    // meshes[0].position.y = 2;

    const rocketCol = MeshBuilder.CreateBox(
      "rocketCol",
      { width: 1, height: 1.4, depth: 1 },
      this.scene
    );
    rocketCol.visibility = 0;
    rocketCol.position.y = 0.7;

    rocketCol.physicsImpostor = new PhysicsImpostor(
      rocketCol,
      PhysicsImpostor.BoxImpostor,
      {
        mass: 1, // 物体质量
      }
    );

    meshes[0].setParent(rocketCol); // 设置模型的上级
    rocketCol.rotate(Vector3.Forward(), 1.5); // 角度倾斜
    const rocketPhysics = () => {
      this.camera.position = new Vector3(
        rocketCol.position.x,
        rocketCol.position.y,
        this.camera.position.z
      ); // 相机跟踪
      rocketCol.physicsImpostor!.setLinearVelocity(rocketCol.up.scale(5)); // 模型移动
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
    return meshes;
  }
  run() {
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }
}
