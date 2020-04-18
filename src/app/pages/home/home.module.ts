import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';
import { HomePageRoutingModule } from './home.router.module';
const routes: Routes = [
  {
    path: "",
    component: HomePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    RouterModule.forChild(routes)

  ],
  declarations: [HomePage],
})
export class HomePageModule { }
