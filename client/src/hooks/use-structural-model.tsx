import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Project, Element, Load, Support, AnalysisResult, Material, Section,
  InsertProject, InsertElement, InsertLoad, InsertSupport 
} from "@shared/schema";

export function useStructuralModel() {
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Queries
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: project } = useQuery<Project>({
    queryKey: ["/api/projects", currentProjectId],
    enabled: !!currentProjectId,
  });

  const { data: elements = [] } = useQuery<Element[]>({
    queryKey: ["/api/projects", currentProjectId, "elements"],
    enabled: !!currentProjectId,
  });

  const { data: loads = [] } = useQuery<Load[]>({
    queryKey: ["/api/projects", currentProjectId, "loads"],
    enabled: !!currentProjectId,
  });

  const { data: supports = [] } = useQuery<Support[]>({
    queryKey: ["/api/projects", currentProjectId, "supports"],
    enabled: !!currentProjectId,
  });

  const { data: analysisResults = [] } = useQuery<AnalysisResult[]>({
    queryKey: ["/api/projects", currentProjectId, "results"],
    enabled: !!currentProjectId,
  });

  const { data: materials = [] } = useQuery<Material[]>({
    queryKey: ["/api/materials"],
  });

  const { data: sections = [] } = useQuery<Section[]>({
    queryKey: ["/api/sections"],
  });

  // Mutations
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: InsertProject) => {
      const response = await apiRequest("POST", "/api/projects", projectData);
      return response.json();
    },
    onSuccess: (newProject: Project) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setCurrentProjectId(newProject.id);
    },
  });

  const createElementMutation = useMutation({
    mutationFn: async (elementData: InsertElement) => {
      const response = await apiRequest("POST", "/api/elements", elementData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", currentProjectId, "elements"] });
    },
  });

  const createLoadMutation = useMutation({
    mutationFn: async (loadData: InsertLoad) => {
      const response = await apiRequest("POST", "/api/loads", loadData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", currentProjectId, "loads"] });
    },
  });

  const createSupportMutation = useMutation({
    mutationFn: async (supportData: InsertSupport) => {
      const response = await apiRequest("POST", "/api/supports", supportData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", currentProjectId, "supports"] });
    },
  });

  const runAnalysisMutation = useMutation({
    mutationFn: async (projectId: number) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/analyze`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", currentProjectId, "results"] });
    },
  });

  // Auto-select first project if none selected
  useEffect(() => {
    if (!currentProjectId && projects.length > 0) {
      setCurrentProjectId(projects[0].id);
    }
  }, [projects, currentProjectId]);

  // Helper functions
  const createProject = async (projectData: InsertProject) => {
    return createProjectMutation.mutateAsync(projectData);
  };

  const createElement = async (elementData: InsertElement) => {
    return createElementMutation.mutateAsync(elementData);
  };

  const createLoad = async (loadData: InsertLoad) => {
    return createLoadMutation.mutateAsync(loadData);
  };

  const createSupport = async (supportData: InsertSupport) => {
    return createSupportMutation.mutateAsync(supportData);
  };

  const runAnalysis = async () => {
    if (!currentProjectId) throw new Error("No project selected");
    return runAnalysisMutation.mutateAsync(currentProjectId);
  };

  const selectedElement = selectedElementId 
    ? elements.find(e => e.elementId === selectedElementId) || null
    : null;

  return {
    // Data
    projects,
    project,
    elements,
    loads,
    supports,
    analysisResults,
    materials,
    sections,
    selectedElement,
    currentProjectId,
    
    // Actions
    createProject,
    createElement,
    createLoad,
    createSupport,
    runAnalysis,
    setCurrentProjectId,
    setSelectedElementId,
    
    // Loading states
    isLoading: createProjectMutation.isPending || 
               createElementMutation.isPending || 
               createLoadMutation.isPending || 
               createSupportMutation.isPending ||
               runAnalysisMutation.isPending,
  };
}
