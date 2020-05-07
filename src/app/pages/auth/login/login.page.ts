import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import {
  FormBuilder,
  FormGroup,
  Validators
} from "@angular/forms";

import { AuthService } from "../../../services/auth/auth.service";
import { ToastService } from "../../../services/toast/toast.service";
import { LoadingService } from "../../../services/loading/loading.service";
import { AlertService } from '../../../services/alert/alert.service';
import { environment } from 'src/environments/environment';
import { Platform, MenuController } from '@ionic/angular';
import * as firebase from 'firebase';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.scss"]
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  loggedIn: boolean;
  validation_messages = {
    email: [
      { type: "required", message: "Email address is required." },
      { type: "email", message: "The format of the email address invalid." }
    ],
    password: [{ type: "required", message: "Password is required." }]
  };


  constructor(
    public formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private alertService: AlertService,
    private platform: Platform,
    private googlePlus: GooglePlus,
    private nativeStorage: NativeStorage,
    public afAuth: AngularFireAuth,
    private menu: MenuController,

  ) { }

  ngOnInit() {
    this.menu.enable(false);
    this.loginForm = this.formBuilder.group({
      email: ["", Validators.compose([Validators.required, Validators.email])],
      password: ["", Validators.required]
    });
  }

  routeToRegisterPage() {
    this.resetLoginForm();
    this.router.navigateByUrl("/register");
  }

  routeToForgotPasswordPage() {
    this.resetLoginForm();
    this.router.navigateByUrl("/forgot-password");
  }

  loginWithEmail() {
    let email: string = this.loginForm.get("email").value;
    let password: string = this.loginForm.get("password").value;

    this.loginPocessing();

    this.authService
      .loginWithEmail(email, password)
      .then((res) => {
        if (res.user) {  
          this.authService.setUser(res.user.uid);       
          this.router.navigateByUrl("/home");
        }
        this.resetLoginForm();
        this.loginSuccess();
      })
      .catch(error => {
        console.log(error);
        this.loginFailed(error);
      });
  }

  loginPocessing() {
    this.loadingService.present({
      message: "Logging in . . ."
    });
  }

  loginSuccess() {
    this.loadingService.dismiss();

    this.toastService.present({
      message: "Welcome back!",
      duration: 3000,
      color: "secondary"
    });
  }

  loginFailed(error: any) {
    this.loadingService.dismiss();

    this.alertService.present({
      header: 'Login Error',
      subHeader: error.code,
      message: error.message,
      buttons: ['OK']
    });
  }

  resetLoginForm() {
    this.loginForm.get("email").setValue("");
    this.loginForm.get("password").setValue("");
    this.loginForm.reset(this.loginForm.value);
    this.loginForm.markAsPristine();
  }

  async doGoogleLogin() {
    let params;
    if (this.platform.is('android')) {
      params = {
        'webClientId': '254193771768-5qrg5d1caamjn33gosa0pj2g8lto6c54.apps.googleusercontent.com',
        'offline': true
      }
    }
    else {
      params = {}
    }
    this.googlePlus.login(params)
      .then((response) => {
        const { idToken, accessToken } = response
        this.onLoginSuccess(idToken, accessToken);
      }).catch((error) => {
        console.log(error)
        alert('error:' + JSON.stringify(error))
      });
  }
  onLoginSuccess(accessToken, accessSecret) {
    const credential = accessSecret ? firebase.auth.GoogleAuthProvider
      .credential(accessToken, accessSecret) : firebase.auth.GoogleAuthProvider
        .credential(accessToken);
    //Check if user exists and if not then create new user
    //this.authService.createNewUserDocumentInFirebase(email, credential.user)  

    this.afAuth.auth.signInWithCredential(credential)
      .then((response) => {

        let userDetails = this.authService.userDetails();

        this.authService.checkUserExist(userDetails.uid, userDetails.email);


        this.router.navigate(["/home"]);
        this.loadingService.dismiss();
      })

  }
  onLoginError(err) {
    console.log(err);
  }

}
