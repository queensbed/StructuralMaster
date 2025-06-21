import { Building, FolderOpen, FileDown, Box, SquareDashedBottom, Layers, 
         Shapes, Weight, Calculator, ArrowUp10, Zap, Anchor, 
         Book, CheckCircle, FileText, Compass, Settings } from "lucide-react";

export default function Sidebar() {
  const menuItems = [
    {
      title: "Project",
      items: [
        { icon: FolderOpen, label: "Project Manager", action: "openProject" },
        { icon: FileDown, label: "Import/Export", action: "importFiles" }
      ]
    },
    {
      title: "Modeling",
      items: [
        { icon: Box, label: "Structural Model", action: "openModeling", active: true },
        { icon: SquareDashedBottom, label: "Geometry", action: "openGeometry" },
        { icon: Layers, label: "Materials", action: "openMaterials" },
        { icon: Shapes, label: "Cross Sections", action: "openSections" }
      ]
    },
    {
      title: "Analysis",
      items: [
        { icon: Weight, label: "Load Cases", action: "openLoads" },
        { icon: Layers, label: "Load Combinations", action: "openCombinations" },
        { icon: Calculator, label: "Run Analysis", action: "runAnalysis" }
      ]
    },
    {
      title: "Results",
      items: [
        { icon: ArrowUp10, label: "Displacements", action: "viewDisplacements" },
        { icon: Zap, label: "Internal Forces", action: "viewForces" },
        { icon: Anchor, label: "Reactions", action: "viewReactions" }
      ]
    },
    {
      title: "Design",
      items: [
        { icon: Book, label: "Design Codes", action: "openDesignCodes" },
        { icon: CheckCircle, label: "Design Check", action: "runDesignCheck" }
      ]
    },
    {
      title: "Documentation",
      items: [
        { icon: FileText, label: "Reports", action: "generateReports" },
        { icon: Compass, label: "Drawings", action: "openDrawings" }
      ]
    }
  ];

  return (
    <div className="w-72 bg-white border-r border-neutral-200 flex flex-col shadow-depth-4">
      {/* Logo & Brand */}
      <div className="px-6 py-4 border-b border-neutral-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Building className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-neutral-900">StructuralPro</h1>
            <p className="text-xs text-neutral-500">Professional Edition</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto">
        <nav className="px-4 py-4 space-y-2">
          {menuItems.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <button 
                      className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        item.active 
                          ? "text-white bg-blue-500 shadow-sm"
                          : "text-neutral-700 hover:bg-neutral-100"
                      }`}
                      onClick={() => console.log(`Action: ${item.action}`)}
                    >
                      <item.icon className="w-4 h-4 mr-3" />
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* User Profile */}
      <div className="px-4 py-4 border-t border-neutral-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-900 truncate">John Doe</p>
            <p className="text-xs text-neutral-500 truncate">Structural Engineer</p>
          </div>
          <button className="text-neutral-400 hover:text-neutral-600">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
