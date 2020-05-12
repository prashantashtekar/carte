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
import { MapsPage } from '../maps/maps.page';
import { ProductsPage } from '../products/products.page';

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"]
})
export class HomePage implements OnInit {

  userProfile: User = null;
  roleName: string = ""
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private modalController: ModalController,
    public popoverController: PopoverController,
    private navCtrl: NavController,
    private loadingService: LoadingService,
    private alertService: AlertService,
    private locationService: LocationService,
    private menu: MenuController,
  ) {


  }

  ngOnInit() {
    this.menu.enable(true);
    //this.router.navigate(["home/map"]);
    this.authService.user$.subscribe((user) => {
      console.log('current user: ', user);
      this.userProfile = user;
      this.roleName = user.roleName;

    });


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



  // navigateToProfile() {
  //   this.router.navigateByUrl("/user-profile");
  // }  

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
