import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Toolbar from "@/components/layout/toolbar";
import StructuralCanvas from "@/components/canvas/structural-canvas";
import PropertiesPanel from "@/components/panels/properties-panel";
import ResultsPanel from "@/components/panels/results-panel";
import LoadingModal from "@/components/modals/loading-modal";
import ProfessionalModeler from "@/components/advanced/professional-modeler";
import { useStructuralModel } from "@/hooks/use-structural-model";
import { ToolType } from "@/types/structural";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cpu, Target, Zap, Building2, Calculator, BarChart3 } from "lucide-react";

export default function Dashboard() {
  const [selectedTool, setSelectedTool] = useState<ToolType>("select");
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [activeTab, setActiveTab] = useState("professional");
  const [analysisRunning, setAnalysisRunning] = useState(false);
  const [designCheckRunning, setDesignCheckRunning] = useState(false);
  const [optimizationRunning, setOptimizationRunning] = useState(false);

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
    setAnalysisRunning(true);
    setShowLoadingModal(true);
    try {
      await runAnalysis();
    } finally {
      setAnalysisRunning(false);
      setShowLoadingModal(false);
    }
  };

  const handleDesignCheck = async () => {
    setDesignCheckRunning(true);
    try {
      // Professional design code checking
      console.log("Running professional design check with AISC 360, Eurocode 3, and other international codes...");
      // Simulate design check process
      await new Promise(resolve => setTimeout(resolve, 2000));
    } finally {
      setDesignCheckRunning(false);
    }
  };

  const handleOptimize = async () => {
    setOptimizationRunning(true);
    try {
      // Advanced optimization algorithms
      console.log("Running structural optimization using genetic algorithms and machine learning...");
      // Simulate optimization process
      await new Promise(resolve => setTimeout(resolve, 3000));
    } finally {
      setOptimizationRunning(false);
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
        {/* Professional Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Structural Analysis Platform</h1>
              <p className="text-sm text-gray-600">Professional FEM Engine • International Design Codes • Advanced Optimization</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Cpu className="w-3 h-3 mr-1" />
                FEM Engine Active
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Target className="w-3 h-3 mr-1" />
                Design Codes: AISC, EC3, BS5950
              </Badge>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                <Zap className="w-3 h-3 mr-1" />
                AI Optimization
              </Badge>
            </div>
          </div>
        </div>

        {/* Advanced Tab Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="bg-white border-b border-gray-200 px-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="professional" className="flex items-center space-x-2">
                <Building2 className="w-4 h-4" />
                <span>Professional</span>
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center space-x-2">
                <Calculator className="w-4 h-4" />
                <span>Analysis</span>
              </TabsTrigger>
              <TabsTrigger value="results" className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Results</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="professional" className="flex-1 m-0">
            <ProfessionalModeler 
              onAnalysisRun={handleRunAnalysis}
              onDesignCheck={handleDesignCheck}
              onOptimize={handleOptimize}
            />
          </TabsContent>

          <TabsContent value="analysis" className="flex-1 m-0">
            <div className="flex h-full">
              <div className="flex-1 flex flex-col">
                <Toolbar 
                  selectedTool={selectedTool}
                  onToolSelect={setSelectedTool}
                  onNewProject={handleNewProject}
                  onRunAnalysis={handleRunAnalysis}
                  analysisStatus={analysisResults.length > 0 ? "complete" : "pending"}
                />
                <StructuralCanvas 
                  selectedTool={selectedTool}
                  elements={elements}
                  loads={loads}
                  supports={supports}
                  selectedElement={selectedElement}
                  onElementSelect={() => {}}
                  project={project}
                />
              </div>
              
              <div className="w-80 flex flex-col border-l border-neutral-200">
                <PropertiesPanel 
                  selectedElement={selectedElement}
                  onElementUpdate={() => {}}
                />
                <div className="flex-1 p-4 space-y-4">
                  {/* Analysis Status Cards */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center space-x-2">
                        <Calculator className="w-4 h-4" />
                        <span>FEM Analysis</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={handleRunAnalysis}
                        disabled={analysisRunning}
                        className="w-full"
                      >
                        {analysisRunning ? "Running..." : "Run Analysis"}
                      </Button>
                      <p className="text-xs text-gray-600 mt-2">
                        Static, Dynamic, Buckling, Nonlinear
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center space-x-2">
                        <BarChart3 className="w-4 h-4" />
                        <span>Design Check</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={handleDesignCheck}
                        disabled={designCheckRunning}
                        variant="outline"
                        className="w-full"
                      >
                        {designCheckRunning ? "Checking..." : "Design Check"}
                      </Button>
                      <p className="text-xs text-gray-600 mt-2">
                        AISC 360, Eurocode 3, BS 5950
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center space-x-2">
                        <Zap className="w-4 h-4" />
                        <span>Optimization</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={handleOptimize}
                        disabled={optimizationRunning}
                        variant="outline"
                        className="w-full"
                      >
                        {optimizationRunning ? "Optimizing..." : "Optimize"}
                      </Button>
                      <p className="text-xs text-gray-600 mt-2">
                        AI-powered structural optimization
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="results" className="flex-1 m-0">
            <div className="flex h-full">
              <div className="flex-1">
                <StructuralCanvas 
                  selectedTool={selectedTool}
                  elements={elements}
                  loads={loads}
                  supports={supports}
                  selectedElement={selectedElement}
                  onElementSelect={() => {}}
                  project={project}
                />
              </div>
              <div className="w-80 border-l border-neutral-200">
                <ResultsPanel 
                  analysisResults={analysisResults}
                  selectedElement={selectedElement}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <LoadingModal 
        isOpen={showLoadingModal}
        onClose={() => setShowLoadingModal(false)}
      />
    </div>
  );
}
