import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { AdminApprovalComponent } from './components/admin-approval/admin-approval.component';
import { CostSavingsComponent } from './components/cost-savings/cost-savings.component';
import { InitialStockComponent } from './components/initial-stock/initial-stock.component';
import { InventoryTrackingComponent } from './components/inventory-tracking/inventory-tracking.component';
import { LoginComponent } from './components/login/login.component';
import { OptimizedOrderingComponent } from './components/optimized-ordering/optimized-ordering.component';
import { ReportingComponent } from './components/reporting/reporting.component';
import { RequestItemToAdminComponent } from './components/request-item-to-admin/request-item-to-admin.component';
import { VendorRequestComponent } from './components/vendor-request/vendor-request.component';
import { WasteReductionAlertsComponent } from './components/waste-reduction-alerts/waste-reduction-alerts.component';

@NgModule({
  declarations: [
    AppComponent,
    AdminApprovalComponent,
    CostSavingsComponent,
    InitialStockComponent,
    InventoryTrackingComponent,
    LoginComponent,
    OptimizedOrderingComponent,
    ReportingComponent,
    RequestItemToAdminComponent,
    VendorRequestComponent,
    WasteReductionAlertsComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
