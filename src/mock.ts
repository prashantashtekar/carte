import {Firebase} from "@ionic-native/firebase/ngx";

export class FirebaseMock extends Firebase {

  verifyPhoneNumber(): Promise<any> {
    return Promise.resolve({verificationId: 'example'})
  }
}