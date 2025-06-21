import { pgTable, text, serial, integer, real, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  units: text("units").notNull().default("metric"), // metric or imperial
  createdAt: text("created_at").notNull(),
  modelData: jsonb("model_data").$type<{
    elements: any[];
    loads: any[];
    supports: any[];
    materials: any[];
    sections: any[];
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

export const elements = pgTable("elements", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  elementId: text("element_id").notNull(), // user-defined ID like "B1", "C1"
  type: text("type").notNull(), // beam, column, brace
  startX: real("start_x").notNull(),
  startY: real("start_y").notNull(),
  endX: real("end_x").notNull(),
  endY: real("end_y").notNull(),
  materialId: integer("material_id").notNull(),
  sectionId: integer("section_id").notNull(),
  length: real("length").notNull(),
  angle: real("angle").default(0), // rotation angle in degrees
});

export const loads = pgTable("loads", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  loadId: text("load_id").notNull(),
  type: text("type").notNull(), // point, distributed, moment
  elementId: text("element_id"), // null for nodal loads
  nodeX: real("node_x"), // for nodal loads
  nodeY: real("node_y"), // for nodal loads
  position: real("position").default(0), // position along element (0-1)
  magnitude: real("magnitude").notNull(),
  direction: text("direction").notNull(), // x, y, z
  loadCase: text("load_case").notNull().default("Dead Load"),
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
  elementId: text("element_id").notNull(),
  loadCase: text("load_case").notNull(),
  maxMoment: real("max_moment"),
  maxShear: real("max_shear"),
  maxDisplacement: real("max_displacement"),
  maxStress: real("max_stress"),
  utilizationRatio: real("utilization_ratio"),
  resultsData: jsonb("results_data").$type<{
    moments: number[];
    shears: number[];
    displacements: number[];
    positions: number[];
  }>(),
});

// Insert schemas
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true });
export const insertMaterialSchema = createInsertSchema(materials).omit({ id: true });
export const insertSectionSchema = createInsertSchema(sections).omit({ id: true });
export const insertElementSchema = createInsertSchema(elements).omit({ id: true });
export const insertLoadSchema = createInsertSchema(loads).omit({ id: true });
export const insertSupportSchema = createInsertSchema(supports).omit({ id: true });
export const insertAnalysisResultSchema = createInsertSchema(analysisResults).omit({ id: true });

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
