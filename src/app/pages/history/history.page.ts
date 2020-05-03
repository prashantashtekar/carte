import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import { CustomerRequest } from '../customer-request/model/customer-request.model';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CustomerRequestService } from '../customer-request/services/customer-request.service';
import { AlertService } from 'src/app/services/alert/alert.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit {
  userProfile: User = null;
  requests: CustomerRequest[] = [];
  
  constructor(private authService: AuthService,
    private alertService: AlertService,
    private customerRequestService: CustomerRequestService) { }

  ngOnInit() {

  }

  async ngAfterViewInit() {
    this.authService.user$.subscribe((user) => {
       this.userProfile = user;
       this.getRequestByUserId();
     });
  }

  getRequestByUserId() {
    this.customerRequestService.getRequestsByUser(this.userProfile.uid).subscribe((requests) => {
      this.requests = requests;
    });
  }

  getStatusClass(status: string) {
    let className = 'success';
    if(status == 'REJECTED') {
      className = 'danger';
    } else if (status = 'ACCEPTED') {
      className = 'secondary';
    } else if (status = 'PENDING') {
      className = 'warning';
    } 
    return className;
  }

  showProducts(request: CustomerRequest) {
    this.alertService.present({
      header: 'Products selected:',
      subHeader: request.selectedOptions.toString(),
      buttons: ['OK']
    });
  }
  
  showMessages(request: CustomerRequest) {
    let oldMessages = '';
    request.messages.forEach(element => {
      if(element.from == 'CUSTOMER') {
        oldMessages += '<b>You:</b> ' + element.message + '<br>';
      } else {
        oldMessages += '<b>Cartist:</b> ' + element.message + '<br>';
      }
    });
    this.alertService.present({
      header: 'Messages:',
      message: oldMessages,
      buttons: ['OK']
    });
  }

}
