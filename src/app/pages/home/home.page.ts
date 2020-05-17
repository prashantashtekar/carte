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
    private locationService: LocationService,
    private menu: MenuController, private diagnostic: Diagnostic
  ) {


  }

  ngOnInit() {
    // this.menu.enable(true);
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

  async ngAfterViewInit() {
    this.menu.enable(true);
    this.authService.user$.subscribe((user) => {
      if (user != null) {
        console.log('current user: ', user);
        this.userProfile = user;
        this.roleName = user.roleName;

        if (this.userProfile.roleName == 'CartUser') {
          
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
