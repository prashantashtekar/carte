import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import { CustomerRequest } from '../customer-request/model/customer-request.model';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CustomerRequestService } from '../customer-request/services/customer-request.service';
import { AlertService } from 'src/app/services/alert/alert.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CallNumber } from '@ionic-native/call-number/ngx';


@Component({
  selector: 'app-customer-request',
  templateUrl: './customer-request.page.html',
  styleUrls: ['./customer-request.page.scss'],
})
export class CustomerRequestPage implements OnInit {
  userProfile: User = null;
  requests: CustomerRequest[] = [];

  constructor(private authService: AuthService,
    private alertService: AlertService,
    private toastService: ToastService,
    private callNumber: CallNumber,
    private customerRequestService: CustomerRequestService) { }

  ngOnInit() {
  }

  async ngAfterViewInit() {
    this.authService.user$.subscribe((user) => {
       this.userProfile = user;
       this.getRequestByCartUserId();
     });
  }

  //get request by cart user id
  getRequestByCartUserId() {
    this.customerRequestService.getRequestsByCartUser(this.userProfile.uid).subscribe((requests) => {
      this.requests = requests;
    });
  }

  //get status class
  getStatusClass(status: string) {
    let className = 'success';
    if(status == 'REJECTED') {
      className = 'danger';
    } else if (status == 'ACCEPTED') {
      className = 'secondary';
    } else if (status == 'PENDING') {
      className = 'warning';
    } 
    return className;
  }

  //show products in request
  showProducts(request: CustomerRequest) {
    this.alertService.present({
      header: 'Products selected:',
      subHeader: request.selectedOptions.toString(),
      buttons: [{
        text: 'CLOSE',
        role: 'cancel',
        cssClass:'alert-button-group',
        handler: (data) => {
          
        }
      },]
    });
  }
  
  //show messages between customer and cartist
  showMessages(request: CustomerRequest) {
    let oldMessages = '';
    let isThereMessage = false;
    request.messages.forEach(element => {
      if(element.from == 'CUSTOMER') {
        isThereMessage = true;
        oldMessages += '<b>Customer:</b> ' + element.message + '<br>';
      } else {
        isThereMessage = true;
        oldMessages += '<b>You:</b> ' + element.message + '<br>';
      }
    });
    if(isThereMessage){
      this.alertService.present({
        header: 'Messages:',
        message: oldMessages,
        buttons: ['OK']
      });
    } else {
      this.alertService.present({
        header: 'No messages found!',
        buttons: ['OK']
      });
    }
  }

  //make call
  makeCall(request: CustomerRequest) {
    if(request.customerPhoneNumber == '') {
      this.toastService.present({
        message: "Phone number not found!",
        duration: 3000,
        color: "danger"
      });
      return;
    }
    this.callNumber.callNumber(request.customerPhoneNumber, true)
      .then(res => console.log('Launched dialer!', res))
      .catch(err => this.errorDialing());
  }

  private errorDialing() {
    this.toastService.present({
      message: "Error occurred while launching dialer, Please try again!",
      duration: 3000,
      color: "danger"
    });
  }

}
