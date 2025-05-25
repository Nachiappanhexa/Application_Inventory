import { Component } from '@angular/core';

@Component({
  selector: 'app-request-item-to-admin',
  standalone: false,
  templateUrl: './request-item-to-admin.component.html',
  styleUrls: ['./request-item-to-admin.component.css']
})
export class RequestItemToAdminComponent {
  paper = 0;
  stationery = 0;
  coffeePods = 0;
  cleaningSupplies = 0;

  increase(item: string) {
    if (item === 'paper') this.paper++;
    else if (item === 'stationery') this.stationery++;
    else if (item === 'coffeePods') this.coffeePods++;
    else if (item === 'cleaningSupplies') this.cleaningSupplies++;
  }

  decrease(item: string) {
    if (item === 'paper' && this.paper > 0) this.paper--;
    else if (item === 'stationery' && this.stationery > 0) this.stationery--;
    else if (item === 'coffeePods' && this.coffeePods > 0) this.coffeePods--;
    else if (item === 'cleaningSupplies' && this.cleaningSupplies > 0) this.cleaningSupplies--;
  }
}
