import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { HomePage } from './home.page';
const routes: Routes = [{
  path: "",
  component: HomePage,
  children: [
    //{
  //   path: "home",
  //   children: [
  //     {
  //       path: "",
  //       loadChildren: "./home/home.module#HomePageModule"
  //     }
  //   ]
  // },
  {
    path: "profile",
    children: [
      {
        path: "",
        loadChildren: "./profile/profile.module#ProfilePageModule"
      }
    ]
  },
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full"
  }
  ]
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
