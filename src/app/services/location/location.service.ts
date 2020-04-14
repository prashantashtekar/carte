import { Injectable } from '@angular/core';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';

import { Geolocation, GeolocationOptions, Geoposition, PositionError } from '@ionic-native/geolocation/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { ToastService } from '../toast/toast.service';
@Injectable({
  providedIn: 'root'
})
export class LocationService {
  options: GeolocationOptions;
  currentPos: Geoposition;
  subscription: any;
  locationCoords: any;
  apiResponse: any;
  constructor(private androidPermissions: AndroidPermissions,
    private geolocation: Geolocation,
    private locationAccuracy: LocationAccuracy,
    private diagnostic: Diagnostic, private toastService: ToastService,
  ) {
    this.locationCoords = {
      latitude: "",
      longitude: "",
      accuracy: "",
      timestamp: ""
    }
  }

  //To check whether Location Service is enabled or Not
  async locationStatus() {
    return new Promise((resolve, reject) => {
      this.diagnostic.isLocationEnabled().then((isEnabled) => {
        console.log(isEnabled);
        if (isEnabled === false) {
          resolve(false);
        } else if (isEnabled === true) {
          resolve(true);
        }
      })
        .catch((e) => {
          // this.showToast('Please turn on Location');
          reject(false);
        });
    });
  }
  async checkLocationEnabled() {
    return new Promise((resolve, reject) => {
      this.diagnostic.isLocationEnabled().then((isEnabled) => {
        console.log(isEnabled);
        if (isEnabled === false) {

          this.toastService.present({
            message: "Please turn on Location Service",
            duration: 3000,
            color: "secondary"
          });

          resolve(false);
        } else if (isEnabled === true) {
          this.checkGPSPermission().then((response) => {
            console.log(response, 'checkGPSPermission-checkLocationEnabled');
            this.apiResponse = response;
            if (this.apiResponse === false) {
              reject(false);
            } else {
              resolve(this.apiResponse);
            }
          })
            .catch((e) => {
              console.log(e, 'checkGPSPermission-checkLocationEnabled');
              reject(false);
            });
        }
      })
        .catch((e) => {
          this.toastService.present({
            message: "Please turn on Location Service",
            duration: 3000,
            color: "secondary"
          });
          reject(false);
        });
    });
  }
  //Check if application having GPS access permission
  async checkGPSPermission() {
    return new Promise((resolve, reject) => {
      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then(
        result => {
          console.log(result.hasPermission);
          if (result.hasPermission) {
            console.log('hasPermission-YES');
            //If having permission show 'Turn On GPS' dialogue
            this.askToTurnOnGPS().then((response) => {
              console.log(response, 'askToTurnOnGPS-checkGPSPermission');
              if (this.apiResponse === false) {
                reject(this.apiResponse);
              } else {
                resolve(this.apiResponse);
              }
            });
          } else {
            console.log('hasPermission-NO');
            //If not having permission ask for permission
            this.requestGPSPermission().then((response) => {
              console.log(response, 'requestGPSPermission-checkGPSPermission');
              this.apiResponse = response;
              if (this.apiResponse === false) {
                reject(this.apiResponse);
              } else {
                resolve(this.apiResponse);
              }
            });
          }
        },
        err => {
          alert(err);
          reject(false);
        });
    });
  }
  async requestGPSPermission() {
    return new Promise((resolve, reject) => {
      this.locationAccuracy.canRequest().then((canRequest: boolean) => {
        if (canRequest) {
          console.log("4");
        } else {
          //Show 'GPS Permission Request' dialogue
          this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then(() => {
            // call method to turn on GPS
            this.askToTurnOnGPS().then((response) => {
              console.log(response, 'askToTurnOnGPS-requestGPSPermission');
              this.apiResponse = response;
              if (this.apiResponse === false) {
                reject(this.apiResponse);
              } else {
                resolve(this.apiResponse);
              }
            });
          },
            error => {
              //Show alert if user click on 'No Thanks'
              alert('requestPermission Error requesting location permissions ' + error);
              reject(false);
            });
        }
      });
    });
  }
  async askToTurnOnGPS() {
    return new Promise((resolve, reject) => {
      this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then((resp) => {
        console.log(resp, 'location accuracy');
        // When GPS Turned ON call method to get Accurate location coordinates
        if (resp['code'] === 0) {
          resolve(this.apiResponse);
          this.getLocationCoordinates().then((cords) => {
            console.log(cords, 'coords');
            this.apiResponse = cords;
            if (this.apiResponse === false) {
              reject(false);
            } else {
              resolve(this.apiResponse);
            }
          });
        }
        error => {
          alert('Error requesting location permissions');
          reject(false);
        }
      });
    });
  }

  getLocationCoordinates() {
    return new Promise((resolve, reject) => {
      this.options = {
        maximumAge: 3000,
        enableHighAccuracy: true
      };

      this.geolocation.getCurrentPosition(this.options).then((resp: Geoposition) => {
        this.currentPos = resp;
        const location = {
          lat: resp.coords.latitude,
          lng: resp.coords.longitude,
          time: new Date(),
        };
        console.log('loc', location);

        this.locationCoords.latitude = resp.coords.latitude;
        this.locationCoords.longitude = resp.coords.longitude;
        this.locationCoords.accuracy = resp.coords.accuracy;
        this.locationCoords.timestamp = resp.timestamp;
        console.log(resp, 'get locc');

        resolve(resp);
      }, (err: PositionError) => {
        console.log("error : " + err.message);
        reject(err.message);
      });
    });
  }
}
