import {
  Scene,
  Engine,
  Vector3,
  CubeTexture,
  SceneLoader,
  ArcRotateCamera,
  AbstractMesh,
  ActionManager,
  SetValueAction,
  InterpolateValueAction,
  IncrementValueAction,
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
    const camera = new ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 2.5,
      10,
      new Vector3(0, 0, 0),
      this.scene
    );
    camera.attachControl();
    camera.speed = 0.01;
    camera.minZ = 0.01; // 可以近距离观察模型
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
    // this.camera.setTarget(models.meshes[1]); // 设置相机目标

    console.log(models);
    this.CreateActions(models.meshes);
  }
  CreateActions(meshes: AbstractMesh[]): void {
    let models = meshes[2];
    models.actionManager = new ActionManager(this.scene); // 注册事件管理
    // 绑定事件
    models.actionManager.registerAction(
      new SetValueAction(
        ActionManager.OnPickDownTrigger, // 点击事件
        models,
        "scaling",
        new Vector3(3, 3, 3)
      )
    );
    // models.actionManager = new ActionManager(this.scene); // 注册事件管理
    // // 绑定事件
    // models.actionManager
    //   .registerAction(
    //     new InterpolateValueAction(
    //       ActionManager.OnPickDownTrigger, // 点击事件
    //       models,
    //       "roughness",
    //       0,
    //       3000
    //     )
    //   )!
    //   .then(
    //     // 再次点击事件
    //     new InterpolateValueAction(
    //       ActionManager.NothingTrigger,
    //       models,
    //       "roughness",
    //       1,
    //       3000
    //     )
    //   );

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
