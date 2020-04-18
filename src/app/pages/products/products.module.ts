import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ProductsPage } from './products.page';
import { ProductAddEditPage } from './product-add-edit/product-add-edit.page';

const routes: Routes = [
  {
    path: '',
    component: ProductsPage
  },
  { path: ':method/:id', component: ProductAddEditPage },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ProductsPage,ProductAddEditPage]
})
export class ProductsPageModule {}
