export interface SparePart {
  id: string;
  name: string;
  category: string;
  confidence: number;
  description: string;
  possibleUses: string[];
  imageUrl: string;
  timestamp: number;
  technicalSpecs: {
    material: string;
    dimensions: string;
    tempRange: string;
  };
  similarParts: {
    name: string;
    reason: string;
  }[];
  userFeedback?: 'helpful' | 'not-helpful';
}

export const MOCK_PARTS_DATA: Omit<SparePart, 'id' | 'imageUrl' | 'timestamp' | 'confidence' | 'similarParts' | 'technicalSpecs'>[] = [
  {
    name: "Industrial Water Pump",
    category: "Fluid Dynamics",
    description: "Centrifugal pump designed for high-volume water displacement in industrial cooling or irrigation systems.",
    possibleUses: ["HVAC cooling towers", "Agriculture irrigation", "Factory fluid management"]
  },
  {
    name: "Pressure Relief Valve",
    category: "Safety Systems",
    description: "A safety device used to control or limit pressure in a system to prevent equipment failure or fire.",
    possibleUses: ["Boiler systems", "Gas processing plants", "Hydraulic power units"]
  },
  {
    name: "Three-Phase Electric Motor",
    category: "Power Systems",
    description: "High-efficiency asynchronous motor used for heavy-duty industrial machinery and conveyor systems.",
    possibleUses: ["Conveyor belts", "Industrial fans", "Large-scale mixers"]
  },
  {
    name: "T-Joint Pipe Connector",
    category: "Piping",
    description: "Stainless steel pipe fitting used to branch a pipeline at a 90-degree angle.",
    possibleUses: ["Chemical transport", "Water supply networks", "Oil & Gas pipelines"]
  },
  {
    name: "Heavy-Duty Ball Bearing",
    category: "Mechanical Components",
    description: "Mechanical component designed to reduce friction between moving parts and support radial/axial loads.",
    possibleUses: ["Wheel hubs", "Turbines", "Electric generators"]
  }
];
