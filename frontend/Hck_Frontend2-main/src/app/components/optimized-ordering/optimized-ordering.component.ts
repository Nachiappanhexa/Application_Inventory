import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BuildingDetailsService } from '../../services/buildingdetails.service';
import { RequestService } from '../../services/request.service';

@Component({
  selector: 'app-optimized-ordering',
  standalone: false,
  templateUrl: './optimized-ordering.component.html',
  styleUrls: ['./optimized-ordering.component.css']
})
export class OptimizedOrderingComponent {
  showAdminRequest = false;
  showAdminApproval = false;

  // For building selection
  blocks = ['EB1', 'EB2', 'EB3'];
  floors = ['Ground', 'First', 'Second', 'Third'];
  wings = ['West', 'East'];
  selectedBlock = '';
  selectedFloor = '';
  selectedWing = '';
  buildingId: number | null = null;

  // For item selection and request
  lowStockItems: any[] = [];
  allItems: any[] = [];
  selectedItemId: number | null = null;
  selectedItem: any = null;
  quantity = 1;
  selectedItems: any[] = [];
  loading = false;
  error = '';
  requestSuccess = false;
  requestError = '';

  constructor(
    private http: HttpClient,
    private buildingService: BuildingDetailsService,
    private requestService: RequestService
  ) {}

  onSelectionChange() {
    console.log('Selection changed:', this.selectedBlock, this.selectedFloor, this.selectedWing);
    if (this.selectedBlock && this.selectedFloor && this.selectedWing) {
      this.fetchBuildingId();
    } else {
      this.lowStockItems = [];
      this.selectedItemId = null;
      this.selectedItem = null;
    }
  }

  fetchBuildingId() {
    this.loading = true;
    this.error = '';
    console.log('Fetching building details for:', this.selectedBlock, this.selectedFloor, this.selectedWing);
    this.buildingService.getAll().subscribe({
      next: (buildings: any[]) => {
        console.log('Buildings fetched:', buildings);
        const building = buildings.find(b =>
          b.BuildingName === this.selectedBlock &&
          b.FloorName === this.selectedFloor &&
          b.WingName === this.selectedWing
        );
        console.log('Building found:', building);
        if (building) {
          this.buildingId = building.id;
          this.fetchLowStockItems();
        } else {
          this.lowStockItems = [];
          this.selectedItemId = null;
          this.selectedItem = null;
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

  fetchLowStockItems() {
    if (!this.buildingId) return;
    this.loading = true;
    this.error = '';
    console.log('Fetching inventory items for name lookup...');
    this.http.get<any[]>('http://localhost:3000/inventory-items').subscribe({
      next: (allItems) => {
        this.allItems = allItems;
        console.log('All inventory items:', allItems);
        // Fetch optimized tracking details for this building
        console.log('Fetching optimized tracking details for building:', this.buildingId);
        this.http.get<any[]>(`http://localhost:3000/inventory-tracking-details/optimized-by-building/${this.buildingId}`).subscribe({
          next: (details) => {
            console.log('Optimized tracking details:', details);
            // Only items with comment 'low stock', but only the latest date per Inventory_ItemId
            const latestByItem: { [itemId: number]: any } = {};
            details.filter((d: any) => d.comment === 'low stock').forEach((d: any) => {
              const itemId = d.Inventory_ItemId;
              const entryDate = new Date(d.Date);
              if (!latestByItem[itemId] || new Date(latestByItem[itemId].Date) < entryDate) {
                latestByItem[itemId] = d;
              }
            });
            this.lowStockItems = Object.values(latestByItem)
              .map((d: any) => {
                const item = allItems.find(i => i.id === d.Inventory_ItemId);
                return item ? { ...item, ...d } : null;
              })
              .filter((item) => {
                if (!item) return false;
                const key = item.Inventory_ItemId || item.id;
                if (this.selectedItems.some(sel => (sel.Inventory_ItemId || sel.id) === key)) return false;
                return true;
              });
            console.log('Low stock items (latest only):', this.lowStockItems);
            this.loading = false;
            if (this.lowStockItems.length === 0) {
              this.error = 'No low stock items for this building.';
            }
          },
          error: (err) => {
            this.loading = false;
            this.error = 'Failed to fetch inventory tracking details.';
            console.error('Error fetching optimized tracking details:', err);
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to fetch inventory items.';
        console.error('Error fetching inventory items:', err);
      }
    });
  }

  onItemSelect() {
    console.log('Item selected:', this.selectedItemId);
    const item = this.lowStockItems.find(i => i.id == this.selectedItemId);
    if (!item) return;
    // Add to selectedItems if not already present
    if (!this.selectedItems.some(i => i.id === item.id)) {
      this.selectedItems.push({ ...item, quantity: this.quantity });
    }
    // Remove from dropdown
    this.lowStockItems = this.lowStockItems.filter(i => i.id !== item.id);
    this.selectedItemId = null;
    this.quantity = 1;
    this.requestSuccess = false;
    this.requestError = '';
  }

  increase() {
    this.quantity++;
  }
  decrease() {
    if (this.quantity > 1) this.quantity--;
  }

  increaseSelected(item: any) {
    item.quantity++;
  }
  decreaseSelected(item: any) {
    if (item.quantity > 1) item.quantity--;
  }

  removeSelected(item: any) {
    // Remove from selectedItems and add back to dropdown
    this.selectedItems = this.selectedItems.filter(i => i.id !== item.id);
    this.lowStockItems.push(item);
  }

  cancelRequest() {
    this.showAdminRequest = false;
    this.selectedBlock = '';
    this.selectedFloor = '';
    this.selectedWing = '';
    this.buildingId = null;
    this.lowStockItems = [];
    this.selectedItemId = null;
    this.selectedItem = null;
    this.selectedItems = [];
    this.quantity = 1;
    this.requestSuccess = false;
    this.requestError = '';
    this.error = '';
  }

  submitRequest() {
    if (!this.selectedItems.length || !this.buildingId) return;
    let completed = 0;
    let hasError = false;
    this.selectedItems.forEach(item => {
      const req = {
        itemid: item.Inventory_ItemId,
        buildingid: this.buildingId,
        quantity: item.quantity
      };
      this.requestService.create(req).subscribe({
        next: () => {
          completed++;
          if (completed === this.selectedItems.length && !hasError) {
            this.requestSuccess = true;
            this.requestError = '';
            this.showAdminRequest = false;
            // Reset building and item selection for next time
            this.selectedBlock = '';
            this.selectedFloor = '';
            this.selectedWing = '';
            this.buildingId = null;
            this.lowStockItems = [];
            this.selectedItemId = null;
            this.selectedItem = null;
            this.selectedItems = [];
            this.quantity = 1;
            this.error = '';
          }
        },
        error: () => {
          hasError = true;
          this.requestError = 'Failed to submit request.';
        }
      });
    });
  }
}
