import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Grid3X3, Layers, Eye, EyeOff, RotateCcw, ZoomIn, ZoomOut, 
  Save, Download, Upload, Settings, Calculator, Play, Square,
  Triangle, Circle, Move, Copy, Trash2, Edit3, Ruler, Target,
  Box, Building, Zap, Wind, Snowflake, Waves, FileText, BarChart3
} from "lucide-react";

interface ProfessionalModelerProps {
  onAnalysisRun: () => void;
  onDesignCheck: () => void;
  onOptimize: () => void;
}

// Advanced modeling tools
const MODELING_TOOLS = [
  { id: 'select', icon: Target, label: 'Select', category: 'Selection' },
  { id: 'move', icon: Move, label: 'Move', category: 'Transform' },
  { id: 'copy', icon: Copy, label: 'Copy', category: 'Transform' },
  { id: 'rotate', icon: RotateCcw, label: 'Rotate', category: 'Transform' },
  { id: 'beam', icon: Square, label: 'Beam', category: 'Elements' },
  { id: 'column', icon: Box, label: 'Column', category: 'Elements' },
  { id: 'brace', icon: Triangle, label: 'Brace', category: 'Elements' },
  { id: 'truss', icon: Triangle, label: 'Truss', category: 'Elements' },
  { id: 'plate', icon: Square, label: 'Plate', category: 'Elements' },
  { id: 'shell', icon: Circle, label: 'Shell', category: 'Elements' },
  { id: 'fixed-support', icon: Building, label: 'Fixed', category: 'Supports' },
  { id: 'pinned-support', icon: Target, label: 'Pinned', category: 'Supports' },
  { id: 'roller-support', icon: Circle, label: 'Roller', category: 'Supports' },
  { id: 'point-load', icon: Zap, label: 'Point Load', category: 'Loads' },
  { id: 'distributed-load', icon: Waves, label: 'Distributed', category: 'Loads' },
  { id: 'wind-load', icon: Wind, label: 'Wind', category: 'Loads' },
  { id: 'snow-load', icon: Snowflake, label: 'Snow', category: 'Loads' }
];

const ANALYSIS_TYPES = [
  { id: 'static', name: 'Static Linear', description: 'Standard linear static analysis' },
  { id: 'dynamic', name: 'Dynamic Modal', description: 'Natural frequency and mode shapes' },
  { id: 'buckling', name: 'Buckling', description: 'Eigenvalue buckling analysis' },
  { id: 'nonlinear', name: 'Nonlinear Static', description: 'Geometric and material nonlinearity' },
  { id: 'time-history', name: 'Time History', description: 'Dynamic time integration' },
  { id: 'response-spectrum', name: 'Response Spectrum', description: 'Seismic response analysis' }
];

const DESIGN_CODES = [
  { id: 'AISC360', name: 'AISC 360-22', country: 'USA', type: 'Steel' },
  { id: 'EC3', name: 'Eurocode 3', country: 'EU', type: 'Steel' },
  { id: 'BS5950', name: 'BS 5950', country: 'UK', type: 'Steel' },
  { id: 'CSA-S16', name: 'CSA S16-19', country: 'Canada', type: 'Steel' },
  { id: 'AS4100', name: 'AS 4100', country: 'Australia', type: 'Steel' },
  { id: 'ACI318', name: 'ACI 318-19', country: 'USA', type: 'Concrete' },
  { id: 'EC2', name: 'Eurocode 2', country: 'EU', type: 'Concrete' },
  { id: 'IS456', name: 'IS 456', country: 'India', type: 'Concrete' }
];

export default function ProfessionalModeler({
  onAnalysisRun,
  onDesignCheck,
  onOptimize
}: ProfessionalModelerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTool, setSelectedTool] = useState('select');
  const [viewMode, setViewMode] = useState('model');
  const [analysisType, setAnalysisType] = useState('static');
  const [designCode, setDesignCode] = useState('AISC360');
  const [showGrid, setShowGrid] = useState(true);
  const [showDimensions, setShowDimensions] = useState(true);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [modelStats, setModelStats] = useState({
    nodes: 24,
    elements: 36,
    loads: 12,
    supports: 6,
    materials: 3,
    sections: 5
  });

  // Advanced CAD drawing function
  const drawAdvancedModel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    
    // Apply transform
    ctx.translate(pan.x, pan.y);
    ctx.scale(scale, scale);

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 0.5;
      const gridSize = 50;
      
      for (let x = -1000; x <= 1000; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, -1000);
        ctx.lineTo(x, 1000);
        ctx.stroke();
      }
      
      for (let y = -1000; y <= 1000; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(-1000, y);
        ctx.lineTo(1000, y);
        ctx.stroke();
      }
    }

    // Draw coordinate system
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#EF4444';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(100, 0);
    ctx.stroke();
    
    ctx.strokeStyle = '#10B981';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -100);
    ctx.stroke();

    // Draw advanced structural model - Multi-story building
    ctx.lineWidth = 4;
    
    // Foundation level
    ctx.strokeStyle = '#8B5CF6';
    ctx.fillStyle = '#8B5CF6';
    const foundations = [
      [100, 400], [300, 400], [500, 400], [700, 400]
    ];
    foundations.forEach(([x, y]) => {
      ctx.fillRect(x - 15, y, 30, 20);
    });

    // Columns - 4 stories
    ctx.strokeStyle = '#7C2D12';
    ctx.lineWidth = 6;
    for (let story = 0; story < 4; story++) {
      const y1 = 400 - story * 100;
      const y2 = 400 - (story + 1) * 100;
      
      foundations.forEach(([x]) => {
        ctx.beginPath();
        ctx.moveTo(x, y1);
        ctx.lineTo(x, y2);
        ctx.stroke();
        
        // Column labels
        ctx.fillStyle = '#7C2D12';
        ctx.font = '12px monospace';
        ctx.fillText(`C${foundations.indexOf([x, 400]) + 1}`, x + 10, y1 - 50);
      });
    }

    // Beams - connecting columns
    ctx.strokeStyle = '#1E40AF';
    ctx.lineWidth = 5;
    for (let story = 0; story < 4; story++) {
      const y = 400 - (story + 1) * 100;
      
      // X-direction beams
      for (let i = 0; i < foundations.length - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(foundations[i][0], y);
        ctx.lineTo(foundations[i + 1][0], y);
        ctx.stroke();
        
        // Beam labels
        ctx.fillStyle = '#1E40AF';
        ctx.font = '10px monospace';
        const midX = (foundations[i][0] + foundations[i + 1][0]) / 2;
        ctx.fillText(`B${story + 1}-${i + 1}`, midX - 15, y - 10);
      }
    }

    // Braces
    ctx.strokeStyle = '#9333EA';
    ctx.lineWidth = 3;
    for (let story = 0; story < 2; story++) {
      const y1 = 400 - story * 100;
      const y2 = 400 - (story + 1) * 100;
      
      // X-braces in middle bays
      ctx.beginPath();
      ctx.moveTo(foundations[1][0], y1);
      ctx.lineTo(foundations[2][0], y2);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(foundations[2][0], y1);
      ctx.lineTo(foundations[1][0], y2);
      ctx.stroke();
    }

    // Joints
    ctx.fillStyle = '#EF4444';
    for (let story = 0; story <= 4; story++) {
      const y = 400 - story * 100;
      foundations.forEach(([x]) => {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
    }

    // Loads
    if (viewMode === 'loads' || viewMode === 'model') {
      ctx.strokeStyle = '#F59E0B';
      ctx.fillStyle = '#F59E0B';
      ctx.lineWidth = 2;
      
      // Distributed loads on beams
      for (let story = 1; story <= 4; story++) {
        const y = 400 - story * 100;
        for (let i = 0; i < foundations.length - 1; i++) {
          const x1 = foundations[i][0];
          const x2 = foundations[i + 1][0];
          
          // Load arrows
          for (let x = x1 + 20; x < x2; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, y - 30);
            ctx.lineTo(x, y - 5);
            ctx.stroke();
            
            // Arrowhead
            ctx.beginPath();
            ctx.moveTo(x - 3, y - 8);
            ctx.lineTo(x, y - 5);
            ctx.lineTo(x + 3, y - 8);
            ctx.stroke();
          }
          
          // Load value
          ctx.font = '10px monospace';
          ctx.fillText('25 kN/m', (x1 + x2) / 2 - 20, y - 35);
        }
      }
    }

    // Supports
    ctx.fillStyle = '#8B5CF6';
    ctx.strokeStyle = '#8B5CF6';
    foundations.forEach(([x, y]) => {
      // Fixed support symbol
      ctx.fillRect(x - 10, y + 20, 20, 8);
      
      // Hatching
      ctx.lineWidth = 1;
      for (let i = -8; i <= 8; i += 4) {
        ctx.beginPath();
        ctx.moveTo(x + i, y + 28);
        ctx.lineTo(x + i + 4, y + 35);
        ctx.stroke();
      }
    });

    // Dimensions
    if (showDimensions) {
      ctx.strokeStyle = '#6B7280';
      ctx.fillStyle = '#6B7280';
      ctx.lineWidth = 1;
      ctx.font = '12px monospace';
      
      // Horizontal dimensions
      for (let i = 0; i < foundations.length - 1; i++) {
        const x1 = foundations[i][0];
        const x2 = foundations[i + 1][0];
        const y = 450;
        
        // Dimension line
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.stroke();
        
        // Extension lines
        ctx.beginPath();
        ctx.moveTo(x1, y - 5);
        ctx.lineTo(x1, y + 5);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x2, y - 5);
        ctx.lineTo(x2, y + 5);
        ctx.stroke();
        
        // Dimension text
        ctx.fillText(`${(x2 - x1) / 10}m`, (x1 + x2) / 2 - 15, y + 20);
      }
      
      // Vertical dimensions
      const x = 50;
      for (let story = 0; story < 4; story++) {
        const y1 = 400 - story * 100;
        const y2 = 400 - (story + 1) * 100;
        
        // Dimension line
        ctx.beginPath();
        ctx.moveTo(x, y1);
        ctx.lineTo(x, y2);
        ctx.stroke();
        
        // Extension lines
        ctx.beginPath();
        ctx.moveTo(x - 5, y1);
        ctx.lineTo(x + 5, y1);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x - 5, y2);
        ctx.lineTo(x + 5, y2);
        ctx.stroke();
        
        // Dimension text
        ctx.fillText('3.5m', x - 35, (y1 + y2) / 2 + 3);
      }
    }

    ctx.restore();
  }, [pan, scale, showGrid, showDimensions, viewMode]);

  useEffect(() => {
    drawAdvancedModel();
  }, [drawAdvancedModel]);

  const handleZoomIn = () => setScale(prev => Math.min(prev * 1.2, 5));
  const handleZoomOut = () => setScale(prev => Math.max(prev / 1.2, 0.1));
  const handleResetView = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  const toolsByCategory = MODELING_TOOLS.reduce((acc, tool) => {
    if (!acc[tool.category]) acc[tool.category] = [];
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, typeof MODELING_TOOLS>);

  return (
    <div className="h-full flex bg-gray-50">
      {/* Advanced Toolbox */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Tool Categories */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Modeling Tools</h3>
          <Tabs defaultValue="Elements" className="w-full">
            <TabsList className="grid w-full grid-cols-3 text-xs">
              <TabsTrigger value="Elements">Elements</TabsTrigger>
              <TabsTrigger value="Loads">Loads</TabsTrigger>
              <TabsTrigger value="Supports">Supports</TabsTrigger>
            </TabsList>
            
            {Object.entries(toolsByCategory).map(([category, tools]) => (
              <TabsContent key={category} value={category} className="mt-3">
                <div className="grid grid-cols-4 gap-2">
                  {tools.map(tool => (
                    <Button
                      key={tool.id}
                      variant={selectedTool === tool.id ? "default" : "outline"}
                      size="sm"
                      className="h-12 flex flex-col items-center justify-center p-1"
                      onClick={() => setSelectedTool(tool.id)}
                    >
                      <tool.icon className="w-4 h-4 mb-1" />
                      <span className="text-xs">{tool.label}</span>
                    </Button>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Properties Panel */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {/* Element Properties */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Element Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Material</Label>
                  <Select defaultValue="steel-s355">
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="steel-s355">Steel S355</SelectItem>
                      <SelectItem value="steel-s275">Steel S275</SelectItem>
                      <SelectItem value="concrete-c30">Concrete C30/37</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-xs">Section</Label>
                  <Select defaultValue="ipe300">
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ipe240">IPE 240</SelectItem>
                      <SelectItem value="ipe300">IPE 300</SelectItem>
                      <SelectItem value="ipe360">IPE 360</SelectItem>
                      <SelectItem value="heb200">HEB 200</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Length (m)</Label>
                    <Input className="h-8" defaultValue="6.0" />
                  </div>
                  <div>
                    <Label className="text-xs">Angle (°)</Label>
                    <Input className="h-8" defaultValue="0" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Load Properties */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Load Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Load Case</Label>
                  <Select defaultValue="dead">
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dead">Dead Load</SelectItem>
                      <SelectItem value="live">Live Load</SelectItem>
                      <SelectItem value="wind">Wind Load</SelectItem>
                      <SelectItem value="snow">Snow Load</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Magnitude</Label>
                    <Input className="h-8" defaultValue="25" />
                  </div>
                  <div>
                    <Label className="text-xs">Direction</Label>
                    <Select defaultValue="y">
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="x">X</SelectItem>
                        <SelectItem value="y">Y</SelectItem>
                        <SelectItem value="z">Z</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Settings */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Analysis Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Analysis Type</Label>
                  <Select value={analysisType} onValueChange={setAnalysisType}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ANALYSIS_TYPES.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-xs">Design Code</Label>
                  <Select value={designCode} onValueChange={setDesignCode}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DESIGN_CODES.map(code => (
                        <SelectItem key={code.id} value={code.id}>
                          {code.name} ({code.country})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Mesh Size</Label>
                    <Input className="h-8" defaultValue="0.5" />
                  </div>
                  <div>
                    <Label className="text-xs">Max Iterations</Label>
                    <Input className="h-8" defaultValue="100" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>

      {/* Main Drawing Area */}
      <div className="flex-1 flex flex-col">
        {/* Advanced Toolbar */}
        <div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* File Operations */}
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-1" />
                Import
              </Button>
              <Button variant="outline" size="sm">
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* View Controls */}
            <div className="flex items-center space-x-2">
              <Select value={viewMode} onValueChange={setViewMode}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="model">Model</SelectItem>
                  <SelectItem value="loads">Loads</SelectItem>
                  <SelectItem value="supports">Supports</SelectItem>
                  <SelectItem value="deformed">Deformed</SelectItem>
                  <SelectItem value="stresses">Stresses</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={showGrid ? "default" : "outline"}
                size="sm"
                onClick={() => setShowGrid(!showGrid)}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>

              <Button
                variant={showDimensions ? "default" : "outline"}
                size="sm"
                onClick={() => setShowDimensions(!showDimensions)}
              >
                <Ruler className="w-4 h-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Zoom Controls */}
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm font-mono w-16 text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleResetView}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Analysis Controls */}
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={onAnalysisRun}
            >
              <Calculator className="w-4 h-4 mr-2" />
              Run Analysis
            </Button>
            
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={onDesignCheck}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Design Check
            </Button>
            
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={onOptimize}
            >
              <Settings className="w-4 h-4 mr-2" />
              Optimize
            </Button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-gray-100 px-4 py-2 flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <Badge variant="outline">{modelStats.nodes} Nodes</Badge>
            <Badge variant="outline">{modelStats.elements} Elements</Badge>
            <Badge variant="outline">{modelStats.loads} Loads</Badge>
            <Badge variant="outline">{modelStats.supports} Supports</Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Selected: {selectedTool}</span>
            <span className="text-gray-600">Units: kN, m</span>
            <span className="text-gray-600">Grid: 1.0m</span>
          </div>
        </div>

        {/* Drawing Canvas */}
        <div className="flex-1 relative overflow-hidden bg-white">
          <canvas
            ref={canvasRef}
            width={1200}
            height={800}
            className="absolute inset-0 w-full h-full cursor-crosshair"
            style={{ 
              imageRendering: 'crisp-edges',
              background: 'linear-gradient(45deg, #f8fafc 25%, transparent 25%), linear-gradient(-45deg, #f8fafc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f8fafc 75%), linear-gradient(-45deg, transparent 75%, #f8fafc 75%)',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
            }}
          />
          
          {/* Coordinate Display */}
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-sm p-3 border border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-0.5 bg-red-500"></div>
                <span className="text-xs font-mono">X</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-0.5 h-6 bg-green-500"></div>
                <span className="text-xs font-mono">Y</span>
              </div>
            </div>
          </div>

          {/* Analysis Type Badge */}
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-sm p-2 border border-gray-200">
            <Badge variant="secondary" className="text-xs">
              {ANALYSIS_TYPES.find(t => t.id === analysisType)?.name}
            </Badge>
          </div>

          {/* Model Statistics */}
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-sm p-3 border border-gray-200">
            <div className="text-xs text-gray-600 space-y-1">
              <div>Model: 4-Story Building Frame</div>
              <div>DOF: {modelStats.nodes * 6}</div>
              <div>Analysis: {ANALYSIS_TYPES.find(t => t.id === analysisType)?.name}</div>
              <div>Code: {DESIGN_CODES.find(c => c.id === designCode)?.name}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}