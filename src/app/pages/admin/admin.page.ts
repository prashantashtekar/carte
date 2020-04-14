import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {

  constructor( private router: Router,) { }

  ngOnInit() {
  }

  addcart()
  {
    this.router.navigateByUrl("admin/add-cart");
  }

  assigncart()
  {
    const method = 'add';
   // this.router.navigate(['projects', method, 0]);
    this.router.navigateByUrl("admin/assign-cart/"+ method +"/0");
  }

  cartowner()
  {
    this.router.navigateByUrl("admin/cart-owner");
  }

  Customers()
  {
    this.router.navigateByUrl("admin/registered-users");
  }

}
