import { pgTable, text, serial, integer, real, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  units: text("units").notNull().default("metric"), // metric or imperial
  analysisType: text("analysis_type").notNull().default("static"), // static, dynamic, buckling, nonlinear
  designCode: text("design_code").notNull().default("AISC"), // AISC, EC3, BS, etc.
  createdAt: text("created_at").notNull(),
  modelData: jsonb("model_data").$type<{
    elements: any[];
    loads: any[];
    supports: any[];
    materials: any[];
    sections: any[];
    nodes: any[];
    meshSettings: any;
  }>(),
});

export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // steel, concrete, timber, etc.
  elasticModulus: real("elastic_modulus").notNull(), // E in GPa
  density: real("density").notNull(), // kg/m³
  yieldStrength: real("yield_strength"), // MPa
  ultimateStrength: real("ultimate_strength"), // MPa
  poissonRatio: real("poisson_ratio").default(0.3),
});

export const sections = pgTable("sections", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // I-beam, rectangular, circular, etc.
  area: real("area").notNull(), // cm²
  momentOfInertiaY: real("moment_of_inertia_y").notNull(), // cm⁴
  momentOfInertiaZ: real("moment_of_inertia_z").notNull(), // cm⁴
  sectionModulusY: real("section_modulus_y").notNull(), // cm³
  sectionModulusZ: real("section_modulus_z").notNull(), // cm³
  height: real("height"), // mm
  width: real("width"), // mm
  thickness: real("thickness"), // mm
});

export const nodes = pgTable("nodes", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  nodeId: text("node_id").notNull(), // user-defined ID like "N1", "N2"
  x: real("x").notNull(),
  y: real("y").notNull(),
  z: real("z").default(0), // for 3D analysis
  restraintX: boolean("restraint_x").default(false),
  restraintY: boolean("restraint_y").default(false),
  restraintZ: boolean("restraint_z").default(false),
  restraintRX: boolean("restraint_rx").default(false),
  restraintRY: boolean("restraint_ry").default(false),
  restraintRZ: boolean("restraint_rz").default(false),
});

export const elements = pgTable("elements", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  elementId: text("element_id").notNull(), // user-defined ID like "B1", "C1"
  type: text("type").notNull(), // beam, column, brace, truss, plate, shell
  startNodeId: text("start_node_id").notNull(),
  endNodeId: text("end_node_id").notNull(),
  materialId: integer("material_id").notNull(),
  sectionId: integer("section_id").notNull(),
  length: real("length").notNull(),
  angle: real("angle").default(0), // rotation angle in degrees
  releaseStart: text("release_start").default("000000"), // moment releases: MX,MY,MZ,FX,FY,FZ
  releaseEnd: text("release_end").default("000000"),
  meshSize: real("mesh_size").default(0.5), // for FEM mesh generation
});

export const loadCases = pgTable("load_cases", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // dead, live, wind, earthquake, snow, etc.
  factor: real("factor").default(1.0),
  description: text("description"),
});

export const loadCombinations = pgTable("load_combinations", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // ultimate, serviceability
  equation: text("equation").notNull(), // e.g., "1.2*DL + 1.6*LL"
  factors: jsonb("factors").$type<{ [loadCaseId: string]: number }>(),
});

export const loads = pgTable("loads", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  loadId: text("load_id").notNull(),
  loadCaseId: integer("load_case_id").notNull(),
  type: text("type").notNull(), // point, distributed, moment, pressure, temperature
  elementId: text("element_id"), // null for nodal loads
  nodeId: text("node_id"), // for nodal loads
  position: real("position").default(0), // position along element (0-1)
  magnitude: real("magnitude").notNull(),
  direction: text("direction").notNull(), // x, y, z, mx, my, mz
  distributedEnd: real("distributed_end"), // for trapezoidal loads
  isProjected: boolean("is_projected").default(false), // for wind loads
});

export const supports = pgTable("supports", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  supportId: text("support_id").notNull(),
  nodeX: real("node_x").notNull(),
  nodeY: real("node_y").notNull(),
  fixedX: boolean("fixed_x").default(false),
  fixedY: boolean("fixed_y").default(false),
  fixedRotation: boolean("fixed_rotation").default(false),
});

export const analysisResults = pgTable("analysis_results", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  loadCombinationId: integer("load_combination_id").notNull(),
  elementId: text("element_id"),
  nodeId: text("node_id"),
  resultType: text("result_type").notNull(), // displacement, force, stress, buckling
  maxValue: real("max_value"),
  minValue: real("min_value"),
  criticalLocation: real("critical_location"), // position along element
  utilizationRatio: real("utilization_ratio"),
  safetyFactor: real("safety_factor"),
  resultsData: jsonb("results_data").$type<{
    positions?: number[];
    values?: number[];
    displacements?: { x: number[]; y: number[]; z: number[]; rx: number[]; ry: number[]; rz: number[] };
    forces?: { fx: number[]; fy: number[]; fz: number[]; mx: number[]; my: number[]; mz: number[] };
    stresses?: { axial: number[]; shearY: number[]; shearZ: number[]; torsion: number[]; bendingY: number[]; bendingZ: number[] };
  }>(),
});

export const designResults = pgTable("design_results", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  elementId: text("element_id").notNull(),
  designCode: text("design_code").notNull(),
  checkType: text("check_type").notNull(), // strength, stability, deflection, vibration
  utilizationRatio: real("utilization_ratio").notNull(),
  controllingCase: text("controlling_case"),
  passed: boolean("passed").notNull(),
  recommendations: text("recommendations"),
  designData: jsonb("design_data").$type<{
    capacities?: { [key: string]: number };
    demands?: { [key: string]: number };
    factors?: { [key: string]: number };
  }>(),
});

// Insert schemas
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true });
export const insertMaterialSchema = createInsertSchema(materials).omit({ id: true });
export const insertSectionSchema = createInsertSchema(sections).omit({ id: true });
export const insertNodeSchema = createInsertSchema(nodes).omit({ id: true });
export const insertElementSchema = createInsertSchema(elements).omit({ id: true });
export const insertLoadCaseSchema = createInsertSchema(loadCases).omit({ id: true });
export const insertLoadCombinationSchema = createInsertSchema(loadCombinations).omit({ id: true });
export const insertLoadSchema = createInsertSchema(loads).omit({ id: true });
export const insertSupportSchema = createInsertSchema(supports).omit({ id: true });
export const insertAnalysisResultSchema = createInsertSchema(analysisResults).omit({ id: true });
export const insertDesignResultSchema = createInsertSchema(designResults).omit({ id: true });

// Types
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Material = typeof materials.$inferSelect;
export type InsertMaterial = z.infer<typeof insertMaterialSchema>;
export type Section = typeof sections.$inferSelect;
export type InsertSection = z.infer<typeof insertSectionSchema>;
export type Element = typeof elements.$inferSelect;
export type InsertElement = z.infer<typeof insertElementSchema>;
export type Load = typeof loads.$inferSelect;
export type InsertLoad = z.infer<typeof insertLoadSchema>;
export type Support = typeof supports.$inferSelect;
export type InsertSupport = z.infer<typeof insertSupportSchema>;
export type AnalysisResult = typeof analysisResults.$inferSelect;
export type InsertAnalysisResult = z.infer<typeof insertAnalysisResultSchema>;
