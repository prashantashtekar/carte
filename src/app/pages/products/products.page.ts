import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from './model/product.model';
import { ProductsService } from './services/products.service';
import { User } from 'src/app/interfaces/user';
import { AdminService } from 'src/app/services/admin/admin.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { catchError } from 'rxjs/operators';
import { AlertController } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
})
export class ProductsPage implements OnInit {
  productList: Product[] = [];
  userProfile: User = null;

  constructor(private router: Router, private authService: AuthService, private toastService: ToastService,
    public productService: ProductsService, public alertCtrl: AlertController) { }

  ngOnInit() {
    this.authService.user$.subscribe((user) => {
      console.log('current user: ', user);
      this.userProfile = user;
      this.geProduct(this.userProfile.uid);
    });

  }
  geProduct(uid) {
    this.productService.getProductsByUser(uid).subscribe((res) => {
      this.productList = res;
    },
      async error => {
        const alert = await this.alertCtrl.create({
          message: error.message,
          buttons: [{ text: 'Ok', role: 'cancel' }],
        });
        await alert.present();
      }
    );
  }

  updateProduct(product: Product) {
    const method = 'edit';
    this.router.navigateByUrl("home/products/" + method + "/" + product.id);
  }

  add() {
    const method = 'add';
    this.router.navigateByUrl("home/products/" + method + "/0");
  }



  dissapproveProduct(id) {
    this.productService.ApproveDissapproveProduct(id, true);
    this.toastService.present({
      message: "Product Active!",
      duration: 3000,
      color: "secondary"
    });
  }

  approveProduct(id) {
    this.productService.ApproveDissapproveProduct(id, false);
    this.toastService.present({
      message: "Product Deactive!",
      duration: 3000,
      color: "danger"
    });
  }


  isOutOfStockProduct(id) {
    this.productService.isInOutStockProduct(id, true);
    this.toastService.present({
      message: "Product in stock!",
      duration: 3000,
      color: "secondary"
    });
  }

  isStockProduct(id) {
    this.productService.isInOutStockProduct(id, false);
    this.toastService.present({
      message: "Product out of stock!",
      duration: 3000,
      color: "danger"
    });
  }

  async deleteProduct(id) {
    const alert = await this.alertCtrl.create({
      message: 'Are you sure you want to delete the product?',
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
            this.productService.deleteProduct(id).then(() => {
              //Deleted
            });
          },
        },
      ],
    });
    await alert.present();
  }
}
