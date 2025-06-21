import { 
  projects, materials, sections, elements, loads, supports, analysisResults,
  type Project, type InsertProject,
  type Material, type InsertMaterial,
  type Section, type InsertSection,
  type Element, type InsertElement,
  type Load, type InsertLoad,
  type Support, type InsertSupport,
  type AnalysisResult, type InsertAnalysisResult
} from "@shared/schema";

export interface IStorage {
  // Projects
  getProject(id: number): Promise<Project | undefined>;
  getAllProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // Materials
  getAllMaterials(): Promise<Material[]>;
  createMaterial(material: InsertMaterial): Promise<Material>;
  deleteMaterial(id: number): Promise<boolean>;

  // Sections
  getAllSections(): Promise<Section[]>;
  createSection(section: InsertSection): Promise<Section>;
  deleteSection(id: number): Promise<boolean>;

  // Elements
  getElementsByProjectId(projectId: number): Promise<Element[]>;
  createElement(element: InsertElement): Promise<Element>;
  updateElement(id: number, updates: Partial<InsertElement>): Promise<Element | undefined>;
  deleteElement(id: number): Promise<boolean>;

  // Loads
  getLoadsByProjectId(projectId: number): Promise<Load[]>;
  createLoad(load: InsertLoad): Promise<Load>;
  updateLoad(id: number, updates: Partial<InsertLoad>): Promise<Load | undefined>;
  deleteLoad(id: number): Promise<boolean>;

  // Supports
  getSupportsByProjectId(projectId: number): Promise<Support[]>;
  createSupport(support: InsertSupport): Promise<Support>;
  updateSupport(id: number, updates: Partial<InsertSupport>): Promise<Support | undefined>;
  deleteSupport(id: number): Promise<boolean>;

  // Analysis Results
  getAnalysisResultsByProjectId(projectId: number): Promise<AnalysisResult[]>;
  createAnalysisResult(result: InsertAnalysisResult): Promise<AnalysisResult>;
  deleteAnalysisResultsByProjectId(projectId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private projects: Map<number, Project> = new Map();
  private materials: Map<number, Material> = new Map();
  private sections: Map<number, Section> = new Map();
  private elements: Map<number, Element> = new Map();
  private loads: Map<number, Load> = new Map();
  private supports: Map<number, Support> = new Map();
  private analysisResults: Map<number, AnalysisResult> = new Map();
  
  private currentProjectId = 1;
  private currentMaterialId = 1;
  private currentSectionId = 1;
  private currentElementId = 1;
  private currentLoadId = 1;
  private currentSupportId = 1;
  private currentAnalysisResultId = 1;

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Default materials
    const steel: Material = { 
      id: this.currentMaterialId++, 
      name: "Steel S355", 
      type: "steel", 
      elasticModulus: 210, 
      density: 7850, 
      yieldStrength: 355, 
      ultimateStrength: 490, 
      poissonRatio: 0.3 
    };
    this.materials.set(steel.id, steel);

    const concrete: Material = { 
      id: this.currentMaterialId++, 
      name: "Concrete C30/37", 
      type: "concrete", 
      elasticModulus: 33, 
      density: 2500, 
      yieldStrength: 30, 
      ultimateStrength: 37, 
      poissonRatio: 0.2 
    };
    this.materials.set(concrete.id, concrete);

    // Default sections
    const ipe240: Section = { 
      id: this.currentSectionId++, 
      name: "IPE 240", 
      type: "I-beam", 
      area: 39.1, 
      momentOfInertiaY: 3892, 
      momentOfInertiaZ: 284, 
      sectionModulusY: 324, 
      sectionModulusZ: 47.3,
      height: 240,
      width: 120,
      thickness: 9.8
    };
    this.sections.set(ipe240.id, ipe240);

    const ipe300: Section = { 
      id: this.currentSectionId++, 
      name: "IPE 300", 
      type: "I-beam", 
      area: 53.8, 
      momentOfInertiaY: 8356, 
      momentOfInertiaZ: 604, 
      sectionModulusY: 557, 
      sectionModulusZ: 80.5,
      height: 300,
      width: 150,
      thickness: 10.7
    };
    this.sections.set(ipe300.id, ipe300);
  }

  // Projects
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async createProject(project: InsertProject): Promise<Project> {
    const newProject: Project = {
      id: this.currentProjectId++,
      name: project.name,
      description: project.description || null,
      units: project.units || "metric",
      analysisType: project.analysisType || "static",
      designCode: project.designCode || "AISC360",
      createdAt: new Date().toISOString(),
      modelData: project.modelData || null,
    };
    this.projects.set(newProject.id, newProject);
    return newProject;
  }

  async updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject = { ...project, ...updates };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }

  // Materials
  async getAllMaterials(): Promise<Material[]> {
    return Array.from(this.materials.values());
  }

  async createMaterial(material: InsertMaterial): Promise<Material> {
    const newMaterial: Material = { 
      id: this.currentMaterialId++,
      name: material.name,
      type: material.type,
      elasticModulus: material.elasticModulus,
      density: material.density,
      yieldStrength: material.yieldStrength || null,
      ultimateStrength: material.ultimateStrength || null,
      poissonRatio: material.poissonRatio || null
    };
    this.materials.set(newMaterial.id, newMaterial);
    return newMaterial;
  }

  async deleteMaterial(id: number): Promise<boolean> {
    return this.materials.delete(id);
  }

  // Sections
  async getAllSections(): Promise<Section[]> {
    return Array.from(this.sections.values());
  }

  async createSection(section: InsertSection): Promise<Section> {
    const newSection: Section = { 
      id: this.currentSectionId++,
      name: section.name,
      type: section.type,
      area: section.area,
      momentOfInertiaY: section.momentOfInertiaY,
      momentOfInertiaZ: section.momentOfInertiaZ,
      sectionModulusY: section.sectionModulusY,
      sectionModulusZ: section.sectionModulusZ,
      height: section.height || null,
      width: section.width || null,
      thickness: section.thickness || null
    };
    this.sections.set(newSection.id, newSection);
    return newSection;
  }

  async deleteSection(id: number): Promise<boolean> {
    return this.sections.delete(id);
  }

  // Elements
  async getElementsByProjectId(projectId: number): Promise<Element[]> {
    return Array.from(this.elements.values()).filter(e => e.projectId === projectId);
  }

  async createElement(element: InsertElement): Promise<Element> {
    const newElement: Element = { 
      id: this.currentElementId++,
      projectId: element.projectId,
      elementId: element.elementId,
      type: element.type,
      startX: element.startX,
      startY: element.startY,
      endX: element.endX,
      endY: element.endY,
      materialId: element.materialId,
      sectionId: element.sectionId,
      length: element.length,
      angle: element.angle || null
    };
    this.elements.set(newElement.id, newElement);
    return newElement;
  }

  async updateElement(id: number, updates: Partial<InsertElement>): Promise<Element | undefined> {
    const element = this.elements.get(id);
    if (!element) return undefined;
    
    const updatedElement = { ...element, ...updates };
    this.elements.set(id, updatedElement);
    return updatedElement;
  }

  async deleteElement(id: number): Promise<boolean> {
    return this.elements.delete(id);
  }

  // Loads
  async getLoadsByProjectId(projectId: number): Promise<Load[]> {
    return Array.from(this.loads.values()).filter(l => l.projectId === projectId);
  }

  async createLoad(load: InsertLoad): Promise<Load> {
    const newLoad: Load = { 
      id: this.currentLoadId++,
      projectId: load.projectId,
      loadId: load.loadId,
      type: load.type,
      elementId: load.elementId || null,
      nodeX: load.nodeX || null,
      nodeY: load.nodeY || null,
      position: load.position || null,
      magnitude: load.magnitude,
      direction: load.direction,
      loadCase: load.loadCase || "Dead Load"
    };
    this.loads.set(newLoad.id, newLoad);
    return newLoad;
  }

  async updateLoad(id: number, updates: Partial<InsertLoad>): Promise<Load | undefined> {
    const load = this.loads.get(id);
    if (!load) return undefined;
    
    const updatedLoad = { ...load, ...updates };
    this.loads.set(id, updatedLoad);
    return updatedLoad;
  }

  async deleteLoad(id: number): Promise<boolean> {
    return this.loads.delete(id);
  }

  // Supports
  async getSupportsByProjectId(projectId: number): Promise<Support[]> {
    return Array.from(this.supports.values()).filter(s => s.projectId === projectId);
  }

  async createSupport(support: InsertSupport): Promise<Support> {
    const newSupport: Support = { 
      id: this.currentSupportId++,
      projectId: support.projectId,
      supportId: support.supportId,
      nodeX: support.nodeX,
      nodeY: support.nodeY,
      fixedX: support.fixedX || null,
      fixedY: support.fixedY || null,
      fixedRotation: support.fixedRotation || null
    };
    this.supports.set(newSupport.id, newSupport);
    return newSupport;
  }

  async updateSupport(id: number, updates: Partial<InsertSupport>): Promise<Support | undefined> {
    const support = this.supports.get(id);
    if (!support) return undefined;
    
    const updatedSupport = { ...support, ...updates };
    this.supports.set(id, updatedSupport);
    return updatedSupport;
  }

  async deleteSupport(id: number): Promise<boolean> {
    return this.supports.delete(id);
  }

  // Analysis Results
  async getAnalysisResultsByProjectId(projectId: number): Promise<AnalysisResult[]> {
    return Array.from(this.analysisResults.values()).filter(r => r.projectId === projectId);
  }

  async createAnalysisResult(result: InsertAnalysisResult): Promise<AnalysisResult> {
    const newResult: AnalysisResult = { 
      id: this.currentAnalysisResultId++,
      projectId: result.projectId,
      elementId: result.elementId,
      loadCase: result.loadCase,
      maxMoment: result.maxMoment || null,
      maxShear: result.maxShear || null,
      maxDisplacement: result.maxDisplacement || null,
      maxStress: result.maxStress || null,
      utilizationRatio: result.utilizationRatio || null,
      resultsData: result.resultsData || null
    };
    this.analysisResults.set(newResult.id, newResult);
    return newResult;
  }

  async deleteAnalysisResultsByProjectId(projectId: number): Promise<boolean> {
    const results = Array.from(this.analysisResults.values()).filter(r => r.projectId === projectId);
    results.forEach(r => this.analysisResults.delete(r.id));
    return true;
  }
}

export const storage = new MemStorage();
