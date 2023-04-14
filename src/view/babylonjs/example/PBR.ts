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
    const ball = MeshBuilder.CreateSphere("ball", { diameter: 1 }, this.scene);
    ball.position = new Vector3(0, 1, 0);
    ground.material = this.CreateAsphalt();
    ball.material = this.CreateballPBRerials();
    return scene;
  }

  CreateballPBRerials(): PBRMaterial {
    const ballPBR = new PBRMaterial("ballPBR", this.scene);
    const uvScale = 2;
    const texArry: Texture[] = [];
    const diffuseTex = new Texture(
      "./Materials/Ball/metal_plate_diff_1k.png",
      this.scene
    );
    ballPBR.albedoTexture = diffuseTex;
    texArry.push(diffuseTex);

    const normalTex = new Texture(
      "./Materials/Ball/metal_plate_nor_gl_1k.png",
      this.scene
    );
    texArry.push(normalTex);
    ballPBR.bumpTexture = normalTex;
    // 反转凹凸纹理
    ballPBR.invertNormalMapX = true;
    ballPBR.invertNormalMapY = true;

    // 此处对应 arm文件的三个属性
    ballPBR.useAmbientOcclusionFromMetallicTextureRed = true;
    ballPBR.useRoughnessFromMetallicTextureGreen = true;
    ballPBR.useMetallnessFromMetallicTextureBlue = true;
    const aoTex = new Texture(
      "./Materials/Ball/metal_plate_arm_1k.png",
      this.scene
    );
    ballPBR.ambientTexture = aoTex;
    texArry.push(aoTex);

    ballPBR.emissiveColor = new Color3(1, 1, 1);
    const emiTex = new Texture(
      "./Materials/Ball/metal_plate_spec_1k.png",
      this.scene
    );
    ballPBR.emissiveTexture = emiTex;

    ballPBR.emissiveIntensity = 0.6;

    // 加入发光层,有辉光
    const glowLayer = new GlowLayer("glow", this.scene);
    glowLayer.intensity = 1;
    ballPBR.roughness = 1;
    // 调整贴图的密度尺寸
    // diffuseTex.uScale = 4;
    // diffuseTex.vScale = 4;
    texArry.forEach((tex) => {
      tex.uScale = uvScale;
      tex.vScale = uvScale;
    });

    return ballPBR;
  }
  CreateAsphalt(): PBRMaterial {
    const pbr = new PBRMaterial("pbr", this.scene);
    pbr.albedoTexture = new Texture(
      "./Materials/Asphalt/asphalt_02_diff_1k.png",
      this.scene
    );
    pbr.bumpTexture = new Texture(
      "./Materials/Asphalt/asphalt_02_nor_gl_1k.png",
      this.scene
    );
    // 纹理反转
    pbr.invertNormalMapX = true;
    pbr.invertNormalMapY = true;

    // 此处对应 arm文件的三个属性
    pbr.useAmbientOcclusionFromMetallicTextureRed = true;
    pbr.useRoughnessFromMetallicTextureGreen = true;
    pbr.useMetallnessFromMetallicTextureBlue = true;

    pbr.metallicTexture = new Texture(
      "./Materials/Asphalt/asphalt_02_arm_1k.png",
      this.scene
    );

    pbr.roughness = 1;

    return pbr;
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
