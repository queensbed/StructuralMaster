import { useState } from "react";
import { Element } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface PropertiesPanelProps {
  selectedElement: Element | null;
  onElementUpdate: (element: Element) => void;
}

export default function PropertiesPanel({ selectedElement, onElementUpdate }: PropertiesPanelProps) {
  if (!selectedElement) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50">
          <h3 className="text-sm font-semibold text-neutral-900">Properties</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-neutral-500">Select an element to view properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50">
        <h3 className="text-sm font-semibold text-neutral-900">Properties</h3>
      </div>

      {/* Properties Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Element Information */}
        <div className="p-4 border-b border-neutral-200">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-neutral-900 mb-2">Element Information</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">ID:</span>
                <span className="font-mono">{selectedElement.elementId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Type:</span>
                <span className="capitalize">{selectedElement.type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Material:</span>
                <span>Steel S355</span>
              </div>
            </div>
          </div>

          {/* Geometry Properties */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-neutral-900 mb-2">Geometry</h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="length" className="text-xs font-medium text-neutral-700">
                  Length (m)
                </Label>
                <Input
                  id="length"
                  type="number"
                  step="0.1"
                  value={selectedElement.length.toFixed(1)}
                  className="property-input mt-1"
                  onChange={(e) => console.log("Length changed:", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="section" className="text-xs font-medium text-neutral-700">
                  Cross Section
                </Label>
                <Select defaultValue="ipe240">
                  <SelectTrigger className="property-input mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ipe240">IPE 240</SelectItem>
                    <SelectItem value="ipe300">IPE 300</SelectItem>
                    <SelectItem value="heb200">HEB 200</SelectItem>
                    <SelectItem value="upn160">UPN 160</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Material Properties */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-neutral-900 mb-2">Material Properties</h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="emodulus" className="text-xs font-medium text-neutral-700">
                  E-Modulus (GPa)
                </Label>
                <Input
                  id="emodulus"
                  type="number"
                  value="210"
                  className="property-input font-mono mt-1"
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="density" className="text-xs font-medium text-neutral-700">
                  Density (kg/m³)
                </Label>
                <Input
                  id="density"
                  type="number"
                  value="7850"
                  className="property-input font-mono mt-1"
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="yield" className="text-xs font-medium text-neutral-700">
                  Yield Strength (MPa)
                </Label>
                <Input
                  id="yield"
                  type="number"
                  value="355"
                  className="property-input font-mono mt-1"
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Section Properties */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-neutral-900 mb-2">Section Properties</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Area (cm²):</span>
                <span className="font-mono">39.1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Iy (cm⁴):</span>
                <span className="font-mono">3892</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Iz (cm⁴):</span>
                <span className="font-mono">284</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Wy (cm³):</span>
                <span className="font-mono">324</span>
              </div>
            </div>
          </div>

          {/* Load Information */}
          <div>
            <h4 className="text-sm font-medium text-neutral-900 mb-2">Applied Loads</h4>
            <div className="space-y-2">
              <div className="bg-neutral-50 rounded p-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-sm font-medium">Point Load</span>
                    <div className="text-xs text-neutral-500">at x = 1.5m</div>
                  </div>
                  <span className="text-sm font-mono">10 kN</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-blue-500 border-blue-500 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Load
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
