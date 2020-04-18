import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';
// const routes: Routes = [
//   {
//     path: "",
//     component: HomePage
//   }
// ];
const routes: Routes = [
  {
    path: "home",
    component: HomePage,
    children: [
      {
        path: 'map',
        loadChildren: () => import('../maps/maps.module').then(m => m.MapsPageModule)
      },
      {
        path: 'products',
        loadChildren: () => import('../products/products.module').then(m => m.ProductsPageModule)
      },
      {
        path: 'request',
        loadChildren: () => import('../customer-request/customer-request.module').then(m => m.CustomerRequestPageModule)
      }
    ]
  },
  {
    path: "",
    redirectTo: "home/map",
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
  exports: [RouterModule],
  declarations: [HomePage],
})
export class HomePageModule { }
