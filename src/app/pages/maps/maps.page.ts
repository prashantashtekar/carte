import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ModalController, PopoverController, NavController, MenuController } from '@ionic/angular';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { AlertService } from 'src/app/services/alert/alert.service';
import { LocationService } from 'src/app/services/location/location.service';
import { Geoposition } from '@ionic-native/geolocation/ngx';
import { User } from 'firebase';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
})
export class MapsPage implements OnInit {
  public userEmail: string = "";
  locationCoords: any;
  timetest: any;
  currentPos: Geoposition;

  userProfile: User = null;
  constructor(private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private modalController: ModalController,
    public popoverController: PopoverController,
    private navCtrl: NavController,
    private loadingService: LoadingService,
    private alertService: AlertService,
    private locationService: LocationService,
    private menu: MenuController, ) {
    this.locationCoords = {
      latitude: "",
      longitude: "",
      accuracy: "",
      timestamp: ""
    }
    this.timetest = Date.now();
  }

  ngOnInit() {
    this.menu.enable(true);
    this.authService.user$.subscribe((user) => {
     console.log('current user: ', user);
      this.userProfile = user;
      this.userEmail = this.userProfile.email;
    });
  }

}
