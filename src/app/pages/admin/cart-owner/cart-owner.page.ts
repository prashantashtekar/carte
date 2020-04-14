import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import { LoadingController, AlertController } from '@ionic/angular';
import { AdminService } from 'src/app/services/admin/admin.service';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/services/toast/toast.service';

@Component({
  selector: 'app-cart-owner',
  templateUrl: './cart-owner.page.html',
  styleUrls: ['./cart-owner.page.scss'],
})
export class CartOwnerPage implements OnInit {
  cartUsersList: User[] = [];
  constructor(public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public adminServices: AdminService,
    private router: Router,
    private toastService: ToastService, ) { }

  ngOnInit() {
    this.getCartUserList();
  }

  getCartUserList() {
    this.adminServices.getCartUsers().subscribe((res) => {
      this.cartUsersList = res;
    });
  }

  updateCartUser(user: User) {
    const method = 'edit';
    this.router.navigateByUrl("admin/assign-cart/" + method + "/" + user.uid);
  }

  dissapproveMember(id) {
    this.adminServices.ApproveDissapproveUser(id, true);
    this.toastService.present({
      message: "Member Active!",
      duration: 3000,
      color: "secondary"
    });
  }

  approveMember(id) {
    this.adminServices.ApproveDissapproveUser(id, false);
    this.toastService.present({
      message: "Member Deactive!",
      duration: 3000,
      color: "danger"
    });
  }

  async deleteCartUser(id) {
    const alert = await this.alertCtrl.create({
      message: 'Are you sure you want to delete the user?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: blah => {
            console.log('Confirm Cancel: blah');
          },
        },
        {
          text: 'Okay',
          handler: () => {
            this.adminServices.deleteMember(id).then(() => {
              //Deleted
            });;;
          },
        },
      ],
    });

    await alert.present();


  }

  add() {
    const method = 'add';
    this.router.navigateByUrl("admin/assign-cart/" + method + "/0");
  }

}
