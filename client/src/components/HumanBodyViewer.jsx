import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useFrame } from "@react-three/fiber";
import { Html, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { ORGAN_COLORS, ORGAN_MESH_KEYWORDS } from "../utils/organMeshMap.js";

function normalize(s) {
  return String(s || "").toLowerCase();
}

function canonicalizeOrgan(raw) {
  const s = normalize(raw);
  if (!s) return "";
  if (["heart", "cardiac", "coronary"].some((k) => s.includes(k))) return "heart";
  if (["lung", "lungs", "pulmo", "bronch"].some((k) => s.includes(k))) return "lungs";
  if (["liver", "hepatic"].some((k) => s.includes(k))) return "liver";
  if (["kidney", "kidneys", "renal"].some((k) => s.includes(k))) return "kidneys";
  if (["diabetes", "pancreas"].some((k) => s.includes(k))) return "pancreas";
  if (["brain", "cerebr", "stroke"].some((k) => s.includes(k))) return "brain";
  return s;
}

function pickOrgansFromDiseases(diseases) {
  const organs = new Set();
  (diseases || []).forEach((d) => {
    if (d.organ) organs.add(canonicalizeOrgan(d.organ));
    const name = normalize(d.name);
    if (name.includes("heart") || name.includes("cardiac") || name.includes("coronary")) organs.add("heart");
    if (name.includes("lung") || name.includes("asthma") || name.includes("pneumonia")) organs.add("lungs");
    if (name.includes("liver") || name.includes("hepatitis")) organs.add("liver");
    if (name.includes("kidney") || name.includes("renal")) organs.add("kidneys");
    if (name.includes("diabetes")) organs.add("pancreas");
    if (name.includes("brain") || name.includes("stroke")) organs.add("brain");
  });
  return Array.from(organs);
}

// Default high-quality organ models (CC BY 4.0) from Human Reference Atlas (HuBMAP / humanatlas.io)
// These load from CDN; no manual model setup is required to see organs.
const DEFAULT_ORGAN_MODELS = {
  skin: "https://cdn.humanatlas.io/hra-releases/v1.2/models/VH_M_Skin.glb",
  heart: "https://cdn.humanatlas.io/hra-releases/v1.2/models/VH_M_Heart.glb",
  lungs: "https://cdn.humanatlas.io/hra-releases/v1.2/models/VH_M_Lung.glb",
  liver: "https://cdn.humanatlas.io/hra-releases/v1.2/models/VH_M_Liver.glb",
  bloodVasculature: "https://cdn.humanatlas.io/hra-releases/v1.2/models/VH_M_Blood_Vasculature.glb",
  kidneys_l: "https://cdn.humanatlas.io/hra-releases/v1.2/models/VH_M_Kidney_L.glb",
  kidneys_r: "https://cdn.humanatlas.io/hra-releases/v1.2/models/VH_M_Kidney_R.glb"
};

function applyHighlightsToScene(scene, organsToHighlight) {
  const highlightSet = new Set(organsToHighlight.map(normalize));

  scene.traverse((obj) => {
    if (!obj.isMesh) return;
    const meshName = normalize(obj.name);

    // ensure material is standard so emissive works
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    mats.forEach((mat) => {
      if (!mat) return;
      if (!(mat instanceof THREE.MeshStandardMaterial)) {
        const std = new THREE.MeshStandardMaterial();
        std.copy(mat);
        obj.material = std;
        mat = std;
      }

      // default appearance
      mat.emissive = new THREE.Color("#000000");
      mat.emissiveIntensity = 0.0;
    });

    // check whether this mesh matches an organ keyword
    for (const organ of Object.keys(ORGAN_MESH_KEYWORDS)) {
      const keywords = ORGAN_MESH_KEYWORDS[organ] || [];
      const matches = keywords.some((k) => meshName.includes(normalize(k)));
      if (!matches) continue;

      if (highlightSet.has(organ)) {
        const color = ORGAN_COLORS[organ] || "#ef4444";
        const mats2 = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats2.forEach((mat) => {
          if (!mat) return;
          mat.emissive = new THREE.Color(color);
          mat.emissiveIntensity = 0.8;
        });
      }
    }
  });
}

function BaseBodyModel({ url, organsToHighlight }) {
  const gltf = useGLTF(url);

  useEffect(() => {
    if (!gltf?.scene) return;
    applyHighlightsToScene(gltf.scene, organsToHighlight);
  }, [gltf, organsToHighlight]);

  return <primitive object={gltf.scene} scale={1.0} />;
}

function OrganModel({
  url,
  organName,
  highlighted,
  onHoverChange,
  diseasesForOrgan = [],
  opacity = 1,
  tint = null,
  renderOrder = 0,
  depthWrite = true,
  interactive = true
}) {
  const gltf = useGLTF(url);
  const rootRef = useRef();

  // Twinkle/pulse animation for diseased organs (scale + glow).
  useFrame(({ clock }) => {
    const root = rootRef.current;
    if (!root) return;

    if (!highlighted) {
      root.scale.setScalar(1);
      return;
    }

    const t = clock.getElapsedTime();
    const s = 1 + 0.06 * (0.5 + 0.5 * Math.sin(t * 3.2));
    root.scale.setScalar(s);
  });

  useEffect(() => {
    if (!gltf?.scene) return;

    const color = ORGAN_COLORS[organName] || "#ef4444";

    // If this model should not capture pointer events (e.g. skin), disable raycasting.
    if (!interactive) {
      gltf.scene.traverse((obj) => {
        if (obj?.isMesh) obj.raycast = () => null;
      });
    }

    gltf.scene.traverse((obj) => {
      if (!obj.isMesh) return;
      obj.renderOrder = renderOrder;
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach((mat) => {
        if (!mat) return;
        if (!(mat instanceof THREE.MeshStandardMaterial)) {
          const std = new THREE.MeshStandardMaterial();
          std.copy(mat);
          obj.material = std;
          mat = std;
        }
        mat.transparent = opacity < 1;
        mat.opacity = opacity;
        mat.depthWrite = depthWrite;
        if (tint) {
          mat.color = new THREE.Color(tint);
        }
        if (highlighted) {
          mat.emissive = new THREE.Color(color);
          mat.emissiveIntensity = 1.6;
        } else {
          mat.emissive = new THREE.Color("#000000");
          mat.emissiveIntensity = 0.15;
        }
      });
    });
  }, [gltf, highlighted, organName, opacity, tint, renderOrder, depthWrite, interactive]);

  // The HRA organs are already positioned in a consistent reference coordinate space.
  return (
    <group ref={rootRef}>
      <primitive
        object={gltf.scene}
      onPointerOver={
        interactive
          ? (e) => {
              e.stopPropagation();
              onHoverChange?.(organName, diseasesForOrgan);
            }
          : undefined
      }
      onPointerOut={
        interactive
          ? (e) => {
              e.stopPropagation();
              onHoverChange?.(null, []);
            }
          : undefined
      }
      />
    </group>
  );
}

function computeOrganSummary(diseases) {
  const organs = pickOrgansFromDiseases(diseases);
  const byOrgan = new Map();
  (diseases || []).forEach((d) => {
    const organ = canonicalizeOrgan(d.organ) || null;
    if (!organ) return;
    if (!byOrgan.has(organ)) byOrgan.set(organ, []);
    byOrgan.get(organ).push(d);
  });

  return { organs, byOrgan };
}

export function HumanBodyViewer({ diseases = [], heightClass = "h-[520px]" }) {
  const url = import.meta.env.VITE_BODY_MODEL_URL;
  const organsToHighlight = useMemo(() => pickOrgansFromDiseases(diseases), [diseases]);
  const highlightSet = useMemo(() => new Set(organsToHighlight.map(normalize)), [organsToHighlight]);
  const { organs, byOrgan } = useMemo(() => computeOrganSummary(diseases), [diseases]);
  const [hovered, setHovered] = useState({ organ: null, diseases: [] });

  const healthSummary = useMemo(() => {
    const totalDiseases = (diseases || []).length;
    const affectedOrgans = organs.length;
    const status =
      totalDiseases === 0 ? "Healthy (no recorded diseases)" : `${totalDiseases} condition(s) affecting ${affectedOrgans} organ(s)`;
    return { totalDiseases, affectedOrgans, status };
  }, [diseases, organs]);

  return (
    <div className="grid lg:grid-cols-[1.2fr,0.8fr] gap-4">
      <div className={`card-glass p-4 ${heightClass}`}>
        <Canvas camera={{ position: [0, 0.2, 2.2], fov: 45 }}>
          <ambientLight intensity={0.75} />
          <directionalLight position={[2.5, 3.2, 2.2]} intensity={1.2} />
          <Suspense fallback={null}>
            {/* Body shell: default to HRA skin (semi-transparent), unless user provides a custom full-body model */}
            {url ? (
              <BaseBodyModel url={url} organsToHighlight={organsToHighlight} />
            ) : (
              <OrganModel
                url={DEFAULT_ORGAN_MODELS.skin}
                organName="skin"
                highlighted={false}
                onHoverChange={() => {}}
                opacity={0.22}
                tint="#cbd5e1"
                renderOrder={0}
                depthWrite={false}
                interactive={false}
              />
            )}

            {/* Optional: subtle vasculature context */}
            <OrganModel
              url={DEFAULT_ORGAN_MODELS.bloodVasculature}
              organName="bloodVasculature"
              highlighted={false}
              onHoverChange={() => {}}
              opacity={0.35}
              tint="#ef4444"
              renderOrder={1}
              depthWrite={false}
              interactive={false}
            />

            {/* Key organs */}
            <OrganModel
              url={DEFAULT_ORGAN_MODELS.heart}
              organName="heart"
              highlighted={highlightSet.has("heart")}
              diseasesForOrgan={byOrgan.get("heart") || []}
              onHoverChange={(organ, ds) => setHovered({ organ, diseases: ds })}
              renderOrder={2}
            />
            <OrganModel
              url={DEFAULT_ORGAN_MODELS.lungs}
              organName="lungs"
              highlighted={highlightSet.has("lungs")}
              diseasesForOrgan={byOrgan.get("lungs") || []}
              onHoverChange={(organ, ds) => setHovered({ organ, diseases: ds })}
              renderOrder={2}
            />
            <OrganModel
              url={DEFAULT_ORGAN_MODELS.liver}
              organName="liver"
              highlighted={highlightSet.has("liver")}
              diseasesForOrgan={byOrgan.get("liver") || []}
              onHoverChange={(organ, ds) => setHovered({ organ, diseases: ds })}
              renderOrder={2}
            />
            <OrganModel
              url={DEFAULT_ORGAN_MODELS.kidneys_l}
              organName="kidneys"
              highlighted={highlightSet.has("kidneys")}
              diseasesForOrgan={byOrgan.get("kidneys") || []}
              onHoverChange={(organ, ds) => setHovered({ organ, diseases: ds })}
              renderOrder={2}
            />
            <OrganModel
              url={DEFAULT_ORGAN_MODELS.kidneys_r}
              organName="kidneys"
              highlighted={highlightSet.has("kidneys")}
              diseasesForOrgan={byOrgan.get("kidneys") || []}
              onHoverChange={(organ, ds) => setHovered({ organ, diseases: ds })}
              renderOrder={2}
            />

            {/* Hover label */}
            {hovered.organ ? (
              <Html center>
                <div className="px-3 py-2 rounded-xl bg-slate-950/90 border border-slate-700 text-xs text-slate-100 shadow-xl max-w-xs">
                  <div className="font-semibold capitalize">{hovered.organ}</div>
                  {hovered.diseases?.length ? (
                    <ul className="mt-1 list-disc pl-4 text-slate-200">
                      {hovered.diseases.slice(0, 4).map((d, i) => (
                        <li key={i}>{d.name}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="mt-1 text-slate-400">No recorded disease for this organ.</div>
                  )}
                </div>
              </Html>
            ) : null}
          </Suspense>
          <OrbitControls
            makeDefault
            enablePan={true}
            enableDamping={true}
            dampingFactor={0.08}
            minDistance={1.2}
            maxDistance={4}
            zoomSpeed={0.8}
            rotateSpeed={0.9}
            target={[0, 0.4, 0]}
          />
        </Canvas>

        {!url ? (
          <div className="mt-3 text-[11px] text-slate-400">
            Using a built-in human body shell (skin) + organs. Optional: set{" "}
            <span className="font-mono">VITE_BODY_MODEL_URL</span> in <span className="font-mono">client/.env</span> to
            your own full-body model.
          </div>
        ) : null}
      </div>

      <div className="card-glass p-4 space-y-3">
        <div>
          <div className="text-xs text-slate-400">Health summary</div>
          <div className="text-sm font-semibold text-slate-100">{healthSummary.status}</div>
        </div>

        <div className="border-t border-slate-800 pt-3">
          <div className="text-xs text-slate-400 mb-2">Organs</div>
          <div className="space-y-2 text-sm">
            {["heart", "lungs", "liver", "kidneys"].map((o) => {
              const diseased = (byOrgan.get(o) || []).length > 0;
              return (
                <div key={o} className="flex items-start justify-between gap-2">
                  <div className="capitalize">{o}</div>
                  <div className={diseased ? "text-red-300" : "text-emerald-300"}>
                    {diseased ? "Affected" : "Normal"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-slate-800 pt-3">
          <div className="text-xs text-slate-400 mb-2">Diseased parts</div>
          {diseases?.length ? (
            <ul className="list-disc pl-5 text-sm space-y-1">
              {diseases.map((d, i) => (
                <li key={i}>
                  {d.name}
                  {d.organ ? <span className="text-slate-400"> · {d.organ}</span> : null}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-slate-500">No diseases recorded.</div>
          )}
        </div>
      </div>

      {!diseases?.length ? (
        <div className="lg:col-span-2 text-[11px] text-slate-500">
          Tip: ask the doctor to add diseases to your profile (they drive organ highlighting).
        </div>
      ) : null}
    </div>
  );
}

useGLTF.preload = useGLTF.preload || (() => {});

