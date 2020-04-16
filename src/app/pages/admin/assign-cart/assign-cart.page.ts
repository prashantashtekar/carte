import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, AlertController } from '@ionic/angular';
import { AdminService } from 'src/app/services/admin/admin.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastService } from 'src/app/services/toast/toast.service';
import { Cart } from '../add-cart/model/add-cart.model';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { AlertService } from 'src/app/services/alert/alert.service';

@Component({
  selector: 'app-assign-cart',
  templateUrl: './assign-cart.page.html',
  styleUrls: ['./assign-cart.page.scss'],
})
export class AssignCartPage implements OnInit {
  cartUserInfo: User = new User();
  cartList: Cart[] = [];
  cartUsersList: User[] = [];
  isEdit: boolean = false;
  public password: string = "";
  public confirmPassword: string = "";
  constructor(
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public adminServices: AdminService,
    private authService: AuthService,
    private loadingService: LoadingService,
    private alertService: AlertService,
    private router: Router,
    private toastService: ToastService, private activatedRoute: ActivatedRoute, ) { }

  ngOnInit() {
    // cartUserId
    let cartUserId: string = this.activatedRoute.snapshot.paramMap.get('id')!;
    // Method-Add/Edit
    const method = this.activatedRoute.snapshot.paramMap.get('method');
    this.getCartList();
    if (method == 'edit') {
      //Get user by Id
      this.isEdit = true;
      this.adminServices.getUserById(cartUserId).subscribe((res: User) => {
        this.cartUserInfo = res;
      });
    }
    this.getCartUserList();
  }
  getCartList() {
    this.adminServices.getCarts().subscribe((res: Cart[]) => {
      this.cartList = res;
    });
  }
  getCartUserList() {
    this.adminServices.getCartUsers().subscribe((res) => {
      this.cartUsersList = res;
    });
  }

  onChange() {
    let term = this.cartList.filter(x => x.id == this.cartUserInfo.cartId);
    this.cartUserInfo.cartName = term[0].name;
  }

  register() {
    if (!this.isEdit) {
      this.cartUserInfo.roleName = "CartUser";
      this.cartUserInfo.isActive = true;
      if (this.password === this.confirmPassword) {
        let cartUser = this.cartUsersList.find(x=>x.cartId == this.cartUserInfo.cartId);
        if(cartUser != null) {
          this.toastService.present({
            message: "This cart is already assigned!",
            duration: 3000,
            color: "danger"
          });
          return;
        }

        this.registrationProcessing();

        this.authService
          .registerCartUserWithEmail(this.cartUserInfo, this.password)
          .then(() => {
            this.registrationSuccess();
            this.router.navigateByUrl("admin/cart-owner");
          })
          .catch(error => {
            console.log(error);
            this.registrationFailed(error);
          });
      }
      else {
        this.confirmPassword = "";
        this.toastService.present({
          message: "Password and confirm password did not match.",
          duration: 3000,
          color: "danger"
        });
      }
    }
    else
    {
      //Update
      let cartU = this.cartUsersList.find(x=>x.cartId == this.cartUserInfo.cartId 
        && x.email != this.cartUserInfo.email);
        if(cartU != null) {
          this.toastService.present({
            message: "This cart is already assigned!",
            duration: 3000,
            color: "danger"
          });
          return;
        }
      this.authService.updateCartUserDocumentInFirebase(this.cartUserInfo);
      this.registrationSuccess();
      this.router.navigateByUrl("admin/cart-owner");
    }

  }

 
  registrationProcessing() {
    this.loadingService.present({
      message: "Registering. . ."
    });
  }

  registrationSuccess() {
    this.loadingService.dismiss();

    this.toastService.present({
      message: "All registered, welcome aboard!",
      duration: 3000,
      color: "secondary"
    });
  }

  registrationFailed(error: any) {
    this.loadingService.dismiss();

    this.alertService.present({
      header: "Registration Error",
      message: error.message,
      buttons: ["OK"]
    });
  }

  hideShowPassword() {
    this.password = this.password === 'text' ? 'password' : 'text';
    this.password = this.password === 'eye-off' ? 'eye' : 'eye-off';
  }
}
