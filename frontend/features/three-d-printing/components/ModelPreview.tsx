"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { FileUp, LoaderCircle, Rotate3D } from "lucide-react";

const COLOR_HEX: Record<string, number> = {
  black: 0x242424,
  white: 0xf4f4f3,
  red: 0xe54b4b,
  blue: 0x3487d8,
  green: 0x3a9b64,
  yellow: 0xe4b735,
  grey: 0x8b9198,
  gray: 0x8b9198,
  clear: 0xbfd9dc,
};

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.geometry.dispose();
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => material.dispose());
  });
}

export default function ModelPreview({
  file,
  color,
  onUpload,
}: {
  file: File | null;
  color: string;
  onUpload: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!file) {
      setError("");
      setIsLoading(false);
      return;
    }
    const selectedFile = file;

    let disposed = false;
    let frameId = 0;
    let visible = true;
    let modelRoot: THREE.Object3D | null = null;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x18181b);
    scene.fog = new THREE.Fog(0x18181b, 600, 1500);

    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 5000);
    camera.position.set(180, 140, 220);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      });
    } catch {
      setError("3D preview is unavailable on this device.");
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute("aria-label", "Interactive 3D model preview");
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.65;
    controls.minDistance = 20;
    controls.maxDistance = 1600;

    scene.add(new THREE.HemisphereLight(0xffffff, 0x3f4650, 2.2));
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    keyLight.position.set(180, 260, 160);
    keyLight.castShadow = true;
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x46c7b1, 1.8);
    rimLight.position.set(-220, 80, -180);
    scene.add(rimLight);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(1600, 1600),
      new THREE.MeshStandardMaterial({ color: 0x202124, roughness: 0.95 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(1000, 50, 0x3f454a, 0x292c2f);
    grid.position.y = 0.02;
    scene.add(grid);

    function resize() {
      const width = Math.max(1, containerRef.current?.clientWidth ?? 1);
      const height = Math.max(1, containerRef.current?.clientHeight ?? 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    }

    function frameObject(object: THREE.Object3D) {
      const extension = selectedFile.name.split(".").pop()?.toLowerCase();
      if (extension === "stl") object.rotation.x = -Math.PI / 2;
      object.updateMatrixWorld(true);

      let bounds = new THREE.Box3().setFromObject(object);
      const initialCenter = bounds.getCenter(new THREE.Vector3());
      object.position.x -= initialCenter.x;
      object.position.z -= initialCenter.z;
      object.position.y += 0.8 - bounds.min.y;
      object.updateMatrixWorld(true);

      bounds = new THREE.Box3().setFromObject(object);
      const center = bounds.getCenter(new THREE.Vector3());
      const size = bounds.getSize(new THREE.Vector3());
      const maximum = Math.max(size.x, size.y, size.z, 10);
      const verticalDistance = size.y / (2 * Math.tan((camera.fov * Math.PI) / 360));
      const horizontalFov = 2 * Math.atan(Math.tan((camera.fov * Math.PI) / 360) * camera.aspect);
      const horizontalDistance = Math.max(size.x, size.z) / (2 * Math.tan(horizontalFov / 2));
      const distance = Math.max(verticalDistance, horizontalDistance, maximum) * 1.35;
      camera.position.set(distance * 0.82, center.y + distance * 0.62, distance * 1.08);
      camera.near = Math.max(0.1, distance / 100);
      camera.far = Math.max(2000, distance * 20);
      camera.updateProjectionMatrix();
      controls.target.copy(center);
      controls.minDistance = maximum * 0.55;
      controls.maxDistance = maximum * 8;
      controls.update();
    }

    const material = new THREE.MeshStandardMaterial({
      color: COLOR_HEX[color.toLowerCase()] ?? 0x56b8a5,
      roughness: 0.48,
      metalness: 0.08,
    });

    async function loadModel() {
      setError("");
      setIsLoading(Boolean(file));
      try {
        const extension = selectedFile.name.split(".").pop()?.toLowerCase();
        if (extension === "stl") {
          const geometry = new STLLoader().parse(await selectedFile.arrayBuffer());
          geometry.computeVertexNormals();
          const mesh = new THREE.Mesh(geometry, material);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          modelRoot = mesh;
        } else if (extension === "obj") {
          const object = new OBJLoader().parse(await selectedFile.text());
          object.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) return;
            child.material = material;
            child.castShadow = true;
            child.receiveShadow = true;
          });
          modelRoot = object;
        } else {
          throw new Error("Only STL and OBJ files can be previewed.");
        }

        if (disposed || !modelRoot) return;
        scene.add(modelRoot);
        frameObject(modelRoot);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not preview this model.");
      } finally {
        if (!disposed) setIsLoading(false);
      }
    }

    void loadModel();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
    });
    intersectionObserver.observe(container);

    const render = () => {
      if (disposed) return;
      if (visible && document.visibilityState === "visible") {
        controls.update();
        renderer.render(scene, camera);
      }
      frameId = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      controls.dispose();
      if (modelRoot) disposeObject(modelRoot);
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [color, file]);

  return (
    <div ref={containerRef} className="relative h-[52vh] min-h-[420px] w-full overflow-hidden bg-zinc-900 lg:h-[calc(100vh-13rem)] lg:min-h-[560px]">
      {file ? (
        <div className="pointer-events-none absolute left-5 top-5 z-10 flex items-center gap-2 text-xs font-bold text-white">
          <span className="grid h-8 w-8 place-items-center rounded-md border border-white/15 bg-black/30 backdrop-blur">
            <Rotate3D className="h-4 w-4" />
          </span>
          <span className="max-w-[min(60vw,420px)] truncate rounded-md border border-white/15 bg-black/30 px-3 py-2 backdrop-blur">
            {file.name}
          </span>
        </div>
      ) : (
        <div className="absolute inset-0 grid place-items-center px-6 text-center text-white">
          <div>
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-md border border-zinc-700 bg-zinc-800">
              <FileUp className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-xl font-bold">Upload to preview your model</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-400">
              Select an STL or OBJ file to open the interactive build view.
            </p>
            <button
              type="button"
              onClick={onUpload}
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-md bg-white px-5 text-sm font-bold text-zinc-950 transition hover:bg-emerald-400"
            >
              <FileUp className="h-4 w-4" aria-hidden="true" />
              Select model
            </button>
          </div>
        </div>
      )}
      {isLoading && (
        <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center bg-zinc-900/65 text-white">
          <LoaderCircle className="h-6 w-6 animate-spin" />
        </div>
      )}
      {error && (
        <div className="absolute inset-x-5 bottom-5 z-20 rounded-md border border-red-400/30 bg-red-950/80 px-4 py-3 text-sm font-semibold text-red-100 backdrop-blur">
          {error}
        </div>
      )}
    </div>
  );
}
