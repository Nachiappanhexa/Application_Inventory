import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BuildingDetailsService } from '../../services/buildingdetails.service';
import { InventoryTrackingDetailsService } from '../../services/inventorytrackingdetails.service';
import { InventoryService } from '../../services/inventory.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reporting',
  standalone: false,
  templateUrl: './reporting.component.html',
  styleUrls: ['./reporting.component.css']
})

export class ReportingComponent {
  blocks: string[] = ['EB1', 'EB2', 'EB3'];
  floors: string[] = ['Ground', 'First', 'Second', 'Third'];
  wings: string[] = ['West', 'East'];

  selectedBlock = '';
  selectedFloor = '';
  selectedWing = '';
  selectedDate: string = '';
  dateRangeStart: string = '';
  dateRangeEnd: string = '';
  buildingId: number | null = null;
  buildingDetails: any = null;
  items: any[] = [];
  loading = false;
  error = '';
  showTable = false;
  showPdfTooltip = false;
  showExcelTooltip = false;

  constructor(
    private buildingService: BuildingDetailsService,
    private trackingService: InventoryTrackingDetailsService,
    private inventoryService: InventoryService,
    private http: HttpClient
  ) {}

  onSelectionChange() {
    if (this.selectedBlock && this.selectedFloor && this.selectedWing) {
      this.fetchBuildingId();
    }
  }

  fetchBuildingId() {
    this.loading = true;
    this.error = '';
    this.buildingService.getAll().subscribe({
      next: (buildings: any[]) => {
        const building = buildings.find(b =>
          b.BuildingName === this.selectedBlock &&
          b.FloorName === this.selectedFloor &&
          b.WingName === this.selectedWing
        );
        if (building) {
          this.buildingId = building.id;
          this.buildingDetails = building;
          this.fetchAllItemsForBuilding();
        } else {
          this.items = [];
          this.buildingId = null;
          this.loading = false;
          this.error = 'No building found for selection.';
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Failed to fetch building details.';
      }
    });
  }

  fetchAllItemsForBuilding() {
    if (!this.buildingId) return;
    this.loading = true;
    this.trackingService.getAll().subscribe({
      next: (details: any[]) => {
        const filtered = details.filter((d: any) => d.BuildingId === this.buildingId);
        if (filtered.length > 0) {
          const latestByItem: { [itemId: number]: any } = {};
          filtered.forEach((d: any) => {
            const itemId = d.Inventory_ItemId;
            const entryDate = new Date(d.Date);
            if (!latestByItem[itemId] || new Date(latestByItem[itemId].Date) < entryDate) {
              latestByItem[itemId] = d;
            }
          });
          const finalFiltered = Object.values(latestByItem);
          const itemIds = finalFiltered.map((d: any) => d.Inventory_ItemId);
          this.fetchItems(itemIds, finalFiltered);
        } else {
          this.items = [];
          this.loading = false;
          this.error = 'No inventory tracking details found.';
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Failed to fetch inventory tracking details.';
      }
    });
  }

  fetchItems(itemIds: number[], trackingDetails: any[]) {
    this.http.get<any[]>('http://localhost:3000/inventory-items').subscribe({
      next: (allItems: any[]) => {
        this.items = itemIds.map((id, idx) => {
          const item = allItems.find(i => i.id === id);
          const detail = trackingDetails[idx];
          return item ? { ...item, units: detail.Units, date: detail.Date } : null;
        }).filter(Boolean);
        this.loading = false;
        this.showTable = true;
      },
      error: () => {
        this.loading = false;
        this.error = 'Failed to fetch item details.';
      }
    });
  }


  fetchByDate(date: string) {
    if (!this.buildingId) return;
    this.loading = true;
    this.trackingService.getAll().subscribe({
      next: (details: any[]) => {
        const filtered = details.filter((d: any) => d.BuildingId === this.buildingId && d.Date?.slice(0, 10) === date);
        if (filtered.length > 0) {
          const itemIds = filtered.map((d: any) => d.Inventory_ItemId);
          this.fetchItems(itemIds, filtered);
        } else {
          this.items = [];
          this.loading = false;
          this.error = 'No items found for selected date.';
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Failed to fetch inventory tracking details.';
      }
    });
  }

  fetchByDateRange() {
    if (!this.buildingId || !this.dateRangeStart || !this.dateRangeEnd) return;
    this.loading = true;
    this.trackingService.getAll().subscribe({
      next: (details: any[]) => {
        const filtered = details.filter((d: any) => {
          if (d.BuildingId !== this.buildingId) return false;
          const dDate = d.Date?.slice(0, 10);
          return dDate >= this.dateRangeStart && dDate <= this.dateRangeEnd;
        });
        if (filtered.length > 0) {
          const itemIds = filtered.map((d: any) => d.Inventory_ItemId);
          this.fetchItems(itemIds, filtered);
        } else {
          this.items = [];
          this.loading = false;
          this.error = 'No items found for selected date range.';
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Failed to fetch inventory tracking details.';
      }
    });
  }

  clearDateRange() {
    this.dateRangeStart = '';
    this.dateRangeEnd = '';
    this.error = '';
    // Fetch the default table for the selected building
    if (this.buildingId) {
      this.fetchAllItemsForBuilding();
    } else {
      this.items = [];
      this.showTable = false;
    }
  }

  downloadAsExcel() {
    if (!this.items.length) return;
    // Heading as in the UI
    const heading = `Inventory supplies report for ${this.buildingDetails?.BuildingName || ''} | ${this.buildingDetails?.FloorName || ''} | ${this.buildingDetails?.WingName || ''}`;
    const wsData = [
      [heading],
      [],
      [
        'S.No',
        'Item Name',
        'No. of Items Available',
        'Date'
      ],
      ...this.items.map((item, i) => [
        i + 1,
        item.Name || item.name,
        item.units,
        (item.date || '').slice(0, 10)
      ])
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, 'report.xlsx');
  }

  downloadAsPDF() {
    if (!this.items.length) return;
    const doc = new jsPDF();
    let y = 12;
    // Heading as in the UI
    const heading = `Inventory supplies report for ${this.buildingDetails?.BuildingName || ''} | ${this.buildingDetails?.FloorName || ''} | ${this.buildingDetails?.WingName || ''}`;
    doc.setFontSize(14);
    doc.text(heading, 14, y);
    y += 6;
    doc.setDrawColor(25, 118, 210); // #1976d2
    doc.setLineWidth(1.2);
    doc.line(14, y, 196, y);
    y += 6;
    autoTable(doc, {
      startY: y,
      head: [[
        'S.No',
        'Item Name',
        'No. of Items Available',
        'Date'
      ]],
      body: this.items.map((item, i) => [
        i + 1,
        item.Name || item.name,
        item.units,
        (item.date || '').slice(0, 10)
      ]),
      theme: 'grid',
      headStyles: { fillColor: [44, 130, 201] },
      styles: { fontSize: 10 }
    });
    doc.save('report.pdf');
  }
}
