import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-initial-stock',
  standalone: false,
  templateUrl: './initial-stock.component.html',
  styleUrls: ['./initial-stock.component.css']
})
export class InitialStockComponent implements OnInit {
  items: any[] = [];
  loading = false;
  error = '';

  constructor(private inventoryService: InventoryService) {}

  ngOnInit() {
    this.fetchItems();
  }

  fetchItems() {
    this.loading = true;
    this.inventoryService.getAll().subscribe({
      next: (data: any[]) => {
        this.items = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to fetch inventory items.';
        this.loading = false;
      }
    });
  }
}
