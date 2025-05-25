
import { Component, OnInit } from '@angular/core';
import { RequestService } from '../../services/request.service';
import { BuildingDetailsService } from '../../services/buildingdetails.service';
import { InventoryTrackingDetailsService } from '../../services/inventorytrackingdetails.service';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-admin-approval',
  standalone: false,
  templateUrl: './admin-approval.component.html',
  styleUrls: ['./admin-approval.component.css']
})
export class AdminApprovalComponent implements OnInit {
  groupedRequests: any[] = [];
  loading = false;
  error = '';
  showDetails: { [buildingId: number]: boolean } = {};

  constructor(
    private requestService: RequestService,
    private buildingService: BuildingDetailsService,
    private trackingService: InventoryTrackingDetailsService,
    private inventoryService: InventoryService
  ) {}

  ngOnInit() {
    this.fetchRequests();
  }

  fetchRequests() {
    this.loading = true;
    this.groupedRequests = [];
    console.log('[AdminApproval] Fetching all requests...');
    this.requestService.getAll().subscribe({
      next: (requests: any[]) => {
        console.log('[AdminApproval] All requests:', requests);
        // Only status 0
        const pending = Array.isArray(requests) ? requests.filter(r => r.status === 0) : [];
        console.log('[AdminApproval] Pending requests (status 0):', pending);
        // Group by buildingId
        const grouped: { [buildingId: number]: any[] } = {};
        pending.forEach(req => {
          if (!grouped[req.buildingid]) grouped[req.buildingid] = [];
          grouped[req.buildingid].push(req);
        });
        console.log('[AdminApproval] Grouped by buildingId:', grouped);
        const buildingIds = Object.keys(grouped).map(Number);
        if (buildingIds.length === 0) {
          this.groupedRequests = [];
          this.loading = false;
          console.log('[AdminApproval] No pending requests.');
          return;
        }
        this.buildingService.getAll().subscribe({
          next: (buildings: any[]) => {
            console.log('[AdminApproval] All buildings:', buildings);
            this.inventoryService.getAll().subscribe({
              next: (allItems: any[]) => {
                console.log('[AdminApproval] All inventory items:', allItems);
                this.trackingService.getAll().subscribe({
                  next: (trackings: any[]) => {
                    console.log('[AdminApproval] All tracking details:', trackings);
                    // Build a map for item lookup by id for fast access
                    const itemMap: { [id: number]: any } = {};
                    if (Array.isArray(allItems)) {
                      allItems.forEach(i => { itemMap[i.id] = i; });
                    }
                    this.groupedRequests = buildingIds.map(bid => {
                      const building = Array.isArray(buildings) ? buildings.find(b => b.id === bid) : undefined;
                      const reqs = grouped[bid] || [];
                      // Deduplicate: only keep the most recent request per itemid (by max id)
                      const latestReqMap: { [itemid: number]: any } = {};
                      reqs.forEach(r => {
                        // If not present or this request is newer (higher id), keep it
                        if (!latestReqMap[r.itemid] || r.id > latestReqMap[r.itemid].id) {
                          latestReqMap[r.itemid] = r;
                        }
                      });
                      const dedupedReqs = Object.values(latestReqMap);
                      // For each deduped item in this building's requests
                      const items = dedupedReqs.map((r: any) => {
                        // Use itemMap for fast lookup
                        const item = itemMap[r.itemid];
                        // Find latest tracking for this item in this building
                        const track = Array.isArray(trackings)
                          ? trackings.filter(t => t.BuildingId === bid && t.Inventory_ItemId === r.itemid)
                              .sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime())[0]
                          : undefined;
                        console.log('[AdminApproval] Item for building', bid, 'itemid', r.itemid, '=>', item, 'track:', track);
                        return {
                          requestId: r.id,
                          itemId: r.itemid,
                          name: item ? (item.Name || item.name) : 'Unknown',
                          requested: r.quantity,
                          currentStock: track ? track.Units : 0,
                          overallStock: item ? (item.quantity ?? item.Quantity ?? item.Stock ?? 0) : 0
                        };
                      });
                      const groupObj = {
                        buildingId: bid,
                        buildingName: building?.BuildingName || 'Unknown',
                        floorName: building?.FloorName || '',
                        wingName: building?.WingName || '',
                        items,
                        approved: false,
                        rejected: false
                      };
                      console.log('[AdminApproval] Group object:', groupObj);
                      return groupObj;
                    });
                    this.loading = false;
                    console.log('[AdminApproval] Final groupedRequests:', this.groupedRequests);
                  },
                  error: (err) => { this.loading = false; this.error = 'Failed to load tracking details.'; console.error('[AdminApproval] Tracking error:', err); }
                });
              },
              error: (err) => { this.loading = false; this.error = 'Failed to load inventory items.'; console.error('[AdminApproval] Inventory error:', err); }
            });
          },
          error: (err) => { this.loading = false; this.error = 'Failed to load building details.'; console.error('[AdminApproval] Building error:', err); }
        });
      },
      error: (err) => { this.loading = false; this.error = 'Failed to load requests.'; console.error('[AdminApproval] Requests error:', err); }
    });
  }

  toggleDetails(buildingId: number) {
    this.showDetails[buildingId] = !this.showDetails[buildingId];
  }

  approve(building: any) {
    // Set status=1 for all requests of this building
    this.loading = true;
    this.requestService.getAll().subscribe({
      next: (requests: any[]) => {
        const toApprove = requests.filter(r => r.status === 0 && r.buildingid === building.buildingId);
        let completed = 0;
        toApprove.forEach(r => {
          this.requestService.patchStatus(r.id, 1).subscribe({
            next: () => {
              completed++;
              if (completed === toApprove.length) {
                building.approved = true;
                building.rejected = false;
                this.loading = false;
                this.fetchRequests();
              }
            },
            error: () => { this.loading = false; this.error = 'Failed to approve requests.'; }
          });
        });
      },
      error: () => { this.loading = false; this.error = 'Failed to load requests.'; }
    });
  }

  reject(building: any) {
    // Set status=2 for all requests of this building
    this.loading = true;
    this.requestService.getAll().subscribe({
      next: (requests: any[]) => {
        const toReject = requests.filter(r => r.status === 0 && r.buildingid === building.buildingId);
        let completed = 0;
        toReject.forEach(r => {
          this.requestService.patchStatus(r.id, 2).subscribe({
            next: () => {
              completed++;
              if (completed === toReject.length) {
                building.rejected = true;
                building.approved = false;
                this.loading = false;
                this.fetchRequests();
              }
            },
            error: () => { this.loading = false; this.error = 'Failed to reject requests.'; }
          });
        });
      },
      error: () => { this.loading = false; this.error = 'Failed to load requests.'; }
    });
  }
}
