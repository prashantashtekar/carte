import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AddCartPage } from './add-cart.page';

const routes: Routes = [
  {
    path: '',
    component: AddCartPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule, 
    RouterModule.forChild(routes)
  ],
  declarations: [AddCartPage]
})
export class AddCartPageModule {}
