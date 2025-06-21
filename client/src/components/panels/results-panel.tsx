import { AnalysisResult, Element } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, FileDown, Eye } from "lucide-react";

interface ResultsPanelProps {
  analysisResults: AnalysisResult[];
  selectedElement: Element | null;
}

export default function ResultsPanel({ analysisResults, selectedElement }: ResultsPanelProps) {
  const hasResults = analysisResults.length > 0;
  const selectedElementResult = selectedElement 
    ? analysisResults.find(r => r.elementId === selectedElement.elementId)
    : null;

  const getMaxValues = () => {
    if (!hasResults) return null;
    
    return {
      maxDisplacement: Math.max(...analysisResults.map(r => r.maxDisplacement || 0)),
      maxMoment: Math.max(...analysisResults.map(r => r.maxMoment || 0)),
      maxShear: Math.max(...analysisResults.map(r => r.maxShear || 0))
    };
  };

  const maxValues = getMaxValues();

  return (
    <div className="h-80 border-t border-neutral-200">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50">
        <h3 className="text-sm font-semibold text-neutral-900">Analysis Results</h3>
      </div>

      {/* Results Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {!hasResults ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <AlertTriangle className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 mb-1">No analysis results</p>
            <p className="text-xs text-gray-400">Run analysis to see results</p>
          </div>
        ) : (
          <>
            {/* Analysis Status */}
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-600">Analysis Complete</span>
              </div>
              <div className="text-xs text-neutral-500">
                Last run: 2 minutes ago
              </div>
            </div>

            {/* Quick Results */}
            <div className="space-y-3">
              {maxValues && (
                <div>
                  <h4 className="text-sm font-medium text-neutral-900 mb-2">Maximum Values</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Max Displacement:</span>
                      <span className="font-mono text-orange-600">
                        {maxValues.maxDisplacement.toFixed(1)} mm
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Max Moment:</span>
                      <span className="font-mono">
                        {maxValues.maxMoment.toFixed(1)} kNm
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Max Shear:</span>
                      <span className="font-mono">
                        {maxValues.maxShear.toFixed(1)} kN
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {selectedElementResult && (
                <div>
                  <h4 className="text-sm font-medium text-neutral-900 mb-2">
                    Element {selectedElementResult.elementId} Results
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Max M:</span>
                      <span className="font-mono">
                        {(selectedElementResult.maxMoment || 0).toFixed(1)} kNm
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Max V:</span>
                      <span className="font-mono">
                        {(selectedElementResult.maxShear || 0).toFixed(1)} kN
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Max δ:</span>
                      <span className="font-mono">
                        {(selectedElementResult.maxDisplacement || 0).toFixed(1)} mm
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {selectedElementResult && (
                <div>
                  <h4 className="text-sm font-medium text-neutral-900 mb-2">Design Check</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-500">Strength:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono">
                          {(selectedElementResult.utilizationRatio || 0).toFixed(2)}
                        </span>
                        {(selectedElementResult.utilizationRatio || 0) < 1 ? (
                          <span className="text-xs text-green-600 flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            OK
                          </span>
                        ) : (
                          <span className="text-xs text-red-600 flex items-center">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            FAIL
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-500">Deflection:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono">L/250</span>
                        <span className="text-xs text-green-600 flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          OK
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-4 space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-blue-500 border-blue-500 hover:bg-blue-50"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Detailed Results
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-neutral-700 border-neutral-300 hover:bg-neutral-50"
              >
                <FileDown className="w-4 h-4 mr-2" />
                Export Results
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
