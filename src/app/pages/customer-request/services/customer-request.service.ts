import { Injectable } from '@angular/core';
import { CustomerRequest } from '../model/customer-request.model';
import { AngularFirestoreCollection, AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CustomerRequestService {
  private customerRequestCollection: AngularFirestoreCollection<CustomerRequest>;
  private customerRequests: Observable<CustomerRequest[]>;

  constructor(private firestore: AngularFirestore) { }

  // add a new request to Firestore database collection
  addRequest(request: CustomerRequest): Promise<void> {
    const id = this.firestore.createId();
    const newRequest: CustomerRequest = {
      id: id,
      cartUserId: request.cartUserId,
      customerId:request.customerId,
      customerLatitude: request.customerLatitude,
      customerLongitude: request.customerLongitude,
      customerName: request.customerName,
      customerPhoneNumber: request.customerPhoneNumber,
      dateRequested: request.dateRequested,
      status: request.status
    };
    let requestDoc: AngularFirestoreDocument<CustomerRequest> 
      = this.firestore.doc<CustomerRequest>(`requests/${id}`);
    return requestDoc.set(newRequest);
  }

  getRequestsByUser(userId: string) {
    this.customerRequestCollection = this.firestore.collection('requests', ref => ref.where('customerId', '==', userId).where('dateRequested', '==', new Date().toDateString()));
    this.customerRequests = this.customerRequestCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      })
    );
    return this.customerRequests;
  }

  getRequestsByCartUser(cartUserId: string) {
    this.customerRequestCollection = this.firestore.collection('requests', ref => ref.where('cartUserId', '==', cartUserId).where('dateRequested', '==', new Date().toDateString()));
    this.customerRequests = this.customerRequestCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      })
    );
    return this.customerRequests;
  }
}
