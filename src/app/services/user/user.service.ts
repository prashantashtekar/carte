import { Injectable } from '@angular/core';
import { AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { User } from 'src/app/interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor() { }

  private userCollection: AngularFirestoreCollection<User>;
  private users: Observable<User[]>;

  // getUserList(): AngularFirestoreCollection<User> {
  //   return this.firestore.collection(`songList`);
  // }
}
