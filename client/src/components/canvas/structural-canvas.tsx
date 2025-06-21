import { useRef, useEffect, useState, useCallback } from "react";
import { Project, Element, Load, Support } from "@shared/schema";
import { ToolType } from "@/types/structural";
import { drawGrid, drawElement, drawLoad, drawSupport } from "@/lib/canvas-utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Home } from "lucide-react";

interface StructuralCanvasProps {
  selectedTool: ToolType;
  elements: Element[];
  loads: Load[];
  supports: Support[];
  selectedElement: Element | null;
  onElementSelect: (element: Element | null) => void;
  project: Project | null;
}

export default function StructuralCanvas({
  selectedTool,
  elements,
  loads,
  supports,
  selectedElement,
  onElementSelect,
  project
}: StructuralCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  const handleCanvasClick = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left - pan.x) / scale;
    const y = (event.clientY - rect.top - pan.y) / scale;
    
    console.log(`Canvas clicked at: ${x}, ${y} with tool: ${selectedTool}`);
    
    // Handle tool-specific actions here
    if (selectedTool === "beam") {
      // TODO: Implement beam creation
    } else if (selectedTool === "column") {
      // TODO: Implement column creation
    }
  }, [selectedTool, scale, pan]);

  const handleElementClick = useCallback((element: Element, event: React.MouseEvent) => {
    event.stopPropagation();
    onElementSelect(element);
    console.log(`Element selected: ${element.elementId}`);
  }, [onElementSelect]);

  const handleZoomIn = () => setScale(prev => Math.min(prev * 1.2, 5));
  const handleZoomOut = () => setScale(prev => Math.max(prev / 1.2, 0.1));
  const handleResetView = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (event: React.MouseEvent<SVGSVGElement>) => {
    if (selectedTool === "select") {
      setIsPanning(true);
      setLastPanPoint({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (isPanning) {
      const deltaX = event.clientX - lastPanPoint.x;
      const deltaY = event.clientY - lastPanPoint.y;
      setPan(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      setLastPanPoint({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-neutral-50">
      {/* Canvas Header */}
      <div className="bg-white border-b border-neutral-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-neutral-900">
            {project?.name || "Structural Model"} - Frame01
          </h2>
          <div className="flex items-center space-x-2 text-sm text-neutral-500">
            <span>Units: {project?.units === "metric" ? "kN, m" : "kip, ft"}</span>
            <span>•</span>
            <span>View: XY Plane</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Select defaultValue="dead">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select load case" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dead">Load Case: Dead Load</SelectItem>
              <SelectItem value="live">Load Case: Live Load</SelectItem>
              <SelectItem value="wind">Load Case: Wind Load</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 canvas-grid bg-neutral-50">
          {/* Coordinate System */}
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-sm p-3 border border-neutral-200">
            <div className="flex flex-col items-center space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-0.5 bg-red-500"></div>
                <span className="text-xs font-mono">X</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-0.5 h-8 bg-green-500"></div>
                <span className="text-xs font-mono">Y</span>
              </div>
            </div>
          </div>

          {/* Main SVG Canvas */}
          <svg
            ref={svgRef}
            className="absolute inset-0 w-full h-full cursor-crosshair"
            onClick={handleCanvasClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ cursor: selectedTool === "select" ? "grab" : "crosshair" }}
          >
            {/* Grid Pattern */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E7EB" strokeWidth="0.5"/>
              </pattern>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#FF6B6B"/>
              </marker>
            </defs>
            
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${scale})`}>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Sample Frame Structure for demonstration */}
              {/* Columns */}
              <line x1="200" y1="100" x2="200" y2="400" stroke="#1F2937" strokeWidth="4" />
              <line x1="500" y1="100" x2="500" y2="400" stroke="#1F2937" strokeWidth="4" />
              <line x1="800" y1="100" x2="800" y2="400" stroke="#1F2937" strokeWidth="4" />
              
              {/* Beams */}
              <line x1="200" y1="100" x2="500" y2="100" stroke="#3B82F6" strokeWidth="4" />
              <line x1="500" y1="100" x2="800" y2="100" stroke="#3B82F6" strokeWidth="4" />
              <line x1="200" y1="250" x2="500" y2="250" stroke="#3B82F6" strokeWidth="4" />
              <line x1="500" y1="250" x2="800" y2="250" stroke="#3B82F6" strokeWidth="4" />
              
              {/* Joints */}
              <circle cx="200" cy="100" r="6" fill="#EF4444" />
              <circle cx="500" cy="100" r="6" fill="#EF4444" />
              <circle cx="800" cy="100" r="6" fill="#EF4444" />
              <circle cx="200" cy="250" r="6" fill="#EF4444" />
              <circle cx="500" cy="250" r="6" fill="#EF4444" />
              <circle cx="800" cy="250" r="6" fill="#EF4444" />
              <circle cx="200" cy="400" r="6" fill="#EF4444" />
              <circle cx="500" cy="400" r="6" fill="#EF4444" />
              <circle cx="800" cy="400" r="6" fill="#EF4444" />
              
              {/* Supports */}
              <polygon points="190,410 200,400 210,410" fill="#8B5CF6" />
              <polygon points="490,410 500,400 510,410" fill="#8B5CF6" />
              <polygon points="790,410 800,400 810,410" fill="#8B5CF6" />
              
              {/* Sample Load */}
              <g>
                <line x1="350" y1="80" x2="350" y2="100" stroke="#FF6B6B" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                <text x="360" y="90" fill="#FF6B6B" fontSize="12" fontFamily="monospace">10 kN</text>
              </g>
              
              {/* Element Labels */}
              <text x="180" y="250" fill="#6B7280" fontSize="10" fontFamily="monospace">C1</text>
              <text x="480" y="250" fill="#6B7280" fontSize="10" fontFamily="monospace">C2</text>
              <text x="780" y="250" fill="#6B7280" fontSize="10" fontFamily="monospace">C3</text>
              <text x="350" y="95" fill="#6B7280" fontSize="10" fontFamily="monospace">B1</text>
              <text x="650" y="95" fill="#6B7280" fontSize="10" fontFamily="monospace">B2</text>
            </g>
          </svg>

          {/* Selection Indicator */}
          {selectedElement && (
            <div className="absolute top-16 left-4 bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium">
              Selected: {selectedElement.elementId}
            </div>
          )}
        </div>

        {/* Canvas Controls */}
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-depth-4 p-2 border border-neutral-200">
          <div className="flex flex-col space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              className="p-2 text-neutral-600 hover:text-blue-500 hover:bg-blue-50"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              className="p-2 text-neutral-600 hover:text-blue-500 hover:bg-blue-50"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetView}
              className="p-2 text-neutral-600 hover:text-blue-500 hover:bg-blue-50"
            >
              <Home className="w-4 h-4" />
            </Button>
            <div className="border-t border-neutral-200 pt-2">
              <span className="text-xs text-neutral-500 font-mono">1:{Math.round(100/scale)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
