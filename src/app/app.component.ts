import { Component } from '@angular/core';

import { Platform, MenuController, ToastController, NavController, Events } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AuthService } from './services/auth/auth.service';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';

import { Router } from '@angular/router';
import { LoadingService } from './services/loading/loading.service';
import { ToastService } from './services/toast/toast.service';
import { AlertService } from './services/alert/alert.service';
import { Network } from '@ionic-native/network/ngx';
import { NetworkService } from './services/network/network.service';
import { debounceTime } from 'rxjs/operators';


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
      access: ['CartUser', 'Customer', 'Admin', 'SuperAdmin'],
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
  isConnected: boolean;
  constructor(
    private menu: MenuController,
    private platform: Platform,
    private router: Router,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar, private navCtrl: NavController,
    public authService: AuthService, private loadingService: LoadingService,
    private toastService: ToastService, private alertService: AlertService,
    private androidPermissions: AndroidPermissions,
    private network: Network, public networkService: NetworkService,
  ) {

    platform.ready().then(() => {

      //TODO://Remove comment
      // androidPermissions.requestPermissions(
      //   [
      //     androidPermissions.PERMISSION.CAMERA,
      //     androidPermissions.PERMISSION.CALL_PHONE,
      //     androidPermissions.PERMISSION.GET_ACCOUNTS,
      //     androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE,
      //     androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE,
      //   ]
      // );
    //  this.networkService.initializeNetworkEvents();

    })
    this.initializeApp();
  }
  ngOnInit() {
    // this.authService.user$.subscribe((user) => {
    //   this.userEmail = user.email;
    //   this.roleName = user.roleName;
    // });
   
  }

  ngAfterViewInit()
  {
   // this.networkSubscriber();
  }

  // networkSubscriber(): void {
  //   this.networkService
  //     .getNetworkStatus()
  //     .pipe(debounceTime(300))
  //     .subscribe((connected: boolean) => {
  //       this.isConnected = connected;
  //       console.log('[Home] isConnected', this.isConnected);

  //       this.toastService.present({
  //         message: '[Home] isConnected' + this.isConnected,
  //         duration: 3000,
  //         color: "danger"
  //       });

  //       //this.handleNotConnected(connected);
  //     });
  // }
  showMenu() {
    return (this.roleName === 'SuperAdmin' || this.roleName === 'Admin')
  }

  changePassword() {
    let emailAddress = this.userEmail
    this.authService.changePassword(emailAddress)
      .then(() => {
        this.resetRequestSuccess();
        this.router.navigateByUrl("/login");
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
