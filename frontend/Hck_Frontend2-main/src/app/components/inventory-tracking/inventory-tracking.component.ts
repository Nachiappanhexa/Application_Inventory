import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BuildingDetailsService } from '../../services/buildingdetails.service';
import { InventoryTrackingDetailsService } from '../../services/inventorytrackingdetails.service';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-inventory-tracking',
  standalone: false,
  templateUrl: './inventory-tracking.component.html',
  styleUrls: ['./inventory-tracking.component.css']
})
export class InventoryTrackingComponent implements OnInit {
  blocks = ['EB1', 'EB2', 'EB3'];
  floors = ['Ground', 'First', 'Second', 'Third'];
  wings = ['West', 'East'];

  selectedBlock = '';
  selectedFloor = '';
  selectedWing = '';

  items: any[] = [];
  buildingId: number | null = null;
  loading = false;
  error = '';

  // Track original units for comparison
  originalItems: any[] = [];
  changedItems: any[] = [];

  constructor(
    private buildingService: BuildingDetailsService,
    private trackingService: InventoryTrackingDetailsService,
    private http: HttpClient,
    private inventoryService: InventoryService
  ) {}

  ngOnInit() {}

  onSelectionChange() {
    if (this.selectedBlock && this.selectedFloor && this.selectedWing) {
      this.fetchBuildingId();
    }
  }

  fetchBuildingId() {
    this.loading = true;
    this.error = '';
    console.log('Fetching building details for:', this.selectedBlock, this.selectedFloor, this.selectedWing);
    this.buildingService.getAll().subscribe({
      next: (buildings: any[]) => {
        const building = buildings.find(b =>
          b.BuildingName === this.selectedBlock &&
          b.FloorName === this.selectedFloor &&
          b.WingName === this.selectedWing
        );
        console.log('Building found:', building);
        if (building) {
          this.buildingId = building.id;
          this.fetchInventoryTrackingDetails();
        } else {
          this.items = [];
          this.buildingId = null;
          this.loading = false;
          this.error = 'No building found for selection.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to fetch building details.';
        console.error('Error fetching building details:', err);
      }
    });
  }

  fetchInventoryTrackingDetails() {
    console.log('Fetching inventory tracking details for buildingId:', this.buildingId);
    this.trackingService.getAll().subscribe({
      next: (details: any[]) => {
        // Filter by building
        const filtered = details.filter(d => d.BuildingId === this.buildingId);
        console.log('Filtered tracking details:', filtered);
        if (filtered.length > 0) {
          // Find the latest date for each item
          const latestByItem: { [itemId: number]: any } = {};
          filtered.forEach(d => {
            const itemId = d.Inventory_ItemId;
            const entryDate = new Date(d.Date);
            if (!latestByItem[itemId] || new Date(latestByItem[itemId].Date) < entryDate) {
              latestByItem[itemId] = d;
            }
          });
          // Get all latest entries
          const finalFiltered = Object.values(latestByItem);
          console.log('Tracking details filtered by latest entry per item:', finalFiltered);
          const itemIds = finalFiltered.map((d: any) => d.Inventory_ItemId);
          this.fetchItems(itemIds, finalFiltered);
        } else {
          this.items = [];
          this.loading = false;
          this.error = 'No inventory tracking details found.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to fetch inventory tracking details.';
        console.error('Error fetching inventory tracking details:', err);
      }
    });
  }

  fetchItems(itemIds: number[], trackingDetails: any[]) {
    console.log('Fetching inventory items for itemIds:', itemIds);
    this.http.get<any[]>('http://localhost:3000/inventory-items').subscribe({
      next: (allItems: any[]) => {
        this.items = itemIds.map((id, idx) => {
          const item = allItems.find(i => i.id === id);
          const detail = trackingDetails[idx];
          // Attach Inventory_ItemId for update reference
          return item ? { ...item, units: detail.Units, trackingId: detail.id, Inventory_ItemId: id } : null;
        }).filter(Boolean);
        // Save a deep copy for change tracking
        this.originalItems = JSON.parse(JSON.stringify(this.items));
        this.changedItems = [];
        this.loading = false;
        console.log('Fetched items for UI:', this.items);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to fetch item details.';
        console.error('Error fetching inventory items:', err);
      }
    });
  }

  decrease(item: any) {
    if (item.units > 0) {
      item.units--;
      // Track changed items only if not already tracked
      if (!this.changedItems.find((i: any) => i.Inventory_ItemId === item.Inventory_ItemId)) {
        this.changedItems.push(item);
      }
      console.log('Decreased item:', item);
    }
  }

  updateAll() {
    if (!this.changedItems.length) return;
    this.loading = true;
    let updateCount = 0;
    let errorOccurred = false;
    console.log('Updating items:', this.changedItems);
    this.changedItems.forEach((item, idx) => {
      // 1. Update inventory-items table (overall stock)
      this.inventoryService.update(item.Inventory_ItemId, { ...item, Stock: item.units }).subscribe({
        next: (res) => {
          console.log(`Updated inventory-item ${item.Inventory_ItemId}:`, res);
          // 2. Update inventory-tracking-details table (building-specific stock)
          // Send full object for PUT
          const trackingPayload = {
            id: item.trackingId,
            BuildingId: this.buildingId,
            Inventory_ItemId: item.Inventory_ItemId,
            Units: item.units,
            Date: item.Date || new Date().toISOString()
          };
          console.log('Updating tracking detail with payload:', trackingPayload);
          this.trackingService.update(item.trackingId, trackingPayload).subscribe({
            next: (trackRes) => {
              console.log(`Updated tracking detail ${item.trackingId}:`, trackRes);
              updateCount++;
              if (updateCount === this.changedItems.length && !errorOccurred) {
                this.loading = false;
                this.changedItems = [];
                console.log('All updates complete.');
              }
            },
            error: (err) => {
              errorOccurred = true;
              this.loading = false;
              this.error = `Failed to update tracking detail for item: ${item.Name}`;
              console.error(`Error updating tracking detail ${item.trackingId}:`, err);
            }
          });
        },
        error: (err) => {
          errorOccurred = true;
          this.loading = false;
          this.error = `Failed to update item: ${item.Name}`;
          console.error(`Error updating item ${item.Inventory_ItemId}:`, err);
        }
      });
    });
  }
}
