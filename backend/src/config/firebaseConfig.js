import admin from 'firebase-admin';
import {readFileSync} from 'fs';

const serviceAccount = JSON.parse(readFileSync('./src/config/serviceAccountKey.json'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "storageBucket.app"
});


export const db = admin.firestore();
export const auth = admin.auth();
export const bucket = admin.storage().bucket();
export const firestore = admin.firestore;
