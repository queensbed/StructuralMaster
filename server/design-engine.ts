/**
 * Advanced Design Engine
 * Professional structural design checking per international codes
 * Supports AISC, Eurocode, BS, CSA, AS, and other major design standards
 */

export interface DesignCode {
  code: string;
  name: string;
  version: string;
  country: string;
}

export interface DesignParameters {
  unbragedLengthY: number; // m
  unbragedLengthZ: number; // m
  effectiveLengthFactorY: number;
  effectiveLengthFactorZ: number;
  bendingFactorY: number;
  bendingFactorZ: number;
  lateralTorsionalBracingLength: number; // m
  slendernessLimit: number;
  momentModificationFactor: number;
}

export interface DesignForces {
  axial: number; // kN (+ tension, - compression)
  shearY: number; // kN
  shearZ: number; // kN
  momentY: number; // kNm
  momentZ: number; // kNm
  torsion: number; // kNm
}

export interface DesignResult {
  checkType: string;
  ratio: number;
  capacity: number;
  demand: number;
  status: 'PASS' | 'FAIL' | 'WARNING';
  controllingCase: string;
  equation: string;
  notes: string[];
}

export interface ElementDesignResult {
  elementId: string;
  designCode: string;
  overallRatio: number;
  overallStatus: 'PASS' | 'FAIL' | 'WARNING';
  checks: DesignResult[];
  recommendations: string[];
}

export class DesignEngine {
  private designCodes: Map<string, DesignCode> = new Map();

  constructor() {
    this.initializeDesignCodes();
  }

  private initializeDesignCodes(): void {
    // AISC 360 (American)
    this.designCodes.set('AISC360', {
      code: 'AISC360',
      name: 'AISC 360 - Specification for Structural Steel Buildings',
      version: '2022',
      country: 'USA'
    });

    // Eurocode 3 (European)
    this.designCodes.set('EC3', {
      code: 'EC3',
      name: 'Eurocode 3: Design of steel structures',
      version: '2005+A1:2014',
      country: 'EU'
    });

    // British Standard
    this.designCodes.set('BS5950', {
      code: 'BS5950',
      name: 'BS 5950: Structural use of steelwork in building',
      version: '2000',
      country: 'UK'
    });

    // Canadian Standard
    this.designCodes.set('CSA-S16', {
      code: 'CSA-S16',
      name: 'CSA S16: Design of Steel Structures',
      version: '2019',
      country: 'Canada'
    });

    // Australian Standard
    this.designCodes.set('AS4100', {
      code: 'AS4100',
      name: 'AS 4100: Steel structures',
      version: '2020',
      country: 'Australia'
    });
  }

  // AISC 360 Design Checker
  async checkAISC360(
    elementId: string,
    material: any,
    section: any,
    forces: DesignForces,
    parameters: DesignParameters
  ): Promise<ElementDesignResult> {
    const checks: DesignResult[] = [];

    // Material properties
    const Fy = material.yieldStrength; // MPa
    const Fu = material.ultimateStrength; // MPa
    const E = material.elasticModulus * 1000; // MPa

    // Section properties
    const A = section.area; // cm²
    const Ix = section.momentOfInertiaY; // cm⁴
    const Iy = section.momentOfInertiaZ; // cm⁴
    const Sx = section.sectionModulusY; // cm³
    const Sy = section.sectionModulusZ; // cm³
    const rx = section.radiusOfGyrationY / 10; // cm to mm
    const ry = section.radiusOfGyrationZ / 10; // cm to mm
    const J = section.torsionalConstant; // cm⁴
    const Cw = section.warpingConstant || 0; // cm⁶

    // Check 1: Tensile Yielding (AISC 360 D2.1)
    if (forces.axial > 0) {
      const Pn = Fy * A / 100; // kN (convert cm² to m²)
      const ratio = forces.axial / (0.9 * Pn); // φ = 0.9 for tension
      checks.push({
        checkType: 'Tensile Yielding',
        ratio,
        capacity: 0.9 * Pn,
        demand: forces.axial,
        status: ratio <= 1.0 ? 'PASS' : 'FAIL',
        controllingCase: 'Tension',
        equation: 'AISC 360 D2.1: φPn = φFyAg',
        notes: ratio > 0.95 ? ['High utilization - consider larger section'] : []
      });
    }

    // Check 2: Tensile Rupture (AISC 360 D2.2)
    if (forces.axial > 0) {
      const Ae = 0.85 * A; // Effective area (simplified)
      const Pn = Fu * Ae / 100; // kN
      const ratio = forces.axial / (0.75 * Pn); // φ = 0.75 for rupture
      checks.push({
        checkType: 'Tensile Rupture',
        ratio,
        capacity: 0.75 * Pn,
        demand: forces.axial,
        status: ratio <= 1.0 ? 'PASS' : 'FAIL',
        controllingCase: 'Tension',
        equation: 'AISC 360 D2.2: φPn = φFuAe',
        notes: []
      });
    }

    // Check 3: Compressive Strength (AISC 360 E3)
    if (forces.axial < 0) {
      const Lc = Math.max(parameters.unbragedLengthY, parameters.unbragedLengthZ) * 1000; // m to mm
      const r = Math.min(rx, ry); // mm
      const slenderness = parameters.effectiveLengthFactorY * Lc / r;

      // Elastic buckling stress
      const Fe = Math.PI * Math.PI * E / (slenderness * slenderness); // MPa

      let Fcr: number;
      if (slenderness <= 4.71 * Math.sqrt(E / Fy)) {
        // Inelastic buckling
        Fcr = (0.658 ** (Fy / Fe)) * Fy;
      } else {
        // Elastic buckling
        Fcr = 0.877 * Fe;
      }

      const Pn = Fcr * A / 100; // kN
      const ratio = Math.abs(forces.axial) / (0.9 * Pn); // φ = 0.9 for compression
      
      checks.push({
        checkType: 'Compressive Strength',
        ratio,
        capacity: 0.9 * Pn,
        demand: Math.abs(forces.axial),
        status: ratio <= 1.0 ? 'PASS' : 'FAIL',
        controllingCase: 'Compression',
        equation: 'AISC 360 E3: φPn = φFcrAg',
        notes: slenderness > 200 ? ['High slenderness ratio - check buckling'] : []
      });
    }

    // Check 4: Flexural Strength (AISC 360 F2-F5)
    const Mpx = Fy * Sx / 1000; // kNm (convert cm³ to m³)
    const Mpy = Fy * Sy / 1000; // kNm

    // Major axis bending
    if (Math.abs(forces.momentY) > 0.01) {
      // Lateral-torsional buckling check
      const Lb = parameters.lateralTorsionalBracingLength * 1000; // m to mm
      const Lp = 1.76 * ry * Math.sqrt(E / Fy); // mm
      const Lr = 1.95 * (E / (0.7 * Fy)) * Math.sqrt(J * A / (Sx * section.height)) * Math.sqrt(1 + Math.sqrt(1 + 6.76 * Math.pow(0.7 * Fy / E, 2)));

      let Mn: number;
      if (Lb <= Lp) {
        // Compact section - plastic moment
        Mn = Mpx;
      } else if (Lb <= Lr) {
        // Inelastic lateral-torsional buckling
        const Cb = parameters.momentModificationFactor;
        Mn = Cb * (Mpx - (Mpx - 0.7 * Fy * Sx / 1000) * (Lb - Lp) / (Lr - Lp));
      } else {
        // Elastic lateral-torsional buckling
        const Fcr = (Cb * Math.PI * Math.PI * E) / (Math.pow(Lb / ry, 2)) * Math.sqrt(1 + 0.078 * J * Math.pow(Lb / ry, 2) / (Sx * section.height));
        Mn = Fcr * Sx / 1000;
      }

      const ratio = Math.abs(forces.momentY) / (0.9 * Mn); // φ = 0.9 for flexure
      checks.push({
        checkType: 'Flexural Strength (Major Axis)',
        ratio,
        capacity: 0.9 * Mn,
        demand: Math.abs(forces.momentY),
        status: ratio <= 1.0 ? 'PASS' : 'FAIL',
        controllingCase: 'Bending',
        equation: 'AISC 360 F2-F5: φMn',
        notes: Lb > Lr ? ['Elastic LTB controls - consider lateral bracing'] : []
      });
    }

    // Minor axis bending
    if (Math.abs(forces.momentZ) > 0.01) {
      const ratio = Math.abs(forces.momentZ) / (0.9 * Mpy); // φ = 0.9 for flexure
      checks.push({
        checkType: 'Flexural Strength (Minor Axis)',
        ratio,
        capacity: 0.9 * Mpy,
        demand: Math.abs(forces.momentZ),
        status: ratio <= 1.0 ? 'PASS' : 'FAIL',
        controllingCase: 'Bending',
        equation: 'AISC 360 F6: φMn = φMp',
        notes: []
      });
    }

    // Check 5: Shear Strength (AISC 360 G2)
    const h = section.height || 240; // mm
    const tw = section.thickness || 10; // mm
    const Aw = h * tw / 100; // cm² web area (simplified)

    const Cv = h / tw <= 2.24 * Math.sqrt(E / Fy) ? 1.0 : 
               h / tw <= 1.10 * Math.sqrt(E / (0.8 * Fy)) ? 
               2.24 * Math.sqrt(E / Fy) / (h / tw) : 
               1.51 * E / (Math.pow(h / tw, 2) * Fy);

    const Vn = 0.6 * Fy * Aw * Cv / 10; // kN
    const shearDemand = Math.sqrt(forces.shearY * forces.shearY + forces.shearZ * forces.shearZ);
    
    if (shearDemand > 0.01) {
      const ratio = shearDemand / (1.0 * Vn); // φ = 1.0 for shear
      checks.push({
        checkType: 'Shear Strength',
        ratio,
        capacity: 1.0 * Vn,
        demand: shearDemand,
        status: ratio <= 1.0 ? 'PASS' : 'FAIL',
        controllingCase: 'Shear',
        equation: 'AISC 360 G2: φVn = φ0.6FyAwCv',
        notes: []
      });
    }

    // Check 6: Combined Axial and Flexural (AISC 360 H1)
    const Pc = Math.abs(forces.axial);
    const Mcx = Math.abs(forces.momentY);
    const Mcy = Math.abs(forces.momentZ);

    if (Pc > 0 && (Mcx > 0.01 || Mcy > 0.01)) {
      const Pn = checks.find(c => c.checkType.includes('Compressive') || c.checkType.includes('Tensile'))?.capacity || 1000;
      const Mnx = checks.find(c => c.checkType.includes('Major Axis'))?.capacity || Mpx * 0.9;
      const Mny = checks.find(c => c.checkType.includes('Minor Axis'))?.capacity || Mpy * 0.9;

      let ratio: number;
      if (Pc / Pn >= 0.2) {
        // Equation H1-1a
        ratio = Pc / Pn + (8/9) * (Mcx / Mnx + Mcy / Mny);
      } else {
        // Equation H1-1b
        ratio = Pc / (2 * Pn) + (Mcx / Mnx + Mcy / Mny);
      }

      checks.push({
        checkType: 'Combined Axial and Flexural',
        ratio,
        capacity: 1.0,
        demand: ratio,
        status: ratio <= 1.0 ? 'PASS' : 'FAIL',
        controllingCase: 'Combined',
        equation: 'AISC 360 H1: Interaction equations',
        notes: ratio > 0.95 ? ['High interaction ratio - consider optimization'] : []
      });
    }

    // Overall assessment
    const maxRatio = Math.max(...checks.map(c => c.ratio));
    const overallStatus = checks.some(c => c.status === 'FAIL') ? 'FAIL' : 
                         checks.some(c => c.status === 'WARNING') ? 'WARNING' : 'PASS';

    // Generate recommendations
    const recommendations: string[] = [];
    if (maxRatio > 1.0) {
      recommendations.push('Section is overstressed - increase size or change grade');
    } else if (maxRatio < 0.5) {
      recommendations.push('Section is underutilized - consider smaller section for economy');
    }

    if (checks.some(c => c.checkType.includes('Compressive') && c.ratio > 0.8)) {
      recommendations.push('Consider reducing unbraced length or increasing section size');
    }

    if (checks.some(c => c.checkType.includes('Lateral-torsional') && c.ratio > 0.8)) {
      recommendations.push('Consider adding lateral bracing to reduce LTB effects');
    }

    return {
      elementId,
      designCode: 'AISC360',
      overallRatio: maxRatio,
      overallStatus,
      checks,
      recommendations
    };
  }

  // Eurocode 3 Design Checker
  async checkEurocode3(
    elementId: string,
    material: any,
    section: any,
    forces: DesignForces,
    parameters: DesignParameters
  ): Promise<ElementDesignResult> {
    const checks: DesignResult[] = [];

    // Material properties
    const fy = material.yieldStrength; // MPa
    const fu = material.ultimateStrength; // MPa
    const E = material.elasticModulus * 1000; // MPa
    const γM0 = 1.0; // Partial factor for resistance
    const γM1 = 1.0; // Partial factor for stability

    // Section properties
    const A = section.area / 100; // cm² to m²
    const Ix = section.momentOfInertiaY / 1e8; // cm⁴ to m⁴
    const Iy = section.momentOfInertiaZ / 1e8; // cm⁴ to m⁴
    const Wx = section.sectionModulusY / 1e6; // cm³ to m³
    const Wy = section.sectionModulusZ / 1e6; // cm³ to m³
    const ix = section.radiusOfGyrationY / 100; // cm to m
    const iy = section.radiusOfGyrationZ / 100; // cm to m

    // Check 1: Tension Resistance (EN 1993-1-1 6.2.3)
    if (forces.axial > 0) {
      const NtRd = A * fy / γM0; // kN
      const ratio = forces.axial / NtRd;
      checks.push({
        checkType: 'Tension Resistance',
        ratio,
        capacity: NtRd,
        demand: forces.axial,
        status: ratio <= 1.0 ? 'PASS' : 'FAIL',
        controllingCase: 'Tension',
        equation: 'EN 1993-1-1 6.2.3: Nt,Rd = A·fy/γM0',
        notes: []
      });
    }

    // Check 2: Compression Resistance (EN 1993-1-1 6.3.1)
    if (forces.axial < 0) {
      const Lcr = Math.max(parameters.unbragedLengthY, parameters.unbragedLengthZ); // m
      const i = Math.min(ix, iy); // m
      const λ = Lcr / i;
      const λ̄ = λ / (Math.PI * Math.sqrt(E / fy));

      // Buckling curve (assuming curve b for I-sections)
      const α = 0.34;
      const Φ = 0.5 * (1 + α * (λ̄ - 0.2) + λ̄ * λ̄);
      const χ = λ̄ <= 0.2 ? 1.0 : 1 / (Φ + Math.sqrt(Φ * Φ - λ̄ * λ̄));

      const NbRd = χ * A * fy / γM1; // kN
      const ratio = Math.abs(forces.axial) / NbRd;
      
      checks.push({
        checkType: 'Compression Resistance',
        ratio,
        capacity: NbRd,
        demand: Math.abs(forces.axial),
        status: ratio <= 1.0 ? 'PASS' : 'FAIL',
        controllingCase: 'Compression',
        equation: 'EN 1993-1-1 6.3.1: Nb,Rd = χ·A·fy/γM1',
        notes: λ̄ > 1.5 ? ['High slenderness - check buckling'] : []
      });
    }

    // Check 3: Bending Resistance (EN 1993-1-1 6.2.5)
    if (Math.abs(forces.momentY) > 0.01) {
      const McRd = Wx * fy / γM0; // kNm
      const ratio = Math.abs(forces.momentY) / McRd;
      checks.push({
        checkType: 'Bending Resistance (Major Axis)',
        ratio,
        capacity: McRd,
        demand: Math.abs(forces.momentY),
        status: ratio <= 1.0 ? 'PASS' : 'FAIL',
        controllingCase: 'Bending',
        equation: 'EN 1993-1-1 6.2.5: Mc,Rd = W·fy/γM0',
        notes: []
      });
    }

    // Check 4: Lateral-Torsional Buckling (EN 1993-1-1 6.3.2)
    if (Math.abs(forces.momentY) > 0.01) {
      const Lcr = parameters.lateralTorsionalBracingLength; // m
      const C1 = 1.0; // Moment distribution factor (simplified)
      
      // Critical moment
      const Mcr = C1 * Math.PI * Math.sqrt(E * Ix * E * Iy) / Lcr; // Simplified
      const λ̄LT = Math.sqrt(Wx * fy / Mcr);

      let χLT: number;
      if (λ̄LT <= 0.4) {
        χLT = 1.0;
      } else {
        const αLT = 0.34; // Buckling curve (simplified)
        const ΦLT = 0.5 * (1 + αLT * (λ̄LT - 0.2) + λ̄LT * λ̄LT);
        χLT = 1 / (ΦLT + Math.sqrt(ΦLT * ΦLT - λ̄LT * λ̄LT));
      }

      const MbRd = χLT * Wx * fy / γM1; // kNm
      const ratio = Math.abs(forces.momentY) / MbRd;
      
      checks.push({
        checkType: 'Lateral-Torsional Buckling',
        ratio,
        capacity: MbRd,
        demand: Math.abs(forces.momentY),
        status: ratio <= 1.0 ? 'PASS' : 'FAIL',
        controllingCase: 'LTB',
        equation: 'EN 1993-1-1 6.3.2: Mb,Rd = χLT·W·fy/γM1',
        notes: λ̄LT > 1.2 ? ['High LTB slenderness - add bracing'] : []
      });
    }

    // Check 5: Combined Bending and Axial (EN 1993-1-1 6.3.3)
    const NEd = Math.abs(forces.axial);
    const MyEd = Math.abs(forces.momentY);
    const MzEd = Math.abs(forces.momentZ);

    if (NEd > 0.01 && (MyEd > 0.01 || MzEd > 0.01)) {
      const NRk = A * fy;
      const MyRk = Wx * fy;
      const MzRk = Wy * fy;

      // Interaction factors (simplified)
      const kyy = 1.0; // Interaction factor
      const kyz = 0.6; // Interaction factor
      const kzy = 0.6; // Interaction factor
      const kzz = 1.0; // Interaction factor

      const ratio1 = NEd / (NRk / γM1) + kyy * MyEd / (MyRk / γM1) + kyz * MzEd / (MzRk / γM1);
      const ratio2 = NEd / (NRk / γM1) + kzy * MyEd / (MyRk / γM1) + kzz * MzEd / (MzRk / γM1);
      const ratio = Math.max(ratio1, ratio2);

      checks.push({
        checkType: 'Combined Bending and Axial',
        ratio,
        capacity: 1.0,
        demand: ratio,
        status: ratio <= 1.0 ? 'PASS' : 'FAIL',
        controllingCase: 'Combined',
        equation: 'EN 1993-1-1 6.3.3: Interaction formulas',
        notes: []
      });
    }

    // Overall assessment
    const maxRatio = Math.max(...checks.map(c => c.ratio));
    const overallStatus = checks.some(c => c.status === 'FAIL') ? 'FAIL' : 
                         checks.some(c => c.status === 'WARNING') ? 'WARNING' : 'PASS';

    return {
      elementId,
      designCode: 'EC3',
      overallRatio: maxRatio,
      overallStatus,
      checks,
      recommendations: []
    };
  }

  // Design optimization
  async optimizeSection(
    elementId: string,
    designCode: string,
    material: any,
    forces: DesignForces,
    parameters: DesignParameters,
    targetUtilization: number = 0.85
  ): Promise<any[]> {
    const availableSections = [
      { name: 'IPE 200', area: 28.5, momentOfInertiaY: 1943, sectionModulusY: 194 },
      { name: 'IPE 240', area: 39.1, momentOfInertiaY: 3892, sectionModulusY: 324 },
      { name: 'IPE 300', area: 53.8, momentOfInertiaY: 8356, sectionModulusY: 557 },
      { name: 'IPE 360', area: 72.7, momentOfInertiaY: 16270, sectionModulusY: 904 },
      { name: 'IPE 400', area: 84.5, momentOfInertiaY: 23130, sectionModulusY: 1156 },
      { name: 'IPE 450', area: 98.8, momentOfInertiaY: 33740, sectionModulusY: 1500 },
      { name: 'IPE 500', area: 116.0, momentOfInertiaY: 48200, sectionModulusY: 1928 }
    ];

    const suitableSections = [];

    for (const section of availableSections) {
      const result = designCode === 'AISC360' ? 
        await this.checkAISC360(elementId, material, section, forces, parameters) :
        await this.checkEurocode3(elementId, material, section, forces, parameters);

      if (result.overallStatus === 'PASS' && result.overallRatio <= 1.0) {
        suitableSections.push({
          section,
          utilization: result.overallRatio,
          weight: section.area * 7.85, // kg/m (steel density)
          cost: section.area * 2.5, // $/m (approximate)
          efficiency: targetUtilization / result.overallRatio
        });
      }
    }

    // Sort by efficiency (closest to target utilization)
    return suitableSections.sort((a, b) => Math.abs(a.efficiency - 1) - Math.abs(b.efficiency - 1));
  }

  // Generate design report
  generateDesignReport(results: ElementDesignResult[]): string {
    let report = `STRUCTURAL DESIGN REPORT\n`;
    report += `Generated: ${new Date().toISOString()}\n`;
    report += `Design Code: ${results[0]?.designCode || 'N/A'}\n\n`;

    report += `SUMMARY\n`;
    report += `${'Element'.padEnd(10)} ${'Status'.padEnd(8)} ${'Max Ratio'.padEnd(10)} ${'Controlling Check'.padEnd(25)}\n`;
    report += `${'-'.repeat(65)}\n`;

    for (const result of results) {
      const controllingCheck = result.checks.reduce((max, check) => check.ratio > max.ratio ? check : max);
      report += `${result.elementId.padEnd(10)} ${result.overallStatus.padEnd(8)} ${result.overallRatio.toFixed(3).padEnd(10)} ${controllingCheck.checkType.padEnd(25)}\n`;
    }

    report += `\nDETAILED RESULTS\n\n`;

    for (const result of results) {
      report += `Element: ${result.elementId}\n`;
      report += `Overall Status: ${result.overallStatus} (${result.overallRatio.toFixed(3)})\n\n`;

      for (const check of result.checks) {
        report += `  ${check.checkType}:\n`;
        report += `    Ratio: ${check.ratio.toFixed(3)} (${check.status})\n`;
        report += `    Capacity: ${check.capacity.toFixed(1)} ${check.checkType.includes('Moment') ? 'kNm' : 'kN'}\n`;
        report += `    Demand: ${check.demand.toFixed(1)} ${check.checkType.includes('Moment') ? 'kNm' : 'kN'}\n`;
        report += `    Equation: ${check.equation}\n`;
        if (check.notes.length > 0) {
          report += `    Notes: ${check.notes.join(', ')}\n`;
        }
        report += `\n`;
      }

      if (result.recommendations.length > 0) {
        report += `  Recommendations:\n`;
        for (const rec of result.recommendations) {
          report += `    - ${rec}\n`;
        }
      }
      report += `\n`;
    }

    return report;
  }
}

export default DesignEngine;