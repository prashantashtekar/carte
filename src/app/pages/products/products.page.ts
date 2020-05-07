import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from './model/product.model';
import { ProductsService } from './services/products.service';
import { User } from 'src/app/interfaces/user';
import { AdminService } from 'src/app/services/admin/admin.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { catchError } from 'rxjs/operators';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
})
export class ProductsPage implements OnInit {
  productList: Product[] = [];
  userProfile: User = null;

  constructor(private router: Router, private authService: AuthService,
    public productService: ProductsService,public alertCtrl:AlertController ) { }

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
    async error  => {
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

  deleteProduct(id)
  {
    
  }
}
