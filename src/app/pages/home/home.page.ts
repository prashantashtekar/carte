import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { AuthService } from "../../services/auth/auth.service";
import { ToastService } from "../../services/toast/toast.service";
import { ModalController, NavController, MenuController } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';
import { UserProfileModalPage } from '../user-profile-modal/user-profile-modal.page';
import { UserProfilePopoverComponent } from '../../components/user-profile-popover/user-profile-popover.component';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { AlertService } from 'src/app/services/alert/alert.service';
import { LocationService } from 'src/app/services/location/location.service';
import { Geoposition } from '@ionic-native/geolocation/ngx';
import { User } from 'src/app/interfaces/user';
import { AdminService } from 'src/app/services/admin/admin.service';
import { MapsPage } from '../maps/maps.page';
import { ProductsPage } from '../products/products.page';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import {
  BackgroundGeolocation,
  BackgroundGeolocationConfig,
  BackgroundGeolocationResponse,
  BackgroundGeolocationEvents
} from "@ionic-native/background-geolocation/ngx";

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"]
})
export class HomePage implements OnInit {

  userProfile: User = null;
  roleName: string = ""
  isCartActiveData: any = {
    isVisible: false,
    className: 'success',
    iconName: 'checkmark-circle'
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    public adminServices: AdminService,
    private modalController: ModalController,
    public popoverController: PopoverController,
    private navCtrl: NavController,
    private loadingService: LoadingService,
    private alertService: AlertService,
    private locationService: LocationService, private backgroundGeolocation: BackgroundGeolocation,
    private menu: MenuController, private diagnostic: Diagnostic,
    //  private backgroundGeolocation: BackgroundGeolocation
  ) {

    this.menu.enable(true);
  }

  ngOnInit() {
    this.menu.enable(true);
    //this.router.navigate(["home/map"]);


    //Tabs Implementation
    // https://ovpv.me/add-tabs-ionic-4/

    // let isLocationEnabled = this.locationService.locationStatus().then(data=>{
    //   console.log("Location Enabled : " + data);    
    // });
    // let gspPermission = this.locationService.checkGPSPermission().then(
    //   (data) => { alert(data) }, (err) => {
    //     console.log("error : " + err.message);
    //    // alert(err.message)
    //   }
    // );

    // this.locationService.getLocationCoordinates().then((pos: Geoposition) => {
    //   this.currentPos = pos;
    //   const location = {
    //     lat: pos.coords.latitude,
    //     lng: pos.coords.longitude,
    //     time: new Date(),
    //   };
    //   alert("Location: " + location.lat);
    // }, (err: PositionError) => {
    //   console.log("error : " + err.message);
    //  // alert("Location not enabled")
    // });


    // if (this.authService.userDetails()) {
    //   this.userEmail = this.authService.userDetails().email;
    // } else {
    //   this.navCtrl.navigateBack('');
    // }
  }

  startBackgroundGeolocation(user: User) {
    const config: BackgroundGeolocationConfig = {
      desiredAccuracy: 10,
      stationaryRadius: 20,
      distanceFilter: 30,
      debug: false, //  enable this hear sounds for background-geolocation life-cycle.
      stopOnTerminate: false // enable this to clear background location settings when the app terminates
    };

    this.backgroundGeolocation.configure(config).then(() => {
      this.backgroundGeolocation
        .on(BackgroundGeolocationEvents.location)
        .subscribe((location: BackgroundGeolocationResponse) => {
          console.log(location);
          this.sendGPS(location, user);
          // IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
          // and the background-task may be completed.  You must do this regardless if your operations are successful or not.
          // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
        });
    });

    // start recording location
    this.backgroundGeolocation.start();

    // If you wish to turn OFF background-tracking, call the #stop method.
    //this.backgroundGeolocation.stop();
  }

  sendGPS(location, user: User) {
    if (location.speed == undefined) {
      location.speed = 0;
    }
    let timestamp = new Date(location.time);
    //Update lat-long,location
    user.latitude = location.latitude;
    user.longitude = location.longitude;
    user.location.push({ "timestamp": timestamp, "latitude": location.latitude, "longitude": location.longitude })
    const userFormData: User = Object.assign({}, user);
    console.log("updated user");
    console.log(userFormData);
    this.authService.updateUserDocumentInFirebase(userFormData);
    //.subscribe(data => {
    //   console.log(data.status);
    //   console.log(data.data); // data received by server
    //   console.log(data.headers);
    //   this.backgroundGeolocation.finish(); // FOR IOS ONLY
    // }).catch(error => {
    //   console.log(error.status);
    //   console.log(error.error); // error message as string
    //   console.log(error.headers);
    //   this.backgroundGeolocation.finish(); // FOR IOS ONLY
    // });
  }


  async ngAfterViewInit() {
    this.menu.enable(true);
    this.authService.user$.subscribe((user) => {
      if (user != null) {
        console.log('current user: ', user);
        this.userProfile = user;
        this.roleName = user.roleName;

        if (this.userProfile.roleName == 'CartUser') {
          //Set Backgroung location
          console.log("Seting background location + user");
          console.log(this.userProfile);
          this.startBackgroundGeolocation(this.userProfile)
          //TODO://Remove comment
          // let successCallback = (isAvailable) => { console.log('Is available? ' + isAvailable); }
          // let errorCallback = (e) => console.error(e);
          // this.diagnostic.isBluetoothAvailable().then(successCallback, errorCallback);

          // this.diagnostic.getBluetoothState()
          //   .then((state) => {
          //     if (state == this.diagnostic.bluetoothState.POWERED_ON) {
          //       // do something
          //       console.log(state);
          //     } else {
          //       // do something else
          //       console.log("off");
          //     }
          //   }).catch(e => console.error(e));

          if (!this.userProfile.isCartActive) {
            this.isCartActiveData = {
              isVisible: true,
              className: 'danger',
              iconName: 'close-circle'
            };
          } else {
            this.isCartActiveData = {
              isVisible: true,
              className: 'success',
              iconName: 'checkmark-circle'
            };
          }
        }
        this.router.navigate(["home/map"]);
      }
    });
  }

  isCartActive() {
    if (this.userProfile.isCartActive) {
      this.userProfile.isCartActive = false;
      this.isCartActiveData = {
        isVisible: true,
        className: 'danger',
        iconName: 'close-circle'
      };
    } else {
      this.userProfile.isCartActive = true;
      this.isCartActiveData = {
        isVisible: true,
        className: 'success',
        iconName: 'checkmark-circle'
      };
    }
    this.updateUser();
  }

  updateUser() {
    this.adminServices.UpdateIsCartActive(this.userProfile.uid, this.userProfile.isCartActive);
    if (this.userProfile.isCartActive) {
      this.toastService.present({
        message: "Cart is now Active.",
        duration: 3000,
        color: "success"
      });
    } else {
      this.toastService.present({
        message: "Cart is now Inactive",
        duration: 3000,
        color: "warning"
      });
    }
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

  async presentModal() {
    const modal = await this.modalController.create({
      component: UserProfileModalPage
    });

    modal.onDidDismiss().then((dataReturned) => {
      console.log('dismissed');
    });

    return await modal.present();
  }

  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: UserProfilePopoverComponent,
      event: ev,
      translucent: true
    });
    return await popover.present();
  }


}
