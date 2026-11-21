export interface ConnectionStatus {
  connected: boolean;
  document: { selection?: number[] } | null;
}
export interface VectorCraftSwatch {
  hex: string;
  name: string;
  group: string | null;
}
export interface VectorCraftSwatchCatalog {
  colors: VectorCraftSwatch[];
  groups: { name: string; count: number }[];
  ungroupedCount: number;
}
export interface VectorCraftBridge {
  status(): Promise<ConnectionStatus>;
  launch(): Promise<ConnectionStatus>;
  pickScreenColor(): Promise<string | null>;
  applyColor(input: {color:string; target:'fill'|'stroke'}): Promise<{result:{objects:number}}>;
  readColor(target:'fill'|'stroke'): Promise<{color:string}>;
  sendPalette(input:{name:string; colors:string[]}): Promise<{name:string; count:number; created:boolean}>;
  readSwatches(): Promise<VectorCraftSwatchCatalog>;
}
declare global { interface Window {hueprintVectorCraft?: VectorCraftBridge;} }
export const bridge = window.hueprintVectorCraft;
