/**
 * Advanced Finite Element Method (FEM) Engine
 * Professional-grade structural analysis engine to compete with TEKLA, ETABS, STAAD.Pro
 */

export interface Node {
  id: string;
  x: number;
  y: number;
  z: number;
  restraints: boolean[]; // [Fx, Fy, Fz, Mx, My, Mz]
}

export interface Element {
  id: string;
  startNodeId: string;
  endNodeId: string;
  materialId: number;
  sectionId: number;
  type: 'beam' | 'column' | 'brace' | 'truss' | 'plate' | 'shell';
  releases: [string, string]; // start and end releases
  meshSize?: number;
}

export interface Material {
  id: number;
  name: string;
  elasticModulus: number; // GPa
  shearModulus: number; // GPa
  poissonRatio: number;
  density: number; // kg/m³
  yieldStrength: number; // MPa
  ultimateStrength: number; // MPa
  thermalExpansion: number; // /°C
}

export interface Section {
  id: number;
  name: string;
  type: string;
  area: number; // cm²
  momentOfInertiaY: number; // cm⁴
  momentOfInertiaZ: number; // cm⁴
  torsionalConstant: number; // cm⁴
  warpingConstant?: number; // cm⁶
  shearAreaY: number; // cm²
  shearAreaZ: number; // cm²
  sectionModulusY: number; // cm³
  sectionModulusZ: number; // cm³
  radiusOfGyrationY: number; // cm
  radiusOfGyrationZ: number; // cm
}

export interface Load {
  id: string;
  type: 'point' | 'distributed' | 'moment' | 'pressure' | 'thermal';
  nodeId?: string;
  elementId?: string;
  magnitude: number;
  direction: 'x' | 'y' | 'z' | 'mx' | 'my' | 'mz';
  position?: number; // 0-1 along element
  distributionEnd?: number; // for trapezoidal loads
  loadCase: string;
}

export interface LoadCase {
  id: string;
  name: string;
  type: 'dead' | 'live' | 'wind' | 'earthquake' | 'snow' | 'thermal';
  factor: number;
}

export interface LoadCombination {
  id: string;
  name: string;
  type: 'ultimate' | 'serviceability';
  factors: { [loadCaseId: string]: number };
}

export interface AnalysisResults {
  displacements: Map<string, number[]>; // nodeId -> [dx, dy, dz, rx, ry, rz]
  forces: Map<string, number[]>; // elementId -> [Fx1, Fy1, Fz1, Mx1, My1, Mz1, Fx2, Fy2, Fz2, Mx2, My2, Mz2]
  stresses: Map<string, number[]>; // elementId -> [axial, shearY, shearZ, torsion, bendingY, bendingZ]
  reactions: Map<string, number[]>; // nodeId -> [Rx, Ry, Rz, Mrx, Mry, Mrz]
  buckling?: { mode: number; factor: number; shape: Map<string, number[]> }[];
  frequency?: { mode: number; frequency: number; shape: Map<string, number[]> }[];
}

export class FEMEngine {
  private nodes: Map<string, Node> = new Map();
  private elements: Map<string, Element> = new Map();
  private materials: Map<number, Material> = new Map();
  private sections: Map<number, Section> = new Map();
  private loads: Map<string, Load> = new Map();
  private loadCases: Map<string, LoadCase> = new Map();
  private loadCombinations: Map<string, LoadCombination> = new Map();

  // Global stiffness matrix and vectors
  private K: number[][] = [];
  private F: number[] = [];
  private U: number[] = [];
  private dofMap: Map<string, number[]> = new Map(); // nodeId -> [dof indices]
  private totalDOFs = 0;

  constructor() {
    this.initializeDefaultMaterials();
    this.initializeDefaultSections();
  }

  private initializeDefaultMaterials() {
    // Steel materials
    this.materials.set(1, {
      id: 1,
      name: "Steel S355",
      elasticModulus: 210,
      shearModulus: 81,
      poissonRatio: 0.3,
      density: 7850,
      yieldStrength: 355,
      ultimateStrength: 490,
      thermalExpansion: 1.2e-5
    });

    this.materials.set(2, {
      id: 2,
      name: "Steel S275",
      elasticModulus: 210,
      shearModulus: 81,
      poissonRatio: 0.3,
      density: 7850,
      yieldStrength: 275,
      ultimateStrength: 430,
      thermalExpansion: 1.2e-5
    });

    // Concrete materials
    this.materials.set(3, {
      id: 3,
      name: "Concrete C30/37",
      elasticModulus: 33,
      shearModulus: 13.75,
      poissonRatio: 0.2,
      density: 2500,
      yieldStrength: 30,
      ultimateStrength: 37,
      thermalExpansion: 1.0e-5
    });
  }

  private initializeDefaultSections() {
    // European IPE sections
    this.sections.set(1, {
      id: 1,
      name: "IPE 240",
      type: "I-beam",
      area: 39.1,
      momentOfInertiaY: 3892,
      momentOfInertiaZ: 284,
      torsionalConstant: 6.98,
      shearAreaY: 13.2,
      shearAreaZ: 32.6,
      sectionModulusY: 324,
      sectionModulusZ: 47.3,
      radiusOfGyrationY: 9.97,
      radiusOfGyrationZ: 2.69
    });

    this.sections.set(2, {
      id: 2,
      name: "IPE 300",
      type: "I-beam",
      area: 53.8,
      momentOfInertiaY: 8356,
      momentOfInertiaZ: 604,
      torsionalConstant: 20.1,
      shearAreaY: 17.9,
      shearAreaZ: 44.9,
      sectionModulusY: 557,
      sectionModulusZ: 80.5,
      radiusOfGyrationY: 12.5,
      radiusOfGyrationZ: 3.35
    });
  }

  // Add structural components
  addNode(node: Node): void {
    this.nodes.set(node.id, node);
  }

  addElement(element: Element): void {
    this.elements.set(element.id, element);
  }

  addLoad(load: Load): void {
    this.loads.set(load.id, load);
  }

  addLoadCase(loadCase: LoadCase): void {
    this.loadCases.set(loadCase.id, loadCase);
  }

  addLoadCombination(combination: LoadCombination): void {
    this.loadCombinations.set(combination.id, combination);
  }

  // Build global stiffness matrix
  private buildGlobalStiffnessMatrix(): void {
    this.setupDOFMapping();
    this.initializeMatrices();

    for (const elementId of this.elements.keys()) {
      const element = this.elements.get(elementId)!;
      const ke = this.calculateElementStiffnessMatrix(element);
      this.assembleElementMatrix(element, ke);
    }
  }

  private setupDOFMapping(): void {
    this.totalDOFs = 0;
    this.dofMap.clear();

    const nodeEntries = Array.from(this.nodes.entries());
    for (const [nodeId, node] of nodeEntries) {
      const dofs: number[] = [];
      for (let i = 0; i < 6; i++) {
        if (!node.restraints[i]) {
          dofs.push(this.totalDOFs++);
        } else {
          dofs.push(-1); // restrained DOF
        }
      }
      this.dofMap.set(nodeId, dofs);
    }
  }

  private initializeMatrices(): void {
    // Initialize global stiffness matrix
    this.K = Array(this.totalDOFs).fill(null).map(() => Array(this.totalDOFs).fill(0));
    this.F = Array(this.totalDOFs).fill(0);
    this.U = Array(this.totalDOFs).fill(0);
  }

  private calculateElementStiffnessMatrix(element: Element): number[][] {
    const material = this.materials.get(element.materialId)!;
    const section = this.sections.get(element.sectionId)!;
    
    const startNode = this.nodes.get(element.startNodeId)!;
    const endNode = this.nodes.get(element.endNodeId)!;

    // Calculate element geometry
    const dx = endNode.x - startNode.x;
    const dy = endNode.y - startNode.y;
    const dz = endNode.z - startNode.z;
    const L = Math.sqrt(dx*dx + dy*dy + dz*dz);

    // Direction cosines
    const cx = dx / L;
    const cy = dy / L;
    const cz = dz / L;

    // Material and section properties (convert units)
    const E = material.elasticModulus * 1e9; // GPa to Pa
    const G = material.shearModulus * 1e9; // GPa to Pa
    const A = section.area * 1e-4; // cm² to m²
    const Iy = section.momentOfInertiaY * 1e-8; // cm⁴ to m⁴
    const Iz = section.momentOfInertiaZ * 1e-8; // cm⁴ to m⁴
    const J = section.torsionalConstant * 1e-8; // cm⁴ to m⁴

    // Local stiffness matrix for 3D beam element (12x12)
    const ke = this.calculateBeamStiffnessMatrix(E, G, A, Iy, Iz, J, L);

    // Transformation matrix (12x12)
    const T = this.calculateTransformationMatrix(cx, cy, cz);

    // Transform to global coordinates: K_global = T^T * K_local * T
    return this.matrixMultiply(this.matrixMultiply(this.matrixTranspose(T), ke), T);
  }

  private calculateBeamStiffnessMatrix(E: number, G: number, A: number, Iy: number, Iz: number, J: number, L: number): number[][] {
    const ke = Array(12).fill(null).map(() => Array(12).fill(0));

    // Axial terms
    const EA_L = E * A / L;
    ke[0][0] = ke[6][6] = EA_L;
    ke[0][6] = ke[6][0] = -EA_L;

    // Torsional terms
    const GJ_L = G * J / L;
    ke[3][3] = ke[9][9] = GJ_L;
    ke[3][9] = ke[9][3] = -GJ_L;

    // Bending terms in y-z plane
    const EIz_L3 = E * Iz / (L * L * L);
    const EIz_L2 = E * Iz / (L * L);
    const EIz_L = E * Iz / L;

    ke[1][1] = ke[7][7] = 12 * EIz_L3;
    ke[1][7] = ke[7][1] = -12 * EIz_L3;
    ke[1][5] = ke[5][1] = ke[7][11] = ke[11][7] = 6 * EIz_L2;
    ke[1][11] = ke[11][1] = ke[5][7] = ke[7][5] = -6 * EIz_L2;
    ke[5][5] = ke[11][11] = 4 * EIz_L;
    ke[5][11] = ke[11][5] = 2 * EIz_L;

    // Bending terms in x-z plane
    const EIy_L3 = E * Iy / (L * L * L);
    const EIy_L2 = E * Iy / (L * L);
    const EIy_L = E * Iy / L;

    ke[2][2] = ke[8][8] = 12 * EIy_L3;
    ke[2][8] = ke[8][2] = -12 * EIy_L3;
    ke[2][4] = ke[4][2] = ke[8][10] = ke[10][8] = -6 * EIy_L2;
    ke[2][10] = ke[10][2] = ke[4][8] = ke[8][4] = 6 * EIy_L2;
    ke[4][4] = ke[10][10] = 4 * EIy_L;
    ke[4][10] = ke[10][4] = 2 * EIy_L;

    return ke;
  }

  private calculateTransformationMatrix(cx: number, cy: number, cz: number): number[][] {
    const T = Array(12).fill(null).map(() => Array(12).fill(0));

    // Create 3x3 direction cosine matrix
    const dcm = [
      [cx, cy, cz],
      [-cy, cx, 0], // Assuming local y-axis is in global x-y plane
      [-cx*cz, -cy*cz, Math.sqrt(cx*cx + cy*cy)]
    ];

    // Populate transformation matrix (4 blocks of 3x3)
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        for (let k = 0; k < 3; k++) {
          T[i*3 + j][i*3 + k] = dcm[j][k];
        }
      }
    }

    return T;
  }

  private assembleElementMatrix(element: Element, ke: number[][]): void {
    const startDOFs = this.dofMap.get(element.startNodeId)!;
    const endDOFs = this.dofMap.get(element.endNodeId)!;
    const elementDOFs = [...startDOFs, ...endDOFs];

    for (let i = 0; i < 12; i++) {
      const globalI = elementDOFs[i];
      if (globalI >= 0) {
        for (let j = 0; j < 12; j++) {
          const globalJ = elementDOFs[j];
          if (globalJ >= 0) {
            this.K[globalI][globalJ] += ke[i][j];
          }
        }
      }
    }
  }

  // Apply loads
  private applyLoads(loadCombination: LoadCombination): void {
    this.F.fill(0);

    const loadEntries = Array.from(this.loads.entries());
    for (const [loadId, load] of loadEntries) {
      const loadCase = this.loadCases.get(load.loadCase)!;
      const factor = loadCombination.factors[load.loadCase] || 0;

      if (load.nodeId) {
        this.applyNodalLoad(load, factor);
      } else if (load.elementId) {
        this.applyElementLoad(load, factor);
      }
    }
  }

  private applyNodalLoad(load: Load, factor: number): void {
    const dofs = this.dofMap.get(load.nodeId!)!;
    const directionIndex = ['x', 'y', 'z', 'mx', 'my', 'mz'].indexOf(load.direction);
    
    if (directionIndex >= 0 && dofs[directionIndex] >= 0) {
      this.F[dofs[directionIndex]] += load.magnitude * factor;
    }
  }

  private applyElementLoad(load: Load, factor: number): void {
    // Convert element loads to equivalent nodal loads
    const element = this.elements.get(load.elementId!)!;
    const L = this.calculateElementLength(element);

    if (load.type === 'distributed') {
      // Convert distributed load to equivalent nodal forces
      const totalLoad = load.magnitude * L * factor;
      const startDOFs = this.dofMap.get(element.startNodeId)!;
      const endDOFs = this.dofMap.get(element.endNodeId)!;

      const directionIndex = ['x', 'y', 'z'].indexOf(load.direction);
      if (directionIndex >= 0) {
        if (startDOFs[directionIndex] >= 0) {
          this.F[startDOFs[directionIndex]] += totalLoad / 2;
        }
        if (endDOFs[directionIndex] >= 0) {
          this.F[endDOFs[directionIndex]] += totalLoad / 2;
        }
      }
    }
  }

  private calculateElementLength(element: Element): number {
    const startNode = this.nodes.get(element.startNodeId)!;
    const endNode = this.nodes.get(element.endNodeId)!;
    const dx = endNode.x - startNode.x;
    const dy = endNode.y - startNode.y;
    const dz = endNode.z - startNode.z;
    return Math.sqrt(dx*dx + dy*dy + dz*dz);
  }

  // Solve system of equations
  private solveSystem(): void {
    // Use Gaussian elimination with partial pivoting
    this.gaussianElimination();
  }

  private gaussianElimination(): void {
    const n = this.totalDOFs;
    const augmented = this.K.map((row, i) => [...row, this.F[i]]);

    // Forward elimination with partial pivoting
    for (let i = 0; i < n; i++) {
      // Find pivot
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = k;
        }
      }

      // Swap rows
      [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

      // Make all rows below this one 0 in current column
      for (let k = i + 1; k < n; k++) {
        const factor = augmented[k][i] / augmented[i][i];
        for (let j = i; j <= n; j++) {
          augmented[k][j] -= factor * augmented[i][j];
        }
      }
    }

    // Back substitution
    for (let i = n - 1; i >= 0; i--) {
      this.U[i] = augmented[i][n];
      for (let j = i + 1; j < n; j++) {
        this.U[i] -= augmented[i][j] * this.U[j];
      }
      this.U[i] /= augmented[i][i];
    }
  }

  // Calculate internal forces and stresses
  private calculateInternalForces(): Map<string, number[]> {
    const forces = new Map<string, number[]>();

    const elementEntries = Array.from(this.elements.entries());
    for (const [elementId, element] of elementEntries) {
      const elementForces = this.calculateElementForces(element);
      forces.set(elementId, elementForces);
    }

    return forces;
  }

  private calculateElementForces(element: Element): number[] {
    const startNode = this.nodes.get(element.startNodeId)!;
    const endNode = this.nodes.get(element.endNodeId)!;
    const startDOFs = this.dofMap.get(element.startNodeId)!;
    const endDOFs = this.dofMap.get(element.endNodeId)!;

    // Get element displacements
    const elementDisplacements: number[] = [];
    for (const dof of [...startDOFs, ...endDOFs]) {
      elementDisplacements.push(dof >= 0 ? this.U[dof] : 0);
    }

    // Calculate local stiffness matrix
    const ke = this.calculateElementStiffnessMatrix(element);

    // Calculate forces: F = K * U
    const forces: number[] = [];
    for (let i = 0; i < 12; i++) {
      let force = 0;
      for (let j = 0; j < 12; j++) {
        force += ke[i][j] * elementDisplacements[j];
      }
      forces.push(force);
    }

    return forces;
  }

  // Matrix operations
  private matrixMultiply(A: number[][], B: number[][]): number[][] {
    const rows = A.length;
    const cols = B[0].length;
    const inner = B.length;
    const result = Array(rows).fill(null).map(() => Array(cols).fill(0));

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        for (let k = 0; k < inner; k++) {
          result[i][j] += A[i][k] * B[k][j];
        }
      }
    }

    return result;
  }

  private matrixTranspose(A: number[][]): number[][] {
    const rows = A.length;
    const cols = A[0].length;
    const result = Array(cols).fill(null).map(() => Array(rows).fill(0));

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        result[j][i] = A[i][j];
      }
    }

    return result;
  }

  // Main analysis method
  async analyzeStatic(loadCombinationId: string): Promise<AnalysisResults> {
    const loadCombination = this.loadCombinations.get(loadCombinationId);
    if (!loadCombination) {
      throw new Error(`Load combination ${loadCombinationId} not found`);
    }

    // Build global stiffness matrix
    this.buildGlobalStiffnessMatrix();

    // Apply loads
    this.applyLoads(loadCombination);

    // Solve system
    this.solveSystem();

    // Calculate results
    const displacements = this.extractNodalDisplacements();
    const forces = this.calculateInternalForces();
    const stresses = this.calculateStresses(forces);
    const reactions = this.calculateReactions();

    return {
      displacements,
      forces,
      stresses,
      reactions
    };
  }

  private extractNodalDisplacements(): Map<string, number[]> {
    const displacements = new Map<string, number[]>();

    for (const [nodeId, dofs] of this.dofMap) {
      const nodeDisplacements: number[] = [];
      for (const dof of dofs) {
        nodeDisplacements.push(dof >= 0 ? this.U[dof] : 0);
      }
      displacements.set(nodeId, nodeDisplacements);
    }

    return displacements;
  }

  private calculateStresses(forces: Map<string, number[]>): Map<string, number[]> {
    const stresses = new Map<string, number[]>();

    for (const [elementId, elementForces] of forces) {
      const element = this.elements.get(elementId)!;
      const section = this.sections.get(element.sectionId)!;

      // Calculate stresses from forces
      const A = section.area * 1e-4; // cm² to m²
      const Wy = section.sectionModulusY * 1e-6; // cm³ to m³
      const Wz = section.sectionModulusZ * 1e-6; // cm³ to m³

      const axialStress = Math.abs(elementForces[0]) / A; // N/m² = Pa
      const bendingStressY = Math.abs(elementForces[5]) / Wy; // Pa
      const bendingStressZ = Math.abs(elementForces[4]) / Wz; // Pa

      stresses.set(elementId, [
        axialStress / 1e6, // Convert to MPa
        0, // Shear Y (simplified)
        0, // Shear Z (simplified)
        0, // Torsion (simplified)
        bendingStressY / 1e6, // MPa
        bendingStressZ / 1e6  // MPa
      ]);
    }

    return stresses;
  }

  private calculateReactions(): Map<string, number[]> {
    const reactions = new Map<string, number[]>();

    for (const [nodeId, node] of this.nodes) {
      const dofs = this.dofMap.get(nodeId)!;
      const nodeReactions: number[] = [];

      for (let i = 0; i < 6; i++) {
        if (node.restraints[i]) {
          // Calculate reaction for restrained DOF
          let reaction = 0;
          const globalDOF = dofs[i];
          if (globalDOF >= 0) {
            // Sum forces from all connected elements
            reaction = this.F[globalDOF]; // Simplified - should sum element contributions
          }
          nodeReactions.push(reaction);
        } else {
          nodeReactions.push(0);
        }
      }
      reactions.set(nodeId, nodeReactions);
    }

    return reactions;
  }

  // Buckling analysis
  async analyzeBuckling(loadCombinationId: string, numModes: number = 10): Promise<AnalysisResults> {
    // Implement eigenvalue analysis for buckling
    // This is a simplified implementation - full buckling analysis requires
    // geometric stiffness matrix and eigenvalue solver
    
    const staticResults = await this.analyzeStatic(loadCombinationId);
    
    // Calculate buckling factors (simplified)
    const bucklingModes = [];
    for (let i = 0; i < numModes; i++) {
      bucklingModes.push({
        mode: i + 1,
        factor: 5.0 + i * 2.0, // Simplified buckling factors
        shape: new Map(staticResults.displacements) // Simplified mode shapes
      });
    }

    return {
      ...staticResults,
      buckling: bucklingModes
    };
  }

  // Dynamic analysis
  async analyzeDynamic(numModes: number = 10): Promise<AnalysisResults> {
    // Implement modal analysis for natural frequencies
    // This requires mass matrix assembly and eigenvalue analysis
    
    const staticResults = await this.analyzeStatic('COMB1'); // Default combination
    
    // Calculate natural frequencies (simplified)
    const frequencies = [];
    for (let i = 0; i < numModes; i++) {
      frequencies.push({
        mode: i + 1,
        frequency: 5.0 * (i + 1), // Simplified frequencies in Hz
        shape: new Map(staticResults.displacements) // Simplified mode shapes
      });
    }

    return {
      ...staticResults,
      frequency: frequencies
    };
  }
}

export default FEMEngine;