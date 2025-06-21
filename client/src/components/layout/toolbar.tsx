import { File, FolderOpen, Save, MousePointer, Minus, GripVertical, 
         Anchor, ArrowDown, CornerLeftUp, Expand, Grid3X3, 
         Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToolType } from "@/types/structural";

interface ToolbarProps {
  selectedTool: ToolType;
  onToolSelect: (tool: ToolType) => void;
  onNewProject: () => void;
  onRunAnalysis: () => void;
  analysisStatus: "pending" | "running" | "complete" | "error";
}

export default function Toolbar({ 
  selectedTool, 
  onToolSelect, 
  onNewProject, 
  onRunAnalysis,
  analysisStatus 
}: ToolbarProps) {
  const tools = [
    { id: "select" as ToolType, icon: MousePointer, label: "Select" },
    { id: "beam" as ToolType, icon: Minus, label: "Beam" },
    { id: "column" as ToolType, icon: GripVertical, label: "Column" },
    { id: "support" as ToolType, icon: Anchor, label: "Support" },
    { id: "point-load" as ToolType, icon: ArrowDown, label: "Point Load" },
    { id: "distributed-load" as ToolType, icon: CornerLeftUp, label: "Distributed" }
  ];

  const getStatusColor = () => {
    switch (analysisStatus) {
      case "complete": return "text-green-600";
      case "running": return "text-yellow-600";
      case "error": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getStatusText = () => {
    switch (analysisStatus) {
      case "complete": return "Model Valid";
      case "running": return "Analyzing...";
      case "error": return "Model Error";
      default: return "Model Pending";
    }
  };

  return (
    <div className="bg-white border-b border-neutral-200 px-6 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-4">
        {/* File Operations */}
        <div className="flex items-center space-x-2 border-r border-neutral-200 pr-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onNewProject}
            className="toolbar-button"
          >
            <File className="w-4 h-4 mr-2" />
            New
          </Button>
          <Button variant="ghost" size="sm" className="toolbar-button">
            <FolderOpen className="w-4 h-4 mr-2" />
            Open
          </Button>
          <Button variant="ghost" size="sm" className="toolbar-button">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>

        {/* Modeling Tools */}
        <div className="flex items-center space-x-2 border-r border-neutral-200 pr-4">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              variant={selectedTool === tool.id ? "default" : "ghost"}
              size="sm"
              onClick={() => onToolSelect(tool.id)}
              className="toolbar-button"
            >
              <tool.icon className="w-4 h-4 mr-2" />
              {tool.label}
            </Button>
          ))}
        </div>

        {/* View Controls */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="toolbar-button">
            <Expand className="w-4 h-4 mr-2" />
            Fit
          </Button>
          <Button variant="ghost" size="sm" className="toolbar-button">
            <Grid3X3 className="w-4 h-4 mr-2" />
            Grid
          </Button>
        </div>
      </div>

      {/* Right Side Controls */}
      <div className="flex items-center space-x-4">
        {/* Analysis Status */}
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            analysisStatus === "complete" ? "bg-green-500" : 
            analysisStatus === "running" ? "bg-yellow-500" :
            analysisStatus === "error" ? "bg-red-500" : "bg-gray-400"
          }`} />
          <span className={`text-sm ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-neutral-100 rounded-lg p-1">
          <button className="px-3 py-1 text-sm font-medium text-white bg-blue-500 rounded-md">
            2D
          </button>
          <button className="px-3 py-1 text-sm font-medium text-neutral-700">
            3D
          </button>
        </div>

        {/* Analysis Button */}
        <Button 
          onClick={onRunAnalysis}
          className="bg-green-600 hover:bg-green-700 text-white"
          disabled={analysisStatus === "running"}
        >
          <Play className="w-4 h-4 mr-2" />
          {analysisStatus === "running" ? "Running..." : "Run Analysis"}
        </Button>
      </div>
    </div>
  );
}
