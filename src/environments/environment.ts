// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

//The Firebase config needs to be replaced with a new one. This firebaseConfig links to a project that has been deleted
export const environment = {
  production: false,
  googleWebClientId: "254193771768-5qrg5d1caamjn33gosa0pj2g8lto6c54.apps.googleusercontent.com",
  firebaseConfig: {
    apiKey: "AIzaSyAlPZnyvdfGSc_mMhuPP2405ws8fWzXyEE",
    authDomain: "carteapp.firebaseapp.com",
    databaseURL: "https://carteapp.firebaseio.com",
    projectId: "carteapp",
    storageBucket: "carteapp.appspot.com",
    messagingSenderId: "254193771768",
    appId: "1:254193771768:web:83bc5284c7521ec360070d",
    measurementId: "G-49388Y1FTT"
  }

};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
