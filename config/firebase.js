import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, initializeAuth,getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyDzYQo-t6hkUnDNHLGJLbaQU-3iXIBJPlA",
    authDomain: "midterm-exam-firebase.firebaseapp.com",
    projectId: "midterm-exam-firebase",
    storageBucket: "midterm-exam-firebase.appspot.com",
    messagingSenderId: "1006401984129",
    appId: "1:1006401984129:web:c0b04534552ac46c765f80",
    measurementId: "G-BT6W3KCXBF"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
// const auth = getAuth(app);
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export { db, storage, auth };