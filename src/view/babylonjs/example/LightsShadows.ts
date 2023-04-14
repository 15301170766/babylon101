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
} from "@babylonjs/core";
import "@babylonjs/loaders";

export class BasicSence {
  scene: Scene;
  engine: Engine;
  lightTubes!: AbstractMesh[];
  models!: AbstractMesh[];
  ball!: AbstractMesh;
  shadowGen!: ShadowGenerator;

  constructor(private canvas: HTMLCanvasElement) {
    this.engine = new Engine(this.canvas, true);
    this.scene = this.CreateSence();
    this.CreateBarrel().then((meshs) => {
      meshs[0].receiveShadows = true;
      this.shadowGen.addShadowCaster(meshs[0]);
      meshs[0].scaling = new Vector3(3, 3, 3);
      meshs[0].position = new Vector3(0, 0, 0);
    });
    this.run();
  }
  CreateSence(): Scene {
    const scene = new Scene(this.engine);

    const camera = new ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 2.5,
      10,
      new Vector3(0, 0, 0),
      scene
    );
    camera.attachControl();
    camera.speed = 0.1;

    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: 10, height: 10 },
      this.scene
    );
    ground.material = this.CreateGroundMaterials();

    const ball = MeshBuilder.CreateSphere(
      "ball",
      { diameter: 1.5 },
      this.scene
    );
    ball.position = new Vector3(0, 2, -3);
    this.ball = ball;
    this.CreateWall();
    // // 加入发光层,有辉光
    // const glowLayer = new GlowLayer("glow", this.scene);
    // glowLayer.intensity = 1;

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

    this.CreateLights();

    return scene;
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

  CreateLights(): void {
    // const hemLight = new HemisphericLight(
    //   "hemLight",
    //   new Vector3(0, 1, 0),
    //   this.scene
    // );
    // hemLight.intensity = 1;
    // hemLight.diffuse = new Color3(1, 0, 0); // 给灯光加颜色
    // hemLight.groundColor = new Color3(0, 0, 1); // 地面光,可营造渐变日落场景色
    // hemLight.specular = new Color3(0, 1, 0); // 模型上显示的反射光、色彩

    // 有方向的光
    // const directionalLight = new DirectionalLight(
    //   "dirLight",
    //   new Vector3(0, -1, 1),
    //   this.scene
    // );

    // 点光源
    // const pointLight = new PointLight(
    //   "pointLight",
    //   new Vector3(0, -0.2, 0),
    //   this.scene
    // );
    // pointLight.diffuse = new Color3(172 / 255, 246 / 255, 183 / 255);
    // pointLight.intensity = 0.4;
    // pointLight.parent = this.lightTubes[0];

    // 克隆一个灯光
    // const pointClone = pointLight.clone("pointClone") as PointLight;
    // 重新设置父级
    //pointClone.parent = this.lightTubes[newIndex];

    // 聚光灯

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
    spotLight.shadowMinZ = 1;
    spotLight.shadowMaxZ = 10;
    const shadowGen = new ShadowGenerator(2048, spotLight);
    shadowGen.useBlurCloseExponentialShadowMap = true; // 阴影模糊,需要搭配shadowMinZ来使用
    this.shadowGen = shadowGen;
    this.ball.receiveShadows = true;
    shadowGen.addShadowCaster(this.ball);
    this.models.map((mesh) => {
      mesh.receiveShadows = true;
      shadowGen.addShadowCaster(mesh);
    });
    // this.CreateGizoms(hemLight);
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
    this.shadowGen.addShadowCaster(meshes[0]);
    meshes[0].rotation = new Vector3(-Math.PI / 4, Math.PI / 2, 0);
    meshes[0].scaling = new Vector3(2, 2, 2);
    meshes[0].position = new Vector3(4.8, 3, 1);
    this.lightTubes = meshes.filter(
      (mesh) => mesh.name === "geo_lamp-head_primitive0"
    );

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
