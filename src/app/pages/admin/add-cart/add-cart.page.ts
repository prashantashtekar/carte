import { Component, OnInit } from '@angular/core';
import { Cart } from './model/add-cart.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoadingController, AlertController } from '@ionic/angular';
import { AdminService } from 'src/app/services/admin/admin.service';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/services/toast/toast.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-add-cart',
  templateUrl: './add-cart.page.html',
  styleUrls: ['./add-cart.page.scss'],
})
export class AddCartPage implements OnInit {
  createCartForm: FormGroup;
  cartList: Cart[] = [];
  cartName: string;
  validation_messages = {
    cartName: [{ type: "required", message: "Cart name is required." }]
  };
  constructor(
    public formBuilder: FormBuilder,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public adminServices: AdminService,
    private router: Router,
    private toastService: ToastService,
  ) { }

  ngOnInit() {
    this.createCartForm = this.formBuilder.group({
      cartName: ["", Validators.required]
    });
    this.getCartList();
  }

  async createCart() {
    const loading = await this.loadingCtrl.create();
    const cartName = this.createCartForm.value.cartName;
    let cart = this.cartList.find(x=>x.name.toLowerCase() == cartName.toLowerCase());
    if(cart != null) {
      this.toastService.present({
        message: "Cart name already exists!",
        duration: 3000,
        color: "danger"
      });      
      return;
    }
    this.adminServices
      .addCart(cartName)
      .then(
        () => {
          loading.dismiss().then(() => {
            this.resetForm();
            this.getCartList();
            this.toastService.present({
              message: "Cart added sucessfully!",
              duration: 3000,
              color: "secondary"
            });
          });
        },
        error => {
          console.error(error);
        }
      );

    return await loading.present();
  }

  resetForm() {
    this.createCartForm.get("cartName").setValue("");
  }

  getCartList() {
    this.adminServices.getCarts().subscribe((res) => {
      this.cartList = res;
    });
  }

  async deleteCart(cart: Cart) {
    //TODO: Delete cart from all assigned users
    const alert = await this.alertCtrl.create({
      message: 'Are you sure you want to delete the cart?',
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
            this.adminServices.deleteCart(cart.id).then(() => {
              //Deleted
            });;

          },
        },
      ],
    });

    await alert.present();
  }

  updateCart(cart: Cart) {
    this.presentAlertEdit(cart);
  }

  async presentAlertEdit(cart) {

    const alert = await this.alertCtrl.create({
      header: 'Edit Cart',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Cart Name Here',
          value: cart.name
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (data) => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: (data) => {
            console.log('Confirm Ok');
            cart.name = data.name;
            this.adminServices.updateCart(cart);
          }
        }
      ]
    });
    return await alert.present();
  }

}
