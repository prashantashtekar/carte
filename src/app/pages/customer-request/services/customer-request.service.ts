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
      status: request.status,
      selectedOptions: request.selectedOptions,
      messages : request.messages
    };
    let requestDoc: AngularFirestoreDocument<CustomerRequest> 
      = this.firestore.doc<CustomerRequest>(`requests/${id}`);
    return requestDoc.set(newRequest);
  }

  //get requests added by userid for current date
  getRequestsByUser(userId: string) {
    this.customerRequestCollection = this.firestore.collection('requests', ref => ref.where('customerId', '==', userId).where('dateRequested', 'in', [new Date().toDateString(), new Date(new Date().getDate() -1).toDateString()]));
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

  //get requests by cart user id
  getRequestsByCartUser(cartUserId: string) {
    //where('dateRequested', '==', new Date().toDateString()).
    this.customerRequestCollection = this.firestore
      .collection('requests', ref => ref
        .where('cartUserId', '==', cartUserId)
        .where('status', 'in', ['ACCEPTED','REQUESTED', 'PENDING']));
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

  

  //update request status to rejected to accepted
  updateRequestDocumentInFirebase(request: CustomerRequest) {
    let reqDoc: AngularFirestoreDocument<CustomerRequest> = this.firestore.doc<CustomerRequest>(`requests/${request.id}`);
    reqDoc.update({
      status: request.status,
      messages: request.messages
    });
  }
}
