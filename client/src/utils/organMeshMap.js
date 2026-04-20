// Map logical organs to glTF node name keywords.
// Your human-body .glb should contain meshes named similar to these.
// Update this mapping to match your chosen model.

export const ORGAN_MESH_KEYWORDS = {
  heart: ["heart", "cardiac"],
  lungs: ["lung", "lungs", "pulmo"],
  liver: ["liver", "hepatic"],
  kidneys: ["kidney", "kidneys", "renal"],
  brain: ["brain", "cerebr"],
  stomach: ["stomach", "gastric"],
  intestine: ["intestine", "bowel"],
  pancreas: ["pancreas"],
  spleen: ["spleen"],
  bladder: ["bladder"],
  spine: ["spine", "vertebra"],
  skin: ["skin", "body"]
};

export const ORGAN_COLORS = {
  heart: "#ef4444",
  lungs: "#38bdf8",
  liver: "#f59e0b",
  kidneys: "#a855f7",
  brain: "#f97316",
  stomach: "#22c55e",
  intestine: "#84cc16",
  pancreas: "#10b981",
  spleen: "#e879f9",
  bladder: "#60a5fa",
  spine: "#94a3b8",
  skin: "#f1f5f9"
};

