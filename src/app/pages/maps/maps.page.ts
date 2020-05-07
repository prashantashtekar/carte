import { Component, Inject, ElementRef, ViewChild, AfterViewInit, NgZone, OnInit  } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DOCUMENT } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastService } from 'src/app/services/toast/toast.service';
import { darkStyle } from './map-dark-style';
import { ModalController, PopoverController, NavController, MenuController, IonSelect } from '@ionic/angular';
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
import { interval } from 'rxjs';
import { ProductRequestPage } from './product-request/product-request.page';





//TODO: check if this is required
declare var google: any;

@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
})
export class MapsPage implements AfterViewInit {
  @ViewChild('mapCanvas', { static: true }) mapElement: ElementRef;
  @ViewChild('mySelect',  { static: true }) selectRef: IonSelect;
  
  showList: boolean= false;
  selectedCartUserId: string = '';
  selectedOptions: any = [];
  customAlertOptions: any = {
    header: '',
    subHeader: '',
    message: '',
    translucent: true
  };
  products: any;

  selectedCustomer: CustomerRequest = null;

  public userEmail: string = "";
  locationCoords: any;
  timetest: any;
  currentPos: Geoposition;
  userProfile: User = null;
  cartUsersList: User[] = []; // cart users 
  customerRequestList: CustomerRequest[] = [];
  buttonDisabled: boolean = true;
  currentMarker: any;
  globalMarkerCart: any;
  myCartLocation = {
    lat: 0,
    lng:0,
  };

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
    public modalController: ModalController,
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
       //get requests added by logged in customer
       if(this.userProfile.roleName == 'Customer') {
        this.getRequestByUserId();
       }
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

            //nth km logic here
            if(markerData != center) {
              marker.addListener('click', () => {
                let distanceInKM = this.getDistanceFromLatLonInKm(center.lat, center.lng, marker.position.lat(), marker.position.lng());
                if(distanceInKM <= 2) {
                  //show send request modal
                  this.openModal(products, markerData);
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
      //load cart user map
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
        
        //cart marker
        const iconCart = {
          url: 'assets/imgs/cart.png', // image url
          scaledSize: new google.maps.Size(40, 40), // scaled size
        };
        //cart marker
        const markerCart = new googleMaps.Marker({
          position: {lat: +this.userProfile.latitude, lng: +this.userProfile.longitude},
          map,
          title: this.userProfile.firstName + ' ' + this.userProfile.lastName,
          icon: iconCart
        });
        this.globalMarkerCart = markerCart;
        
        //TODO: loation update logic, move
        // this.myCartLocation = {lat: +this.userProfile.latitude, lng: +this.userProfile.longitude};
        // let sub = interval(1000).subscribe((val) => { this.updateMarkerLocation(); });

        this.customerRequestList.forEach((markerData: any) => {
          //customer icon 
          const iconCustomer = {
            url: 'assets/imgs/customer_location.png', // image url
            scaledSize: new google.maps.Size(50, 50), // scaled size
          };
          const marker = new googleMaps.Marker({
            position: { lat: +markerData.customerLatitude, lng: +markerData.customerLongitude},
            map,
            title: markerData.name,
            icon: iconCustomer
          });
  
          //1km logic here
          if(markerData != center) {
              marker.addListener('click', () => {
                this.selectedCustomer = markerData;
                this.showRequest(markerData);
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
        
        //admin marker
        const iconAdmin = {
          url: 'assets/imgs/customer_location.png', // image url
          scaledSize: new google.maps.Size(40, 40), // scaled size
        };
        //admin marker
        const markerAdmin = new googleMaps.Marker({
          position: {lat: +this.userProfile.latitude, lng: +this.userProfile.longitude},
          map,
          title: this.userProfile.firstName + ' ' + this.userProfile.lastName,
          icon: iconAdmin
        });

        this.cartUsersList.forEach((markerData: any) => {
          //markerData means cartUser
          //TODO: get cart user todays coordinates
          var flightPlanCoordinates = [
            {lat: 37.772, lng: -122.214},
            {lat: 21.291, lng: -157.821},
            {lat: -18.142, lng: 178.431},
            {lat: -27.467, lng: 153.027}
          ];
          var flightPath = new google.maps.Polyline({
            path: flightPlanCoordinates,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2
          });
  
          flightPath.setMap(map);

          
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

  //get last customer message
  private getLastCustomerMessage(messages) {
    return messages.filter(e => e.from == 'CUSTOMER')
    .sort((a,b) => b.dateTime - a.dateTime);
  }

  //show request to cartist
  async showRequest(request: CustomerRequest) {
    let header = request.customerName;
    if(request.customerPhoneNumber != ''){
      header = header + ' ('+request.customerPhoneNumber+')';
    }
    let oldMessages = '<b class="secondary">Messages:</b><br>';
    request.messages.forEach(element => {
      if(element.from == 'CUSTOMER') {
        oldMessages += '<b>Customer:</b> ' + element.message + '<br>';
      } else {
        oldMessages += '<b>You:</b> ' + element.message + '<br>';
      }
    });
    let buttonArray: any;
    if(request.status == 'REQUESTED') {
      buttonArray = [{
        text: 'CLOSE',
        role:'cancel',
        cssClass:'alert-button-group',
        handler: (data) => {
          
        }
      },{
        text: 'REJECT',
        cssClass:'alert-button-group',
        handler: (data) => {
          this.selectedCustomer.messages.push({
            from: "CARTIST",
            message: data.inputMessage,
            dateTime: new Date()
          });
          this.rejectRequest();
      }
    }, {
      text: 'PENDING',
      cssClass:'alert-button-group',
      handler: (data) => {
        this.selectedCustomer.messages.push({
          from: "CARTIST",
          message: data.inputMessage,
          dateTime: new Date()
        });
        this.pendingRequest();
      }
    },{
      text: 'ACCEPT',
      cssClass:'alert-button-group',
      handler: (data) => {
        this.selectedCustomer.messages.push({
          from: "CARTIST",
          message: data.inputMessage,
          dateTime: new Date()
        });
        this.acceptRequest();
      }
    }
      ];
    } else if(request.status == 'PENDING') {
      buttonArray = [{
        text: 'CLOSE',
        cssClass:'alert-button-group',
        handler: (data) => {
          
        }
      },{
        text: 'REJECT',
        cssClass:'alert-button-group',
        handler: (data) => {
          this.selectedCustomer.messages.push({
            from: "CARTIST",
            message: data.inputMessage,
            dateTime: new Date()
          });
          this.rejectRequest();
        }
      },{
        text: 'ACCEPT',
        cssClass:'alert-button-group',
        handler: (data) => {
          this.selectedCustomer.messages.push({
            from: "CARTIST",
            message: data.inputMessage,
            dateTime: new Date()
          });
          this.acceptRequest();
        }
      }];
    } else {
      buttonArray = [{
        text: 'CLOSE',
        cssClass:'alert-button-group',
        handler: (data) => {
          
        }
      },{
        text: 'REJECT',
        cssClass:'alert-button-group',
        handler: (data) => {
          this.selectedCustomer.messages.push({
            from: "CARTIST",
            message: data.inputMessage,
            dateTime: new Date()
          });
          this.rejectRequest();
        }
      },{
        text: 'UPDATE',
        cssClass:'alert-button-group',
        handler: (data) => {
          this.selectedCustomer.messages.push({
            from: "CARTIST",
            message: data.inputMessage,
            dateTime: new Date()
          });
          this.updateRequest();
        }
      }];
    }
    this.alertService.present({
      header: header,
      subHeader: request.selectedOptions.toString(),
      message: oldMessages,
      cssClass: 'custom-alert',
      inputs: [
        {
          name: 'inputMessage',
          type: 'text',
          placeholder: 'Enter message here!'
        }
      ],
      buttons: buttonArray
  });
  }
  
  //open send request modal
  async openModal(products: Product[], markerData : User) {
    const modal = await this.modalController.create({
    component: ProductRequestPage,
    componentProps: { products: products, user : markerData, customerRequests: this.customerRequestList }
    });
    modal.onDidDismiss().then(data=>{
      console.log(data);
      })
    return await modal.present();
  }

  //update request
  private updateRequest() {
    this.customerRequestService.updateRequestDocumentInFirebase(this.selectedCustomer);
    this.toastService.present({
      message: "Request updated successfully!",
      duration: 3000,
      color: "success"
    });
  }

  //accept request
  private acceptRequest() {
    this.selectedCustomer.status = 'ACCEPTED';
    this.customerRequestService.updateRequestDocumentInFirebase(this.selectedCustomer);
    this.toastService.present({
      message: "Request accepted successfully!",
      duration: 3000,
      color: "success"
    });
  }

  //reject request
  private rejectRequest() {
    this.selectedCustomer.status = 'REJECTED';
    this.customerRequestService.updateRequestDocumentInFirebase(this.selectedCustomer);
    this.toastService.present({
      message: "Request rejected successfully!",
      duration: 3000,
      color: "warning"
    });
  }

  //pending request
  private pendingRequest() {
    this.selectedCustomer.status = 'PENDING';
    this.customerRequestService.updateRequestDocumentInFirebase(this.selectedCustomer);
    this.toastService.present({
      message: "Request set to Pending!",
      duration: 3000,
      color: "secondary"
    });
  }

  //get requests added by logged in customers 
  getRequestByUserId() {
    this.customerRequestService.getRequestsByUser(this.userProfile.uid).subscribe((requests) => {
      this.customerRequestList = requests;
    });
  }

  //update marker position on map
  updateMarkerLocation() {
    this.myCartLocation = {lat:this.myCartLocation.lat+0.0001, lng:this.myCartLocation.lng+0.0001 };
    this.globalMarkerCart.setPosition(this.myCartLocation);
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