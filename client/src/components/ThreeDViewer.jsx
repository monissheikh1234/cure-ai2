import { useEffect, useRef } from "react";
import * as THREE from "three";

// Simple placeholder 3D human-like figure (no glTF dependency to keep setup light).
// Organs are represented by colored spheres we can highlight by name.

const ORGAN_COLORS = {
  heart: 0xff4b4b,
  lungs: 0x38bdf8,
  liver: 0xfbbf24,
  kidneys: 0xa855f7,
  pancreas: 0x22c55e
};

export function ThreeDViewer({ highlightedOrgans = [] }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#020617");

    const camera = new THREE.PerspectiveCamera(
      45,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 1.6, 4);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1.1);
    light.position.set(2, 4, 3);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040, 0.8));

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: "#1e293b",
      roughness: 0.6,
      metalness: 0.1
    });
    const core = new THREE.CylinderGeometry(0.7, 0.6, 2.5, 24);
    const body = new THREE.Mesh(core, bodyMaterial);
    scene.add(body);

    const organs = {};
    const organMaterial = (color, emissive) =>
      new THREE.MeshStandardMaterial({
        color,
        emissive,
        emissiveIntensity: 0.6,
        roughness: 0.4,
        metalness: 0.3
      });

    const heart = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 24, 24),
      organMaterial(ORGAN_COLORS.heart, ORGAN_COLORS.heart)
    );
    heart.position.set(0.0, 0.4, 0.5);
    scene.add(heart);
    organs.heart = heart;

    const leftLung = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 24, 24),
      organMaterial(ORGAN_COLORS.lungs, ORGAN_COLORS.lungs)
    );
    leftLung.position.set(-0.45, 0.7, 0.3);
    scene.add(leftLung);
    const rightLung = leftLung.clone();
    rightLung.position.set(0.45, 0.7, 0.3);
    scene.add(rightLung);
    organs.lungs = [leftLung, rightLung];

    const liver = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 24, 24),
      organMaterial(ORGAN_COLORS.liver, ORGAN_COLORS.liver)
    );
    liver.position.set(0.2, 0.1, 0.4);
    scene.add(liver);
    organs.liver = liver;

    const leftKidney = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 24, 24),
      organMaterial(ORGAN_COLORS.kidneys, ORGAN_COLORS.kidneys)
    );
    leftKidney.position.set(-0.45, -0.2, 0.2);
    scene.add(leftKidney);
    const rightKidney = leftKidney.clone();
    rightKidney.position.set(0.45, -0.2, 0.2);
    scene.add(rightKidney);
    organs.kidneys = [leftKidney, rightKidney];

    const pancreas = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 24, 24),
      organMaterial(ORGAN_COLORS.pancreas, ORGAN_COLORS.pancreas)
    );
    pancreas.position.set(0, 0, 0.5);
    scene.add(pancreas);
    organs.pancreas = pancreas;

    const baseIntensity = 0.2;
    const clock = new THREE.Clock();

    function animate() {
      const t = clock.getElapsedTime();

      const isHighlighted = (name) =>
        highlightedOrgans.map((v) => v.toLowerCase()).includes(name);

      const pulse = (name, meshOrMeshes) => {
        const meshes = Array.isArray(meshOrMeshes) ? meshOrMeshes : [meshOrMeshes];
        const active = isHighlighted(name);
        meshes.forEach((m) => {
          if (!m.material) return;
          if (active) {
            const intensity = baseIntensity + 0.4 * (0.5 + 0.5 * Math.sin(3 * t));
            m.material.emissiveIntensity = intensity;
            m.scale.setScalar(1 + 0.05 * Math.sin(3 * t));
          } else {
            m.material.emissiveIntensity = 0.2;
            m.scale.setScalar(1);
          }
        });
      };

      pulse("heart", organs.heart);
      pulse("lungs", organs.lungs);
      pulse("liver", organs.liver);
      pulse("kidneys", organs.kidneys);
      pulse("pancreas", organs.pancreas);

      body.rotation.y = 0.2 * t;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [highlightedOrgans]);

  return <div ref={mountRef} className="w-full h-80 rounded-2xl border border-slate-800 overflow-hidden" />;
}

