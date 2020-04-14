import { Injectable, NgZone } from "@angular/core";
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import 'firebase/firestore';
import { switchMap } from "rxjs/operators";
import { User } from "../../interfaces/user";

import { BehaviorSubject, Observable, of } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<any>;

  private authState: any;
  public loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    public afAuth: AngularFireAuth,
    private zone: NgZone,
    private afs: AngularFirestore) { }

  init() {
    this.afAuth.authState.subscribe(auth => {
      this.authState = auth;
    });
    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          console.log("User already logged in: ", user);
          let userDoc = this.afs.doc<User>(`users/${user.uid}`);
          return userDoc.valueChanges();
        } else {
          console.log("No user logged in.");
          return of(null);
        }
      })
    );
    this.user$.subscribe();

    console.log("Ob user");
    console.log(this.user$);
    this.afAuth.auth.onAuthStateChanged(firebaseUser => {
      this.zone.run(() => {
        firebaseUser ? this.loggedIn.next(true) : this.loggedIn.next(false);
      });
    });
  }

  get isAuthenticated(): boolean {
    return (this.authState !== null) ? true : false;
  }
  //PA-Added- to get user details
  userDetails() {
    return this.afAuth.auth.currentUser;
  }

  checkUserExist(uid: string, email: string) {
    this.afs.firestore.doc(`users/${uid}`).get()
      .then(docSnapshot => {
        if (!docSnapshot.exists) {
          this.createNewUserDocumentInFirebase(email, uid);
        }
      });
  }
  //Login With Email
  async loginWithEmail(email: string, password: string): Promise<firebase.auth.UserCredential> {

    return await new Promise<any>((resolve, reject) => {
      this.afAuth.auth.signInWithEmailAndPassword(email, password)
        .then(
          res => resolve(res),
          err => reject(err))
    })

    //return await this.afAuth.auth.signInWithEmailAndPassword(email, password);

  }

  //Register Email
  async registerWithEmail(email: string, password: string): Promise<any> {
    const credential = await this.afAuth.auth.createUserWithEmailAndPassword(email, password);
    //Create New user in firebase
    this.createNewUserDocumentInFirebase(email, credential.user.uid)
  }

  //Register Cart User Email
  async registerCartUserWithEmail(user: User, password: string): Promise<any> {
    const credential = await this.afAuth.auth.createUserWithEmailAndPassword(user.email, password);
    //Create New user in firebase
    this.createNewCartUserDocumentInFirebase(user, credential.user.uid)
  }

  createNewCartUserDocumentInFirebase(user: User, uid: string) {
    const newUser: User = {
      uid: uid,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      address: user.address,
      roleName: user.roleName,
      cartId: user.cartId,
      cartName: user.cartName,
      isActive: user.isActive
    };
    let userDoc: AngularFirestoreDocument<User> = this.afs.doc<User>(`users/${uid}`);
    userDoc.set(newUser);
  }

  updateCartUserDocumentInFirebase(user: User) {
   let userDoc: AngularFirestoreDocument<User> = this.afs.doc<User>(`users/${user.uid}`);
    userDoc.update({
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      address: user.address,
      cartId: user.cartId,
      cartName: user.cartName,
    });
  }

  //Logout User
  async logoutUser(): Promise<void> {
    await this.afAuth.auth.signOut();
  }

  //Reset password
  async resetPassword(email: string): Promise<void> {
    await this.afAuth.auth.sendPasswordResetEmail(email);
  }

  async changePassword(email: string): Promise<void> {
    await this.afAuth.auth.sendPasswordResetEmail(email);
  }

  createNewUserDocumentInFirebase(email: string, uid: string): void {
    const newUser: User = {
      uid: uid,
      email: email,
      roleName: 'Customer'
    };
    let userDoc: AngularFirestoreDocument<User> = this.afs.doc<User>(`users/${uid}`);
    userDoc.set(newUser);
  }

  updateUserDocumentInFirebase(user: User): void {
    let userDoc: AngularFirestoreDocument<User> = this.afs.doc<User>(`users/${user.uid}`);
    userDoc.update(user);
  }



}
