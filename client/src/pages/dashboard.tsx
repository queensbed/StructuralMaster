import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Toolbar from "@/components/layout/toolbar";
import StructuralCanvas from "@/components/canvas/structural-canvas";
import PropertiesPanel from "@/components/panels/properties-panel";
import ResultsPanel from "@/components/panels/results-panel";
import LoadingModal from "@/components/modals/loading-modal";
import { useStructuralModel } from "@/hooks/use-structural-model";
import { ToolType } from "@/types/structural";

export default function Dashboard() {
  const [selectedTool, setSelectedTool] = useState<ToolType>("select");
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const {
    project,
    selectedElement,
    elements,
    loads,
    supports,
    analysisResults,
    createProject,
    runAnalysis,
    isLoading
  } = useStructuralModel();

  const handleRunAnalysis = async () => {
    setShowLoadingModal(true);
    try {
      await runAnalysis();
    } finally {
      setShowLoadingModal(false);
    }
  };

  const handleNewProject = async () => {
    await createProject({
      name: "New Project",
      description: "Untitled structural project",
      units: "metric"
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Toolbar 
          selectedTool={selectedTool}
          onToolSelect={setSelectedTool}
          onNewProject={handleNewProject}
          onRunAnalysis={handleRunAnalysis}
          analysisStatus={analysisResults.length > 0 ? "complete" : "pending"}
        />
        
        <div className="flex-1 flex">
          <StructuralCanvas 
            selectedTool={selectedTool}
            elements={elements}
            loads={loads}
            supports={supports}
            selectedElement={selectedElement}
            onElementSelect={() => {}}
            project={project}
          />
          
          <div className="w-80 bg-white border-l border-neutral-200 flex flex-col">
            <PropertiesPanel 
              selectedElement={selectedElement}
              onElementUpdate={() => {}}
            />
            <ResultsPanel 
              analysisResults={analysisResults}
              selectedElement={selectedElement}
            />
          </div>
        </div>
      </div>

      <LoadingModal 
        isOpen={showLoadingModal}
        onClose={() => setShowLoadingModal(false)}
      />
    </div>
  );
}
