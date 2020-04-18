import { Component, OnInit } from '@angular/core';
import { Product } from '../model/product.model';
import { LoadingController, AlertController } from '@ionic/angular';
import { AdminService } from 'src/app/services/admin/admin.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { AlertService } from 'src/app/services/alert/alert.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastService } from 'src/app/services/toast/toast.service';
import { User } from 'src/app/interfaces/user';
import { ProductsService } from '../services/products.service';

@Component({
  selector: 'app-product-add-edit',
  templateUrl: './product-add-edit.page.html',
  styleUrls: ['./product-add-edit.page.scss'],
})
export class ProductAddEditPage implements OnInit {
  productInfo: Product = new Product();
  isEdit: boolean = false;
  userProfile: User = null;
  constructor(public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public adminServices: AdminService,
    public productService: ProductsService,
    private authService: AuthService,
    private loadingService: LoadingService,
    private alertService: AlertService,
    private router: Router,
    private toastService: ToastService, private activatedRoute: ActivatedRoute, ) { }

  ngOnInit() {
    this.authService.user$.subscribe((user) => {
      console.log('current user: ', user);
      this.userProfile = user;
    });
    let productId: string = this.activatedRoute.snapshot.paramMap.get('id')!;
    // Method-Add/Edit
    const method = this.activatedRoute.snapshot.paramMap.get('method');
    if (method == 'edit') {
      this.isEdit = true;
      this.productService.getProductById(productId).subscribe((res: Product) => {
        this.productInfo = res;
      });
    }
  }

  saveProduct() {
    this.productInfo.cartUserId = this.userProfile.uid;
    if (!this.isEdit) {
      this.registrationProcessing();
      this.productService
        .addProduct(this.productInfo)
        .then(() => {
          this.registrationSuccess();
          this.router.navigateByUrl("/home/products");
        })
        .catch(error => {
          console.log(error);
          this.registrationFailed(error);
        });
    }
    else {
      //Update
      this.productService.updateProduct(this.productInfo);
      this.registrationSuccess();
      this.router.navigateByUrl("/home/products");
    }
  }

  registrationProcessing() {
    this.loadingService.present({
      message: "Saving. . ."
    });
  }

  registrationSuccess() {
    this.loadingService.dismiss();

    this.toastService.present({
      message: "Product added sucessfully!",
      duration: 3000,
      color: "secondary"
    });
  }

  registrationFailed(error: any) {
    this.loadingService.dismiss();

    this.alertService.present({
      header: "Error!! Product not saved.",
      subHeader: error.code,
      message: error.message,
      buttons: ["OK"]
    });
  }

}
