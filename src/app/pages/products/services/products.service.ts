import { Injectable } from '@angular/core';
import { Product } from '../model/product.model';
import { AngularFirestoreCollection, AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private productCollection: AngularFirestoreCollection<Product>;
  private products: Observable<Product[]>;

  constructor(private firestore: AngularFirestore) { }

  // add a new product to Firestore database collection
  addProduct(product: Product): Promise<void> {
    const id = this.firestore.createId();
    const newProduct: Product = {
      id: id,
      name: product.name,
      description: product.description,
      isActive: true,
      isOutOfStock: false,
      price: product.price,
      cartUserId: product.cartUserId
    };

    let productDoc: AngularFirestoreDocument<Product> = this.firestore.doc<Product>(`products/${id}`);
    return productDoc.set(newProduct);
  }

  // this method returns list of product document,
  getproducts() {
    this.productCollection = this.firestore.collection<Product>("products");
    this.products = this.productCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      })
    );
    return this.products;
  }

  // this method takes an Product object and
  updateProduct(product: Product) {
    // convert object of type Product to JSON object
    // because Firestore understand JSON
    const cartObject = { ...product };
    this.firestore.doc('products/' + product.id).update(cartObject);
  }

  // this method takes an products Id and
  // delete an Cart document from the Firestore collection
  // deleteProduct(productid: string) {
  //   return this.firestore.doc('products/' + productid).delete();
  // }

  getProductsByUser(cartUserId: string) {
    this.productCollection = this.firestore.collection('products', ref => ref.where('cartUserId', '==', cartUserId));
    this.products = this.productCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      })
    );
    return this.products;
  }

  getProductById(id) {
    return this.firestore.collection('products').doc(id).valueChanges();
  }

  ApproveDissapproveProduct(id: string, flag: boolean) {
    return this.firestore.collection('products').doc(id).update({
      isActive: flag
    });
  }

  deleteProduct(id: string) {
    return this.firestore.collection('products').doc(id).delete();

  }
}
