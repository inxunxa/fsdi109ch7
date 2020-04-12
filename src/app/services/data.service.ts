import { Injectable } from '@angular/core';
import { Message } from '../models/message';
import { Observable } from 'rxjs';
import { map } from  'rxjs/operators'
import { firestore } from 'firebase';
import { AngularFirestoreCollection, AngularFirestore } from 'angularfire2/firestore';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  allMessages: Observable<Message[]>;
  messageCollection: AngularFirestoreCollection<Message>; // pipeline to firebase database

  constructor(private fb: AngularFirestore) {
    this.messageCollection = fb.collection<Message>('posts'); // initialize connction app -> firebase
  }

  // Good way to read data (w/o dates)
  // retrieveMessagesFromDB() {
  //   this.allMessages = this.messageCollection.valueChanges();
  // }

  retrieveMessagesFromDB(){
    this.allMessages = this.messageCollection.snapshotChanges().pipe(
      map(actions => {
          return actions.map(a => {
              let data = a.payload.doc.data();
              var d: any = data.createdOn; // <- firebase data format
              if(d){
                data.createdOn = new firestore.Timestamp(d.seconds, d.nanoseconds).toDate();
              }
              return {... data }
          })
      })
    );
  }

  public saveMessage(message) {
    var plain = Object.assign({}, message);
    this.messageCollection.add(plain);
  }

  public getAllMessages() {
    this.retrieveMessagesFromDB(); // subscribe to changes
    return this.allMessages;
  }
}
