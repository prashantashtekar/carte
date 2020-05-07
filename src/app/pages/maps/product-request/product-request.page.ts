import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NavParams } from '@ionic/angular';
import { Product } from '../../products/model/product.model';
import { User } from 'src/app/interfaces/user';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CustomerRequest } from '../../customer-request/model/customer-request.model';
import { CustomerRequestService } from '../../customer-request/services/customer-request.service';
import { AlertService } from 'src/app/services/alert/alert.service';

@Component({
  selector: 'app-product-request',
  templateUrl: './product-request.page.html',
  styleUrls: ['./product-request.page.scss'],
})
export class ProductRequestPage implements OnInit {
  products : Product[];
  user: User;
  userProfile: User = null;
  customerRequestList: CustomerRequest[] = [];
  message:"";
  selectedOptions: any = [];
  buttonDisabled : boolean = false;
  oldMessages: string = '';
  sendButtonName: string = 'Send';
  mode: string = 'ADD';

  constructor(
    public viewCtrl: ModalController,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private alertService: AlertService,
    private authService: AuthService,
    private customerRequestService: CustomerRequestService,
    navParams: NavParams) { 
      this.products = navParams.get('products');
      this.user = navParams.get('user');
      this.customerRequestList = navParams.get('customerRequests');
      
      let exists = this.customerRequestList.find(x=>x.cartUserId == this.user.uid && (x.status == 'SUBMITTED' || x.status == 'PENDING'));
      if(exists && exists.status != 'REJECTED') {
        this.mode = 'EDIT';
        this.sendButtonName = 'Update';
        this.selectedOptions = exists.selectedOptions;
        this.message = '';
        
        exists.messages.forEach(element => {
          if(element.from == 'CUSTOMER') {
            this.oldMessages += '<b>You:</b> ' + element.message + '<br>';
          } else {
            this.oldMessages += '<b>Cartist:</b> ' + element.message + '<br>';
          }
        });
        if(this.oldMessages.length > 0 ){
          this.oldMessages = '<b class="secondary">Messages:</b><br>' + this.oldMessages;
        }
      } else if(exists && exists.status == 'REJECTED') {
        this.mode ='ADD';
        this.sendButtonName = 'Send';
        //show 
        this.alertService.present({
          header: "Request rejected",
          message: 'Sorry! Your previous request was rejected by catist. Please try sending new request.',
          buttons: ["OK"]
        });
      } else {
        this.mode ='ADD';
        this.sendButtonName = 'Send';
      }
    }

  ngOnInit() {
  }

  async ngAfterViewInit() {
    this.authService.user$.subscribe((user) => {
       this.userProfile = user;
     });
  }

  selectOption(product : Product) {
    if(product.isOutOfStock) {
      return;
    }
    if(this.selectedOptions.includes(product.name)) {
      this.selectedOptions.pop(product.name);  
    } else {
      this.selectedOptions.push(product.name);
    }
  }

  getClassName(productName) {
    if(this.selectedOptions.includes(productName)){
      return 'card-background-selected sc-ion-card-md-h sc-ion-card-md-s md hydrated';
    }
    return 'card-background-unselected sc-ion-card-md-h sc-ion-card-md-s md hydrated';
  }

  closeModal() {
    this.viewCtrl.dismiss({data: 'test'});
  }

  //send request to cart owner
  sendRequest() {
    if(this.userProfile.phoneNumber == undefined) {
      this.userProfile.phoneNumber = '';
    }
    if(this.userProfile.firstName == undefined) {
      this.userProfile.firstName = '';
    }  
    if(this.userProfile.lastName == undefined) {
      this.userProfile.lastName = '';
    }
    if(this.message == undefined) {
      this.message = '';
    }
    if(this.mode == 'EDIT') {
      let exists = this.customerRequestList.find(x=>x.cartUserId == this.user.uid  && (x.status == 'SUBMITTED' || x.status == 'PENDING'));
      exists.messages.push({
        from: "CUSTOMER",
        message: this.message,
        dateTime: new Date()
      });
      this.customerRequestService.updateRequestDocumentInFirebase(exists);
      this.requestUpdated();
    } else {
      this.showProcessing();
      const newRequest: CustomerRequest = {
        id: '',
        cartUserId: this.user.uid,
        customerId: this.userProfile.uid,
        customerLatitude: this.userProfile.latitude,
        customerLongitude: this.userProfile.longitude,
        customerName: this.userProfile.firstName + ' ' + this.userProfile.lastName,
        customerPhoneNumber:  this.userProfile.phoneNumber,
        dateRequested: new Date().toDateString(),
        status: 'REQUESTED',
        selectedOptions: this.selectedOptions,
        messages: [{
          from: "CUSTOMER",
          message: this.message,
          dateTime: new Date()
        }]
      };
      
      this.customerRequestService
          .addRequest(newRequest)
          .then(() => {
            this.requestSuccess();
            this.sendNotification();
      })
      .catch(error => {
            this.requestFailed(error);
      });
    }
  }

    //show processing 
    showProcessing() {
      this.loadingService.present({
        message: "Saving. . ."
      });
    }
  
    //hide processing
    hideProcessing() {
      this.loadingService.dismiss();
    }

  //request sent success
  requestSuccess() {
    this.hideProcessing();
    this.toastService.present({
      message: "Request sent sucessfully!",
      duration: 3000,
      color: "success"
    });
    this.closeModal();
  }

  //send notification
  sendNotification(){
//     // This registration token comes from the client FCM SDKs.
// var registrationToken = 'YOUR_REGISTRATION_TOKEN';

// var message = {
//   data: {
//     score: '850',
//     time: '2:45'
//   },
//   token: registrationToken
// };

// // Send a message to the device corresponding to the provided
// // registration token.
// admin.messaging().send(message)
//   .then((response) => {
//     // Response is a message ID string.
//     console.log('Successfully sent message:', response);
//   })
//   .catch((error) => {
//     console.log('Error sending message:', error);
//   });

  }

  //request updated success
  requestUpdated() {
    this.toastService.present({
      message: "Request updated sucessfully!",
      duration: 3000,
      color: "success"
    });
    this.closeModal();
  }

  //request sent failure
  requestFailed(error: any) {
    this.hideProcessing();
    this.alertService.present({
      header: "Error! Request not sent!",
      message: error.message,
      buttons: ["OK"]
    });
  }
}
