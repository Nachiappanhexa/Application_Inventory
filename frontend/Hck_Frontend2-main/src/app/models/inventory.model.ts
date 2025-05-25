// Inventory model for eco inventory management
export interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  reorderLevel: number;
  cost: number;
  expiryDate?: Date;
  waste?: number;
}
