import { Component, OnInit, ViewChild } from '@angular/core';
// import * as firebase from 'firebase';
import { AlertController, NavController, LoadingController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/auth';
//import {FirebaseX} from '@ionic-native/firebase-x';
import { FirebaseAuthentication } from '@ionic-native/firebase-authentication/ngx';
import * as firebase from 'firebase/app';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
    selector: 'app-login-phone',
    templateUrl: './login-phone.page.html',
    styleUrls: ['./login-phone.page.scss'],
})
export class LoginPhonePage implements OnInit {

    private authSub: Subscription;
    verificationId:string = '';
    code:string = '';
    private uid: any;
    showCodeInput = false;
    private isDisabled: boolean = false;
    private phoneNumber: any;
    private phone: string;
    selectedCode = '+91'
    @ViewChild('select1', { static: true }) select1: any;
    constructor(public navCtrl: NavController,
        private fireBase: FirebaseAuthentication,
        private alertCtrl: AlertController,
        private afs: AngularFireAuth,
        private loading: LoadingController,
        private authService: AuthService,
        private router: Router) { }
    ngOnInit() {

        // this.authSub = this.fireAuth.authState.subscribe((user: firebase.User) => {
        //     console.log('LoginPage user', user);
        //     if (user) {
        //       this.doLogin();
        //     }
        //   });
    }

    ngOnDestroy() {
        this.authSub.unsubscribe();
      }

    ViewDidLoad() {
        this.afs.authState.subscribe(res => {
            if (res && res.uid) {
                this.uid = res.uid;
                this.router.navigate(["/home"]);
            } else {
            }
        })
    }

    async PhoneLoginNative() {
        console.log(this.selectedCode + this.phoneNumber)
        if (this.phoneNumber) {
            const loader = await this.loading.create({
                message: "Sending code",
                duration: 10000
            });
            loader.present()
            this.phone = this.selectedCode + this.phoneNumber;
            this.fireBase.verifyPhoneNumber(this.phone, 60)
                .then((credential) => {
                    //this.verificationId = credential.verificationId; /**  FOR ANDROID    **/
                    this.verificationId = credential; /**  FOR IOS **/
                    loader.dismiss()
                    this.isDisabled = true
                    this.showCodeInput = true;
                }).catch((error) => {
                    this.presentAlert(error)
                    loader.dismiss()
                    console.error(error)
                });
        }
        else this.presentAlert("Phone Number Cannot Be Empty")
    }



    async verify() {
        console.log(this.code);
        if (this.code) {
            const loader = await this.loading.create({
                message: "Verifying",
                duration: 10000
            });
            loader.present()
            let signInCredential = await firebase.auth.PhoneAuthProvider.credential(this.verificationId, this.code.toString());
            this.afs.auth.signInAndRetrieveDataWithCredential(signInCredential).then((success) => {
                console.log("iddd" + success.user.uid);
                //On verification success get user details
                let userDetails = this.authService.userDetails();
                //TODO: REdirect user to profile page if no user info is found.
                this.authService.checkUserExist(userDetails.uid, userDetails.phoneNumber);
                loader.dismiss();
                this.goToLogin(success.user.uid)
            }).then().catch(er => {
                this.presentAlert(er.message)
                loader.dismiss()
            }
            )
        }

        else {
            this.presentAlert("Please enter a valid code");
        }
    }


    async presentAlert(id) {
        let alert = await this.alertCtrl.create({
            message: id,
            buttons: ['Dismiss'],
        });
        alert.present();
    }


    async alertResend() {
        let alert = await this.alertCtrl.create({
            message: 'Resend Code',
            buttons: [{
                text: 'Cancel',
                role: 'cancel',
            },
            {
                text: 'Okay', handler: data => {
                    this.PhoneLoginNative();
                }
            }],

        });
        alert.present();
    }

    goToLogin(uid) {
        console.log("Go to login");
        // this.navCtrl.navigateRoot('home',{
        //     uid:uid,
        //     phone:this.phoneNumber
        // });
        this.router.navigate(["/home"]);

    }

    resendCode() {
        this.alertResend();
    }

    reEnter() {
        //Refresh the page
        console.log("reenter");
        // this.navCtrl.navigateRoot(this.navCtrl.getActive().component);

    }

}
