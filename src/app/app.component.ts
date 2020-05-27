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
import { BackgroundMode } from '@ionic-native/background-mode/ngx';


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
  roleWiseSideNavkeys: string[] = [];
  roleWiseSideNavItems!: any;

  constructor(
    private menu: MenuController,
    private platform: Platform,
    private router: Router,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar, private navCtrl: NavController,
    public authService: AuthService, private loadingService: LoadingService,
    private toastService: ToastService, private alertService: AlertService,
    private androidPermissions: AndroidPermissions,
    private network: Network, public networkService: NetworkService, private backgroundMode: BackgroundMode
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

  ngAfterViewInit() {
    //TODO:Uncomment this - network service ON/Off
    // this.networkSubscriber();

  }
  //TODO:Uncomment This - for network on/off status
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
      //auth service init
      this.authService.init();
      //cordova-plugin-background-mode
      this.backgroundMode.enable();
      this.backgroundMode.on("activate").subscribe(() => {
        this.backgroundMode.disableWebViewOptimizations();
      });

      this.authService.user$.subscribe((user) => {
        if (user != null) {
          console.log('current user: ', user);
          this.roleName = user.roleName;
        }
      });
      //TODO: Menu as per roles
      // this.authService.user$.subscribe((user) => {
      //   if (user != null) {
      //     console.log('current user: ', user);
      //     this.roleName = user.roleName;

      //     let sideNavItemsCopy = JSON.parse(JSON.stringify(this.appPages));
      //     for (var key in this.appPages) {
      //       this.appPages[key].access.forEach((item, index, object) => {
      //         if (this.appPages[key].access.includes(this.roleName)) {
      //           //If user has access to the any of the submenus,push it into roleWiseSideNavKeys
      //           if (this.roleWiseSideNavkeys.indexOf(key) === -1) {
      //             this.roleWiseSideNavkeys.push(key);
      //           }
      //         }
      //         else {
      //           //User has no rights so remove submenu from copied object
      //           sideNavItemsCopy.access.splice(index, 1)
      //         }
      //       })

      //     }
      //     this.roleWiseSideNavItems = sideNavItemsCopy;
      //   }
      // });

    });



    // this.platform.ready().then(() => {
    //   this.statusBar.styleDefault();
    //   this.splashScreen.hide();
    // });
  }

}
