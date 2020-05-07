import { Component } from '@angular/core';

import { Platform, MenuController, ToastController, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AuthService } from './services/auth/auth.service';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Router } from '@angular/router';
import { LoadingService } from './services/loading/loading.service';
import { ToastService } from './services/toast/toast.service';
import { AlertService } from './services/alert/alert.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  appPages = [
    {
      title: 'Home',
      url: '/home/map',
      icon: 'map',
      access: ['CartUser', 'Customer','Admin', 'SuperAdmin'],
    },
    {
      title: 'Administration',
      url: '/admin',
      icon: 'settings',
      access: ['Admin', 'SuperAdmin'],
    },
    // {
    //   title: 'Change Password',
    //   url: '/app/tabs/speakers',
    //   icon: 'people'
    // },
    // {
    //   title: 'Map',
    //   url: '/app/tabs/map',
    //   icon: 'map'
    // },
    // {
    //   title: 'About',
    //   url: '/app/tabs/about',
    //   icon: 'information-circle'
    // }
  ];
  loggedIn = false;
  dark = false;
  userEmail: string;
  roleName: string = "";
  constructor(
    private menu: MenuController,
    private platform: Platform,
    private router: Router,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar, private navCtrl: NavController,
    public authService: AuthService, private loadingService: LoadingService, private toastService: ToastService, private alertService: AlertService,
    // /  androidPermissions: AndroidPermissions
  ) {

    //     platform.ready().then(() => {

    //       androidPermissions.requestPermissions(
    //         [
    //           androidPermissions.PERMISSION.CAMERA, 
    //           androidPermissions.PERMISSION.CALL_PHONE, 
    //           androidPermissions.PERMISSION.GET_ACCOUNTS, 
    //           androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE, 
    //           androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE
    //         ]
    //       );

    //  }) 
    this.initializeApp();
  }
  ngOnInit() {


    this.authService.user$.subscribe((user) => {
      this.userEmail = user.email;
      this.roleName = user.roleName;
    });
  }

  showMenu() {
    return (this.roleName === 'SuperAdmin' || this.roleName === 'Admin')
  }

  changePassword() {
    let emailAddress = this.userEmail
    this.authService.changePassword(emailAddress)
      .then(() => {
        this.resetRequestSuccess();
        this.router.navigateByUrl("/login-phone");
      }).catch(error => {
        this.requestFailed(error)
      });
  }

  logout() {
    this.menu.enable(false);
    this.authService
      .logoutUser()
      .then(() => {
        this.logoutSucess();
        this.router.navigateByUrl("/login");
      })
      .catch(error => console.log(error));
  }

  logoutSucess() {

    this.toastService.present({
      message: "Logout successful. See ya next time!",
      duration: 3000,
      color: "secondary"
    });
  }

  requestFailed(error: any) {
    this.loadingService.dismiss();

    this.alertService.present({
      header: 'Login Error',
      subHeader: error.code,
      message: error.message,
      buttons: ['OK']
    });
  }
  resetRequestSuccess() {
    this.loadingService.dismiss();

    this.toastService.present({
      message: "An email is on the way with password reset instructions",
      showCloseButton: true,
      color: "secondary"
    });
  }
  initializeApp() {

    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    
      this.authService.init();
 
    });

   

    // this.platform.ready().then(() => {
    //   this.statusBar.styleDefault();
    //   this.splashScreen.hide();
    // });
  }
}
