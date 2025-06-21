import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertProjectSchema, insertMaterialSchema, insertSectionSchema, 
  insertElementSchema, insertLoadSchema, insertSupportSchema, insertAnalysisResultSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Projects
  app.get("/api/projects", async (req, res) => {
    const projects = await storage.getAllProjects();
    res.json(projects);
  });

  app.get("/api/projects/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const project = await storage.getProject(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ message: "Invalid project data", error });
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(id, updates);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(400).json({ message: "Invalid project data", error });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteProject(id);
    if (!deleted) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(204).send();
  });

  // Materials
  app.get("/api/materials", async (req, res) => {
    const materials = await storage.getAllMaterials();
    res.json(materials);
  });

  app.post("/api/materials", async (req, res) => {
    try {
      const materialData = insertMaterialSchema.parse(req.body);
      const material = await storage.createMaterial(materialData);
      res.status(201).json(material);
    } catch (error) {
      res.status(400).json({ message: "Invalid material data", error });
    }
  });

  // Sections
  app.get("/api/sections", async (req, res) => {
    const sections = await storage.getAllSections();
    res.json(sections);
  });

  app.post("/api/sections", async (req, res) => {
    try {
      const sectionData = insertSectionSchema.parse(req.body);
      const section = await storage.createSection(sectionData);
      res.status(201).json(section);
    } catch (error) {
      res.status(400).json({ message: "Invalid section data", error });
    }
  });

  // Elements
  app.get("/api/projects/:projectId/elements", async (req, res) => {
    const projectId = parseInt(req.params.projectId);
    const elements = await storage.getElementsByProjectId(projectId);
    res.json(elements);
  });

  app.post("/api/elements", async (req, res) => {
    try {
      const elementData = insertElementSchema.parse(req.body);
      const element = await storage.createElement(elementData);
      res.status(201).json(element);
    } catch (error) {
      res.status(400).json({ message: "Invalid element data", error });
    }
  });

  app.put("/api/elements/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertElementSchema.partial().parse(req.body);
      const element = await storage.updateElement(id, updates);
      if (!element) {
        return res.status(404).json({ message: "Element not found" });
      }
      res.json(element);
    } catch (error) {
      res.status(400).json({ message: "Invalid element data", error });
    }
  });

  app.delete("/api/elements/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteElement(id);
    if (!deleted) {
      return res.status(404).json({ message: "Element not found" });
    }
    res.status(204).send();
  });

  // Loads
  app.get("/api/projects/:projectId/loads", async (req, res) => {
    const projectId = parseInt(req.params.projectId);
    const loads = await storage.getLoadsByProjectId(projectId);
    res.json(loads);
  });

  app.post("/api/loads", async (req, res) => {
    try {
      const loadData = insertLoadSchema.parse(req.body);
      const load = await storage.createLoad(loadData);
      res.status(201).json(load);
    } catch (error) {
      res.status(400).json({ message: "Invalid load data", error });
    }
  });

  app.put("/api/loads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertLoadSchema.partial().parse(req.body);
      const load = await storage.updateLoad(id, updates);
      if (!load) {
        return res.status(404).json({ message: "Load not found" });
      }
      res.json(load);
    } catch (error) {
      res.status(400).json({ message: "Invalid load data", error });
    }
  });

  app.delete("/api/loads/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteLoad(id);
    if (!deleted) {
      return res.status(404).json({ message: "Load not found" });
    }
    res.status(204).send();
  });

  // Supports
  app.get("/api/projects/:projectId/supports", async (req, res) => {
    const projectId = parseInt(req.params.projectId);
    const supports = await storage.getSupportsByProjectId(projectId);
    res.json(supports);
  });

  app.post("/api/supports", async (req, res) => {
    try {
      const supportData = insertSupportSchema.parse(req.body);
      const support = await storage.createSupport(supportData);
      res.status(201).json(support);
    } catch (error) {
      res.status(400).json({ message: "Invalid support data", error });
    }
  });

  // Analysis
  app.post("/api/projects/:projectId/analyze", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      // Get project data
      const elements = await storage.getElementsByProjectId(projectId);
      const loads = await storage.getLoadsByProjectId(projectId);
      const supports = await storage.getSupportsByProjectId(projectId);
      
      // Clear existing results
      await storage.deleteAnalysisResultsByProjectId(projectId);
      
      // Run structural analysis (simplified)
      const results = await runStructuralAnalysis(projectId, elements, loads, supports);
      
      // Store results
      for (const result of results) {
        await storage.createAnalysisResult(result);
      }
      
      res.json({ message: "Analysis completed", results });
    } catch (error) {
      res.status(500).json({ message: "Analysis failed", error });
    }
  });

  app.get("/api/projects/:projectId/results", async (req, res) => {
    const projectId = parseInt(req.params.projectId);
    const results = await storage.getAnalysisResultsByProjectId(projectId);
    res.json(results);
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Simplified structural analysis function
async function runStructuralAnalysis(projectId: number, elements: any[], loads: any[], supports: any[]) {
  const results = [];
  
  for (const element of elements) {
    // Simplified beam analysis using basic beam theory
    const elementLoads = loads.filter(l => l.elementId === element.elementId);
    
    let maxMoment = 0;
    let maxShear = 0;
    let maxDisplacement = 0;
    
    // Calculate basic values for each load case
    for (const load of elementLoads) {
      if (load.type === "point") {
        // Point load calculations
        const L = element.length;
        const P = load.magnitude;
        const a = load.position * L;
        
        // Maximum moment for simply supported beam with point load
        maxMoment = Math.max(maxMoment, (P * a * (L - a)) / L);
        maxShear = Math.max(maxShear, Math.max(P * (L - a) / L, P * a / L));
        
        // Rough displacement calculation (assuming E and I)
        const E = 210e9; // Pa
        const I = 3892e-8; // m⁴ (converted from cm⁴)
        maxDisplacement = Math.max(maxDisplacement, (P * a * (L - a) * Math.sqrt(3 * (L * L - 4 * a * (L - a)))) / (27 * E * I * L));
      } else if (load.type === "distributed") {
        // Distributed load calculations
        const L = element.length;
        const w = load.magnitude;
        
        maxMoment = Math.max(maxMoment, w * L * L / 8);
        maxShear = Math.max(maxShear, w * L / 2);
        
        const E = 210e9;
        const I = 3892e-8;
        maxDisplacement = Math.max(maxDisplacement, (5 * w * Math.pow(L, 4)) / (384 * E * I));
      }
    }
    
    // Generate detailed results arrays (positions along beam)
    const positions = [];
    const moments = [];
    const shears = [];
    const displacements = [];
    
    for (let i = 0; i <= 20; i++) {
      const x = (i / 20) * element.length;
      positions.push(x);
      
      // Simplified moment distribution
      moments.push(maxMoment * Math.sin((Math.PI * x) / element.length));
      shears.push(maxShear * Math.cos((Math.PI * x) / element.length));
      displacements.push(maxDisplacement * Math.sin((Math.PI * x) / element.length));
    }
    
    const utilizationRatio = maxMoment / (355e6 * 324e-6); // stress / yield stress
    
    results.push({
      projectId,
      elementId: element.elementId,
      loadCase: "Dead Load",
      maxMoment: maxMoment / 1000, // Convert to kNm
      maxShear: maxShear / 1000, // Convert to kN
      maxDisplacement: maxDisplacement * 1000, // Convert to mm
      maxStress: maxMoment / (324e-6), // Pa
      utilizationRatio,
      resultsData: {
        positions,
        moments: moments.map(m => m / 1000),
        shears: shears.map(s => s / 1000),
        displacements: displacements.map(d => d * 1000)
      }
    });
  }
  
  return results;
}
