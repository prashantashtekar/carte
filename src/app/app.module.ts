import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { environment } from '../environments/environment';

import { UserProfileModalPageModule } from './pages/user-profile-modal/user-profile-modal.module';
import { UserProfilePopoverComponent } from './components/user-profile-popover/user-profile-popover.component';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';

import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { ProductRequestPageModule } from './pages/maps/product-request/product-request.module';
import { FirebaseAuthentication } from '@ionic-native/firebase-authentication/ngx';
import { FirebaseProvider } from 'src/mock.providers';
import { Network } from '@ionic-native/network/ngx';
import { NetworkService } from './services/network/network.service';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { CallNumber } from '@ionic-native/call-number/ngx';

@NgModule({
  declarations: [AppComponent, UserProfilePopoverComponent],
  entryComponents: [UserProfilePopoverComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFirestoreModule,
    UserProfileModalPageModule,
    ProductRequestPageModule,
    UserProfileModalPageModule,
    IonicStorageModule.forRoot(),
  ],
  providers: [
    StatusBar,
    SplashScreen,
    GooglePlus,
    NativeStorage,
    AndroidPermissions,
    FirebaseAuthentication,
    Network,
    NetworkService,
    LocationAccuracy,
    Diagnostic,
    FirebaseProvider,
    BluetoothSerial,
    BackgroundGeolocation,
    BackgroundMode,
    Geolocation, CallNumber,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
