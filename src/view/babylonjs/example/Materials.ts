import {
  Scene,
  Engine,
  Vector3,
  FreeCamera,
  HemisphericLight,
  MeshBuilder,
  StandardMaterial,
  Texture,
} from "@babylonjs/core";

export class BasicSence {
  scene: Scene;
  engine: Engine;

  constructor(private canvas: HTMLCanvasElement) {
    this.engine = new Engine(this.canvas, true);
    this.scene = this.CreateSence();
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
    hemLight.intensity = 4;

    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: 10, height: 10 },
      this.scene
    );

    const ball = MeshBuilder.CreateSphere("ball", { diameter: 1 }, this.scene);
    ball.position = new Vector3(0, 1, 0);

    ground.material = this.CreateGroundMaterials();
    ball.material = this.CreateBallMaterials();
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
    // diffuseTex.uScale = 4;
    // diffuseTex.vScale = 4;
    texArry.forEach((tex) => {
      tex.uScale = uvScale;
      tex.vScale = uvScale;
    });

    return groundMat;
  }
  CreateBallMaterials(): StandardMaterial {
    const ballMat = new StandardMaterial("ballMat", this.scene);
    const uvScale = 2;
    const texArry: Texture[] = [];
    const diffuseTex = new Texture(
      "./Materials/Ball/metal_plate_diff_1k.png",
      this.scene
    );

    texArry.push(diffuseTex);
    ballMat.diffuseTexture = diffuseTex;
    const normalTex = new Texture(
      "./Materials/Ball/metal_plate_nor_gl_1k.png",
      this.scene
    );
    texArry.push(normalTex);
    ballMat.bumpTexture = normalTex;
    // 反转凹凸纹理
    ballMat.invertNormalMapX = true;
    ballMat.invertNormalMapY = true;

    const aoTex = new Texture(
      "./Materials/Ball/metal_plate_ao_1k.png",
      this.scene
    );
    texArry.push(aoTex);
    ballMat.ambientTexture = aoTex;
    const specTex = new Texture(
      "./Materials/Ball/metal_plate_spec_1k.png",
      this.scene
    );
    texArry.push(specTex);
    ballMat.specularTexture = specTex;
    // 调整贴图的密度尺寸
    // diffuseTex.uScale = 4;
    // diffuseTex.vScale = 4;
    texArry.forEach((tex) => {
      tex.uScale = uvScale;
      tex.vScale = uvScale;
    });

    return ballMat;
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
