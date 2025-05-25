import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OptimizedOrderingComponent } from './components/optimized-ordering/optimized-ordering.component';
import { CostSavingsComponent } from './components/cost-savings/cost-savings.component';
import { ReportingComponent } from './components/reporting/reporting.component';
import { InitialStockComponent } from './components/initial-stock/initial-stock.component';
import { InventoryTrackingComponent } from './components/inventory-tracking/inventory-tracking.component';
import { VendorRequestComponent } from './components/vendor-request/vendor-request.component';
import { AdminApprovalComponent } from './components/admin-approval/admin-approval.component';
import { LoginComponent } from './components/login/login.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'inventory-tracking', component: InventoryTrackingComponent },
  { path: 'optimized-ordering', component: OptimizedOrderingComponent },
  { path: 'cost-savings', component: CostSavingsComponent },
  { path: 'reporting', component: ReportingComponent },
  { path: 'initial-stock', component: InitialStockComponent },
  { path: 'vendor-request', component: VendorRequestComponent },
  { path: 'admin-approval', component: AdminApprovalComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
