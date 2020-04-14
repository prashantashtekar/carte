import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { HomePage } from './home.page';
import { MapsPage } from './maps/maps.page';
import { ProductsPage } from './products/products.page';

const routes: Routes = [
  {
    path: "",
    component: HomePage,
    children: [
      {
        path: "map",
        children: [
          {
            path: "",
            loadChildren: "./maps/maps.module#MapsPageModule"
          }
        ]
      },
      {

        path: "products",
        children: [
          {
            path: "",
            loadChildren: "./products/products.module#ProductsPageModule"
          }
        ]
      },
      {
        path: "",
        redirectTo: "map",
        pathMatch: "full"
      }
    ]
  },
  {
    path: "",
    redirectTo: "map",
    pathMatch: "full"
  }
];






@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [HomePage],
  exports: [RouterModule]
})
export class HomePageModule { }
