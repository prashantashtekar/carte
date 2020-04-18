import { Component, Inject, ElementRef, ViewChild, AfterViewInit, NgZone, OnInit  } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DOCUMENT } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastService } from 'src/app/services/toast/toast.service';
import { darkStyle } from './map-dark-style';
import { ModalController, PopoverController, NavController, MenuController } from '@ionic/angular';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { AlertService } from 'src/app/services/alert/alert.service';
import { LocationService } from 'src/app/services/location/location.service';
import { AdminService } from 'src/app/services/admin/admin.service';
import { Geoposition } from '@ionic-native/geolocation/ngx';
import { User } from 'src/app/interfaces/user';
import { ProductsService } from '../products/services/products.service';
import { Product } from '../products/model/product.model';
import { CustomerRequest } from '../customer-request/model/customer-request.model';
import { CustomerRequestService } from '../customer-request/services/customer-request.service';
import { analytics } from 'firebase';


//TODO: check if this is required
declare var google: any;

@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
})
export class MapsPage implements AfterViewInit {
  @ViewChild('mapCanvas', { static: true }) mapElement: ElementRef;
  public userEmail: string = "";
  locationCoords: any;
  timetest: any;
  currentPos: Geoposition;
  userProfile: User = null;
  cartUsersList: User[] = []; // cart users 
  customerRequestList: CustomerRequest[] = [];
  buttonDisabled: boolean = true;
  currentMarker: any;
  constructor(
    @Inject(DOCUMENT) private doc: Document,
    private authService: AuthService,    
    public adminServices: AdminService,
    public popoverController: PopoverController,
    private loadingService: LoadingService,
    private customerRequestService: CustomerRequestService,
    private toastService: ToastService,
    private router: Router,
    public productService: ProductsService,
    private alertService: AlertService,
    public _ngZone: NgZone) {
    this.locationCoords = {
      latitude: "",
      longitude: "",
      accuracy: "",
      timestamp: ""
    };
  }

  async ngAfterViewInit() {
    this.authService.user$.subscribe((user) => {
       this.userProfile = user;
       this.userEmail = this.userProfile.email;
       this.getRequestByUserId();
       this.loadMap();
     });

  }
  //load map
  async loadMap() {
    //get style applied to app
    const appEl = this.doc.querySelector('ion-app');
    let isDark = false;
    let style = [];
    //
    window["angularComponentRef"] = { component: this, zone: this._ngZone };

    //set dark style
    if (appEl.classList.contains('dark-theme')) {
      style = darkStyle;
      isDark = true;
    }

    //map key
    const googleMaps = await getGoogleMaps(
      'AIzaSyBE1V_2_s373320iJCS7Tr1vq6r6o-us_Y'
    );

    //draw map on basis of roles
    let map;
    if(this.userProfile.roleName == 'Customer') {
      this.adminServices.getCartUsers().subscribe((res) => {
        this.cartUsersList = res;      
        
        const mapEle = this.mapElement.nativeElement;
        //get logged in users location as center of map
        let center = { lat: +this.userProfile.latitude, lng: +this.userProfile.longitude};
        map = new googleMaps.Map(mapEle, {
          center: center,
          zoom: 16,
          styles: darkStyle,
        });
        //draw 5 km circle, radius in meter
        var cityCircle = new googleMaps.Circle({
          strokeColor: '#309611',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#77FF5C',
          fillOpacity: 0.35,
          map: map,
          center: center,
          radius: 1000
        });
        
        //customer marker
        const iconCustomer = {
          url: 'assets/imgs/customer_location.png', // image url
          scaledSize: new google.maps.Size(40, 40), // scaled size
        };
        //customer marker
        const markerCustomer = new googleMaps.Marker({
          position: {lat: +this.userProfile.latitude, lng: +this.userProfile.longitude},
          map,
          title: this.userProfile.firstName + ' ' + this.userProfile.lastName,
          icon: iconCustomer
        });

        this.cartUsersList.forEach((markerData: any) => {
          const infoWindow = new googleMaps.InfoWindow({
            content:''
          });
          this.productService.getProductsByUser(markerData.uid).subscribe((products) => {
            
            // icon 
            const iconCart = {
              url: 'assets/imgs/cart.png', // image url
              scaledSize: new google.maps.Size(50, 50), // scaled size
            };
            const marker = new googleMaps.Marker({
              position: { lat: +markerData.latitude, lng: +markerData.longitude},
              map,
              title: markerData.name,
              icon: iconCart
            });
  
            let infoContent: string = '<h6>' + markerData.firstName + ' ' + markerData.lastName  + '</h6>'
            infoContent = infoContent +'<b><ion-label color="primary">Todays Products:</ion-label></b>'
            infoContent = infoContent +'<br><b>'
            products.forEach((product: Product)=>{
              infoContent = infoContent + product.name  +'  ('+ product.price +'  ₹) <br>'
            });
            infoContent = infoContent +'</b>'
            infoContent = infoContent +'<ion-button size="small" color="success" onclick="window.angularComponentRef.zone.run(() => {window.angularComponentRef.component.addRequest(\''+ markerData.uid + '\');})">Add Request</ion-button>';

            //1km logic here
            if(markerData != center) {
              marker.addListener('click', () => {
                let distanceInKM = this.getDistanceFromLatLonInKm(center.lat, center.lng, marker.position.lat(), marker.position.lng());
                if(distanceInKM <= 5) {
                  infoWindow.setContent(infoContent);  
                  infoWindow.open(map, marker);                  
                } else {
                  this.toastService.present({
                    message: "Sorry, too long distance can't receive your request!",
                    duration: 3000,
                    color: "primary"
                  });
                }
              });
            }   
          });
        });
  
        googleMaps.event.addListenerOnce(map, 'idle', () => {
          mapEle.classList.add('show-map');
        });
      });// get cart users api ends
    } else if(this.userProfile.roleName == 'CartUser') {
      this.customerRequestService.getRequestsByCartUser(this.userProfile.uid).subscribe((res) => {
        this.customerRequestList = res;      
        const mapEle = this.mapElement.nativeElement;
        //get logged in users location as center of map
        let center = { lat: +this.userProfile.latitude, lng: +this.userProfile.longitude};
        map = new googleMaps.Map(mapEle, {
          center: center,
          zoom: 16,
          styles: darkStyle,
        });
        
        //customer marker
        const iconCustomer = {
          url: 'assets/imgs/cart.png', // image url
          scaledSize: new google.maps.Size(40, 40), // scaled size
        };
        //customer marker
        const markerCustomer = new googleMaps.Marker({
          position: {lat: +this.userProfile.latitude, lng: +this.userProfile.longitude},
          map,
          title: this.userProfile.firstName + ' ' + this.userProfile.lastName,
          icon: iconCustomer
        });

        this.customerRequestList.forEach((markerData: any) => {
          const infoWindow = new googleMaps.InfoWindow({
            content:''
          }); 
          
            let infoContent: string = '<h6><ion-label color="primary">' + markerData.customerName + '</ion-label></h6>'
            infoContent = infoContent +'<b> ' + markerData.phoneNumber +'</b>'
                    
          // icon 
          const iconCart = {
            url: 'assets/imgs/customer_location.png', // image url
            scaledSize: new google.maps.Size(50, 50), // scaled size
          };
          const marker = new googleMaps.Marker({
            position: { lat: +markerData.customerLatitude, lng: +markerData.customerLongitude},
            map,
            title: markerData.name,
            icon: iconCart
          });
  
          //1km logic here
          if(markerData != center) {
              marker.addListener('click', () => {
                  infoWindow.setContent(infoContent);  
                  infoWindow.open(map, marker);
              });
            }   
          
        });
  
        googleMaps.event.addListenerOnce(map, 'idle', () => {
          mapEle.classList.add('show-map');
        });
      });// get cart users api ends
    } else {
      this.adminServices.getCartUsers().subscribe((res) => {
        this.cartUsersList = res;      
        
        const mapEle = this.mapElement.nativeElement;
        //get logged in users location as center of map
        let center = { lat: +this.userProfile.latitude, lng: +this.userProfile.longitude};
        map = new googleMaps.Map(mapEle, {
          center: center,
          zoom: 16,
          styles: darkStyle,
        });
        
        //customer marker
        const iconCustomer = {
          url: 'assets/imgs/customer_location.png', // image url
          scaledSize: new google.maps.Size(40, 40), // scaled size
        };
        //customer marker
        const markerCustomer = new googleMaps.Marker({
          position: {lat: +this.userProfile.latitude, lng: +this.userProfile.longitude},
          map,
          title: this.userProfile.firstName + ' ' + this.userProfile.lastName,
          icon: iconCustomer
        });

        this.cartUsersList.forEach((markerData: any) => {
          const infoWindow = new googleMaps.InfoWindow({
            content:''
          }); 
          this.productService.getProductsByUser(markerData.uid).subscribe((products) => {
            let infoContent: string = '<h6>' + markerData.firstName + ' ' + markerData.lastName  + '</h6>'
            infoContent = infoContent +'<b><ion-label color="primary">Todays Products:</ion-label></b>'
            infoContent = infoContent +'<br><b>'
          products.forEach((product: Product)=>{
            infoContent = infoContent + product.name  +'  ('+ product.price +'  ₹) <br>'
          });
          infoContent = infoContent +'</b>'
          
          // icon 
          const iconCart = {
            url: 'assets/imgs/cart.png', // image url
            scaledSize: new google.maps.Size(50, 50), // scaled size
          };
          const marker = new googleMaps.Marker({
            position: { lat: +markerData.latitude, lng: +markerData.longitude},
            map,
            title: markerData.name,
            icon: iconCart
          });
  
          //1km logic here
          if(markerData != center) {
              marker.addListener('click', () => {
                  infoWindow.setContent(infoContent);  
                  infoWindow.open(map, marker);
              });
            }   
          });
        });
  
        googleMaps.event.addListenerOnce(map, 'idle', () => {
          mapEle.classList.add('show-map');
        });
      });// get cart users api ends
    }
  }

  //add request
  addRequest(cartUserId) {
    let exists = this.customerRequestList.find(x=>x.cartUserId == cartUserId);
    if(exists) {
      this.toastService.present({
        message: "Request already sent!",
        duration: 3000,
        color: "danger"
      });
      return;
    }
    this.showProcessing();
    
    if(this.userProfile.phoneNumber == undefined) {
      this.userProfile.phoneNumber = '';
    }
    if(this.userProfile.firstName == undefined) {
      this.userProfile.firstName = '';
    }  
    if(this.userProfile.lastName == undefined) {
      this.userProfile.lastName = '';
    }

    const newRequest: CustomerRequest = {
      id: '',
      cartUserId: cartUserId,
      customerId: this.userProfile.uid,
      customerLatitude: this.userProfile.latitude,
      customerLongitude: this.userProfile.longitude,
      customerName: this.userProfile.firstName + ' ' + this.userProfile.lastName,
      customerPhoneNumber:  this.userProfile.phoneNumber,
      dateRequested: new Date().toDateString(),
      status: 'REQUESTED'
    };
    
    this.customerRequestService
        .addRequest(newRequest)
        .then(() => {
          this.requestSuccess();
          this.getRequestByUserId();        
    })
    .catch(error => {
          this.requestFailed(error);
    });
  }

  getRequestByUserId() {
    this.customerRequestService.getRequestsByUser(this.userProfile.uid).subscribe((requests) => {
      this.customerRequestList = requests;
    });
  }

  //show processing 
  showProcessing() {
    this.loadingService.present({
      message: "Saving. . ."
    });
  }

  //request sent success
  requestSuccess() {
    this.loadingService.dismiss();
    this.toastService.present({
      message: "Request sent sucessfully!",
      duration: 3000,
      color: "secondary"
    });
  }

  //request sent failure
  requestFailed(error: any) {
    this.loadingService.dismiss();
    this.alertService.present({
      header: "Error! Request not sent!",
      message: error.message,
      buttons: ["OK"]
    });
  }

  ngOnDestroy() {
    window["angularComponentRef"] = null;
  }

  getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = this.deg2rad(lat2-lat1);  // deg2rad below
    var dLon = this.deg2rad(lon2-lon1); 
    var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
  }

  deg2rad(deg) {
    return deg * (Math.PI/180)
  }
}

function getGoogleMaps(apiKey: string): Promise<any> {
  const win = window as any;
  const googleModule = win.google;
  if (googleModule && googleModule.maps) {
    return Promise.resolve(googleModule.maps);
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=3.31`;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    script.onload = () => {
      const googleModule2 = win.google;
      if (googleModule2 && googleModule2.maps) {
        resolve(googleModule2.maps);
      } else {
        reject('google maps not available');
      }
    };
  });
}