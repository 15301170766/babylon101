import {
  Scene,
  Engine,
  Vector3,
  FreeCamera,
  HemisphericLight,
  MeshBuilder,
  CubeTexture,
  SceneLoader,
} from "@babylonjs/core";
import "@babylonjs/loaders";
export class BasicSence {
  scene: Scene;
  engine: Engine;

  constructor(private canvas: HTMLCanvasElement) {
    this.engine = new Engine(this.canvas, true);
    this.scene = this.CreateSence();
    this.CreateBarrel();

    this.run();
  }
  CreateSence(): Scene {
    const scene = new Scene(this.engine);
    const camera = new FreeCamera("camera", new Vector3(0, 1, -5));
    camera.attachControl();
    camera.speed = 0.25;

    const hemLight = new HemisphericLight(
      "hemLight",
      new Vector3(0, 1, 0),
      this.scene
    );
    hemLight.intensity = 0.5;

    const envTex = CubeTexture.CreateFromPrefilteredData(
      "./environment/outDoor2.env",
      scene
    );
    scene.environmentTexture = envTex;
    scene.createDefaultSkybox(envTex, true);
    scene.environmentIntensity = 0.25; // 环境光强度
    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: 10, height: 10 },
      this.scene
    );

    return scene;
  }

  async CreateBarrel(): Promise<void> {
    // ImportMeshAsync;
    // 此处需要引入loader 否则会报错
    const models = await SceneLoader.ImportMeshAsync(
      "",
      "./Model/",
      "Barrel_01_2k.glb",
      this.scene
    );

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
