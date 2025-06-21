export interface BeamAnalysisInput {
  length: number; // meters
  elasticModulus: number; // GPa
  momentOfInertia: number; // cm⁴
  loads: {
    type: "point" | "distributed";
    magnitude: number; // kN or kN/m
    position?: number; // position along beam (0-1) for point loads
  }[];
}

export interface BeamResults {
  maxMoment: number; // kNm
  maxShear: number; // kN
  maxDisplacement: number; // mm
  moments: number[]; // moment at each position
  shears: number[]; // shear at each position
  displacements: number[]; // displacement at each position
  positions: number[]; // positions along beam
}

export function analyzeSimplySupportedBeam(input: BeamAnalysisInput): BeamResults {
  const { length, elasticModulus, momentOfInertia, loads } = input;
  const E = elasticModulus * 1e9; // Convert GPa to Pa
  const I = momentOfInertia * 1e-8; // Convert cm⁴ to m⁴
  
  // Create position array (21 points from 0 to L)
  const positions = Array.from({ length: 21 }, (_, i) => (i / 20) * length);
  const moments = new Array(21).fill(0);
  const shears = new Array(21).fill(0);
  const displacements = new Array(21).fill(0);
  
  // Process each load
  for (const load of loads) {
    if (load.type === "point") {
      const P = load.magnitude * 1000; // Convert kN to N
      const a = (load.position || 0.5) * length;
      const b = length - a;
      
      // Calculate reactions
      const R1 = (P * b) / length;
      const R2 = (P * a) / length;
      
      for (let i = 0; i < positions.length; i++) {
        const x = positions[i];
        
        // Shear force
        if (x < a) {
          shears[i] += R1;
        } else {
          shears[i] += R1 - P;
        }
        
        // Bending moment
        if (x < a) {
          moments[i] += R1 * x;
        } else {
          moments[i] += R1 * x - P * (x - a);
        }
        
        // Deflection (simplified)
        if (x < a) {
          displacements[i] += (P * b * x * (length * length - b * b - x * x)) / (6 * E * I * length);
        } else {
          displacements[i] += (P * a * (length - x) * (2 * length * x - x * x - a * a)) / (6 * E * I * length);
        }
      }
    } else if (load.type === "distributed") {
      const w = load.magnitude * 1000; // Convert kN/m to N/m
      
      for (let i = 0; i < positions.length; i++) {
        const x = positions[i];
        
        // Shear force for UDL
        shears[i] += (w * length) / 2 - w * x;
        
        // Bending moment for UDL
        moments[i] += (w * length * x) / 2 - (w * x * x) / 2;
        
        // Deflection for UDL
        displacements[i] += (w * x * (length ** 3 - 2 * length * x * x + x ** 3)) / (24 * E * I);
      }
    }
  }
  
  // Convert units back
  const momentskNm = moments.map(m => m / 1000); // N⋅m to kN⋅m
  const shearskN = shears.map(s => s / 1000); // N to kN
  const displacementsmm = displacements.map(d => d * 1000); // m to mm
  
  return {
    maxMoment: Math.max(...momentskNm.map(Math.abs)),
    maxShear: Math.max(...shearskN.map(Math.abs)),
    maxDisplacement: Math.max(...displacementsmm.map(Math.abs)),
    moments: momentskNm,
    shears: shearskN,
    displacements: displacementsmm,
    positions
  };
}

export function calculateUtilizationRatio(
  maxMoment: number, // kNm
  sectionModulus: number, // cm³
  yieldStrength: number // MPa
): number {
  const stress = (maxMoment * 1000) / (sectionModulus * 1e-6); // Convert to Pa
  return stress / (yieldStrength * 1e6); // Utilization ratio
}

export function checkDeflectionLimit(
  maxDeflection: number, // mm
  span: number, // m
  limit: number = 250 // L/limit
): { passes: boolean; ratio: string } {
  const allowableDeflection = (span * 1000) / limit; // mm
  return {
    passes: maxDeflection <= allowableDeflection,
    ratio: `L/${Math.round((span * 1000) / maxDeflection)}`
  };
}
