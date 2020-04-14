import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Cart } from 'src/app/pages/admin/add-cart/model/add-cart.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from 'src/app/interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private cartCollection: AngularFirestoreCollection<Cart>;
  private carts: Observable<Cart[]>;

  private cartUsersCollection: AngularFirestoreCollection<User>;
  private cartUsers: Observable<User[]>;

  constructor(private firestore: AngularFirestore) { }

  // this method takes an cart object and 
  // add a new cart to Firestore database collection
  addCart(cartName: string): Promise<void> {
    const id = this.firestore.createId();
    const newCart: Cart = {
      id: id,
      name: cartName,
      isActive: true
    };

    let cartDoc: AngularFirestoreDocument<Cart> = this.firestore.doc<Cart>(`carts/${id}`);
    return cartDoc.set(newCart);

    //Method 2
    // return this.firestore.doc(`carts/${id}`).set({
    //   id,
    //   cartName,   
    // });
  }

  // this method returns list of cart document,
  getCarts() {
    this.cartCollection = this.firestore.collection<Cart>("carts");
    this.carts = this.cartCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      })
    );
    return this.carts;
  }

  // this method takes an Cart object and
  updateCart(cart: Cart) {
    // convert object of type Cart to JSON object
    // because Firestore understand JSON
    const cartObject = { ...cart };
    this.firestore.doc('carts/' + cart.id).update(cartObject);
  }

  // this method takes an Cart Id and
  // delete an Cart document from the Firestore collection
  deleteCart(cartid: string) {
    return this.firestore.doc('carts/' + cartid).delete();
  }

  getCartUsers() {
    this.cartUsersCollection = this.firestore.collection('users', ref => ref.where('roleName', '==', 'CartUser'));
    this.cartUsers = this.cartUsersCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      })
    );
    return this.cartUsers;
  }

  getUserById(id) {
    return this.firestore.collection('users').doc(id).valueChanges();
  }

  ApproveDissapproveUser(userid: string, flag: boolean) {
    return this.firestore.collection('users').doc(userid).update({
      isActive: flag
    });
  }

  deleteMember(userid: string) {
    return this.firestore.collection('users').doc(userid).delete();
    
  }
}
