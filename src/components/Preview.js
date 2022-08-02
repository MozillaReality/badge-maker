import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import {
  AmbientLight,
  CanvasTexture,
  DirectionalLight,
  MathUtils,
  PMREMGenerator,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const Preview = forwardRef(function Preview({ texture }, ref) {
  const canvas = useRef();
  const map = useRef();
  const badge = useRef();

  useImperativeHandle(ref, () => ({
    update: () => {
      if (map.current) {
        map.current.needsUpdate = true;
      }
    },
    toObjectURL: () => {
      if (badge.current) {
        return exportToObjectURL(badge.current);
      }
    },
  }));

  useEffect(() => {
    if (!canvas.current) return;

    const scene = new Scene();

    const renderer = new WebGLRenderer({
      canvas: canvas.current,
      antialias: true,
    });
    renderer.setSize(canvas.current.width, canvas.current.height);

    scene.environment = makeEnvironment(scene, renderer);

    const camera = new PerspectiveCamera(
      45,
      canvas.current.width / canvas.current.height
    );
    camera.position.set(0, 0.5, 1.5);
    camera.updateProjectionMatrix();

    const controls = new OrbitControls(camera, canvas.current);
    controls.autoRotate = true;
    controls.target.set(0, 0.4, 0);
    controls.update();

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const canvasTexture = new CanvasTexture(texture);
    canvasTexture.flipY = false;
    canvasTexture.anisotropy = maxAnisotropy;
    map.current = canvasTexture;

    new GLTFLoader().load("nametag.glb?v=1", (gltf) => {
      gltf.scene.traverse((object) => {
        if (object.material?.map && !object.name.includes("webcam_frame")) {
          object.material.map = canvasTexture;
        }
      });
      badge.current = gltf.scene;
      scene.add(gltf.scene);
      renderer.setAnimationLoop(() => {
        controls.update();
        renderer.render(scene, camera);
      });
    });
  }, [canvas.current]);

  return <canvas width="400" height="400" ref={canvas}></canvas>;
});

export { Preview };

function makeEnvironment(scene, renderer) {
  const sky = new Sky();
  sky.scale.setScalar(1000);

  const elevation = 10;
  const azimuth = 45;
  const phi = MathUtils.degToRad(90 - elevation);
  const theta = MathUtils.degToRad(azimuth);

  const sun = new Vector3();
  sun.setFromSphericalCoords(1, phi, theta);

  sky.material.uniforms["sunPosition"].value.copy(sun);

  scene.add(sky);

  return new PMREMGenerator(renderer).fromScene(scene).texture;
}

function exportToObjectURL(obj) {
  return new Promise((resolve) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      obj,
      (glb) => {
        const blob = new Blob([glb], { type: "application/octect-stream" });
        const url = URL.createObjectURL(blob);
        resolve(url);
      },
      console.error,
      { binary: true }
    );
  });
}
