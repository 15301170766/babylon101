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
    this.CreateTextures();
    this.CreatePickingRay();
    this.run();
  }
  CreateSence(): Scene {
    const scene = new Scene(this.engine);

    this.CreateCamera();
    this.CreateLights(scene);

    this.CreateGround();
    this.CreatePhysics(scene);

    // scene.onPointerDown = (evt) => {
    //   if (evt.button === 2) {
    //     this.ShootCannonBall();
    //   }
    // };
    return scene;
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
    this.CreateCannonBall();
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
    this.CreateImpulse();
  }
  CreateImpulse(): void {
    const box = MeshBuilder.CreateBox("boxBox", { height: 4 }, this.scene);
    const baxMat = new PBRMaterial("boxmat", this.scene);
    baxMat.roughness = 1;
    baxMat.albedoColor = new Color3(1, 0.5, 0);
    box.material = baxMat;
    box.physicsImpostor = new PhysicsImpostor(
      box,
      PhysicsImpostor.BoxImpostor,
      {
        mass: 0.5, // 物体质量
        friction: 1, // 物体摩擦力
      }
    );

    // box.actionManager = new ActionManager(this.scene); // 注册事件
    // box.actionManager.registerAction(
    //   new ExecuteCodeAction(ActionManager.OnPickDownTrigger, () => {
    //     box.physicsImpostor?.applyImpulse(
    //       new Vector3(-3, 0, 0),
    //       box.getAbsolutePosition().add(new Vector3(0, 2, 0)) // 通过点击在相对位置添加一个力// add为追加方向力
    //     );
    //   })
    // );
  }
  CreateCannonBall(): void {
    this.cannonBall = MeshBuilder.CreateSphere(
      "cannonBall",
      { diameter: 0.5 },
      this.scene
    );
    const ballMat = new PBRMaterial("boxmat", this.scene);
    ballMat.roughness = 1;
    ballMat.albedoColor = new Color3(5, 0.5, 0);
    this.cannonBall.material = ballMat;
    this.cannonBall.position = new Vector3(0, 3, -3);

    this.cannonBall.physicsImpostor = new PhysicsImpostor(
      this.cannonBall,
      PhysicsImpostor.BoxImpostor,
      {
        mass: 1, // 物体质量 不可移动的物体可以设置为0
        friction: 1, // 物体摩擦力
      }
    );

    this.cannonBall.position = this.camera.position;
    this.cannonBall.setEnabled(false);
  }

  CreateTextures(): void {
    const blue = new PBRMaterial("blue", this.scene);
    const yellow = new PBRMaterial("yellow", this.scene);
    const red = new PBRMaterial("red", this.scene);

    blue.roughness = 1;
    yellow.roughness = 1;
    red.roughness = 1;

    // 设置纹理
    blue.albedoTexture = new Texture("./textures/a.png", this.scene);
    yellow.albedoTexture = new Texture("./textures/b.png", this.scene);
    red.albedoTexture = new Texture("./textures/c.png", this.scene);

    blue.albedoTexture.hasAlpha = true;
    yellow.albedoTexture.hasAlpha = true;
    red.albedoTexture.hasAlpha = true;

    blue.zOffset = -0.25;
    yellow.zOffset = -0.25;
    red.zOffset = -0.25;
    this.splatters = [blue, yellow, red];
  }

  CreatePickingRay(): void {
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
  }

  ShootCannonBall(): void {
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
  }
  run() {
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }
}
