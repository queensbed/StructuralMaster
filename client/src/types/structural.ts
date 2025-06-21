export type ToolType = 
  | "select" 
  | "beam" 
  | "column" 
  | "support" 
  | "point-load" 
  | "distributed-load";

export interface CanvasPoint {
  x: number;
  y: number;
}

export interface ViewTransform {
  scale: number;
  panX: number;
  panY: number;
}

export interface ElementDrawInfo {
  id: string;
  type: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  isSelected: boolean;
}

export interface LoadDrawInfo {
  id: string;
  type: "point" | "distributed";
  x: number;
  y: number;
  magnitude: number;
  direction: "x" | "y";
}

export interface SupportDrawInfo {
  id: string;
  type: "fixed" | "pinned" | "roller";
  x: number;
  y: number;
}

export interface AnalysisStatus {
  status: "pending" | "running" | "complete" | "error";
  progress?: number;
  message?: string;
}

export interface MaterialProperties {
  elasticModulus: number; // GPa
  density: number; // kg/m³
  yieldStrength: number; // MPa
  ultimateStrength: number; // MPa
  poissonRatio: number;
}

export interface SectionProperties {
  area: number; // cm²
  momentOfInertiaY: number; // cm⁴
  momentOfInertiaZ: number; // cm⁴
  sectionModulusY: number; // cm³
  sectionModulusZ: number; // cm³
  height?: number; // mm
  width?: number; // mm
  thickness?: number; // mm
}

export interface DesignCheckResult {
  strengthUtilization: number;
  deflectionRatio: string;
  strengthPasses: boolean;
  deflectionPasses: boolean;
}
