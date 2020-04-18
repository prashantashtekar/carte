import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from "./guards/auth.guard";

const routes: Routes = [
  //{ path: '', redirectTo: 'home', pathMatch: 'full', canActivate: [AuthGuard] },
  // { path: '', loadChildren:'./pages/home/home.module#HomePageModule', canActivate: [AuthGuard] },
  { path: '', loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule) },
  { path: 'login', loadChildren: () => import('./pages/auth/login/login.module').then(m => m.LoginPageModule) },
  { path: 'register', loadChildren: () => import('./pages/auth/register/register.module').then(m => m.RegisterPageModule) },
  { path: 'forgot-password', loadChildren: () => import('./pages/auth/forgot-password/forgot-password.module').then(m => m.ForgotPasswordPageModule) },
  { path: 'user-profile', loadChildren: './pages/user-profile/user-profile.module#UserProfilePageModule' },
  { path: 'user-profile-modal', loadChildren: './pages/user-profile-modal/user-profile-modal.module#UserProfileModalPageModule' },
  { path: 'admin', loadChildren: './pages/admin/admin.module#AdminPageModule' }, 
  // { path: 'product-add-edit', loadChildren: './pages/home/products/product-add-edit/product-add-edit.module#ProductAddEditPageModule' },
  // { path: 'customer-request', loadChildren: './pages/home/customer-request/customer-request.module#CustomerRequestPageModule' },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
