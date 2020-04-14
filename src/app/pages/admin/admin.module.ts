import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AdminPage } from './admin.page';
import { AddCartPage } from './add-cart/add-cart.page';
import { AssignCartPage } from './assign-cart/assign-cart.page';
import { CartOwnerPage } from './cart-owner/cart-owner.page';
import { RegisteredUsersPage } from './registered-users/registered-users.page';

const routes: Routes = [
  {
    path: '',
    component: AdminPage
  },
  { path: 'add-cart', component: AddCartPage },
  { path: 'assign-cart/:method/:id', component: AssignCartPage },
  { path: 'cart-owner', component: CartOwnerPage },
  { path: 'registered-users', component: RegisteredUsersPage },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,    
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AdminPage, AddCartPage, AssignCartPage,CartOwnerPage, RegisteredUsersPage]
})
export class AdminPageModule { }
