import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomePage } from './home.page';

const routes: Routes = [
    {
        path: "home",
        component: HomePage,
        children: [
            { path: 'map', loadChildren: './maps/maps.module#MapsPageModule' },
            { path: 'products', loadChildren: './products/products.module#ProductsPageModule' },
            { path: 'request', loadChildren: './customer-request/customer-request.module#CustomerRequestPageModule' }
        ]
    },
    {
        path: "",
        redirectTo: "home/map",
        pathMatch: "full"
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class HomePageRoutingModule { }
