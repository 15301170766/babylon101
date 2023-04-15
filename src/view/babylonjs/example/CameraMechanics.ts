import {
  Scene,
  Engine,
  Vector3,
  FreeCamera,
  HemisphericLight,
  MeshBuilder,
  StandardMaterial,
  Texture,
  CubeTexture,
  PBRMaterial,
  Color3,
  GlowLayer,
  SceneLoader,
  ArcRotateCamera,
} from "@babylonjs/core";
import "@babylonjs/loaders";
export class BasicSence {
  scene: Scene;
  engine: Engine;
  camera!: ArcRotateCamera;

  constructor(private canvas: HTMLCanvasElement) {
    this.engine = new Engine(this.canvas, true);
    this.scene = this.CreateSence();
    this.run();
  }
  CreateSence(): Scene {
    const scene = new Scene(this.engine);
    this.CreateCamera();

    const envTex = CubeTexture.CreateFromPrefilteredData(
      "./environment/roomLight.env",
      scene
    );
    scene.environmentTexture = envTex;
    scene.createDefaultSkybox(envTex, true, 1000, 0.25);
    scene.environmentIntensity = 1; // 环境光强度

    this.CreateClock();

    return scene;
  }
  CreateCamera(): void {
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

    this.camera.framingBehavior!.radiusScale = 2; // 相机观看模型的limit
    this.camera.framingBehavior!.framingTime = 4000; // 相机观看模型limit过度时间

    // this.camera.speed = 0.25;
  }
  async CreateClock(): Promise<void> {
    // ImportMeshAsync;
    // 此处需要引入loader 否则会报错
    const models = await SceneLoader.ImportMeshAsync(
      "",
      "./Model/",
      "vintage_pocket_watch_1k.glb",
      this.scene
    );
    models.meshes[0].scaling = new Vector3(20, 20, 20);
    // models.meshes[1].showBoundingBox = true; // 可以查看模型边界线
    this.camera.setTarget(models.meshes[1]); // 设置相机目标

    console.log(models);
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
