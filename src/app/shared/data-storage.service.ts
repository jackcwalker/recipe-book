import { HttpClient } from "@angular/common/http";
import { EventEmitter, Injectable } from "@angular/core";
import { Recipe } from "../recipes/recipe.model";
import { initializeApp, FirebaseApp } from "firebase/app";
import { getStorage, ref, uploadBytes, deleteObject, getDownloadURL } from "firebase/storage";

@Injectable ({ providedIn: 'root' })
export class DataStorageService {
    private app: FirebaseApp;
    fileUploaded = new EventEmitter<string> ();
    recipesDownloaded = new EventEmitter<Recipe[]> ();

    constructor (private http: HttpClient) {
        const firebaseConfig = {
            apiKey: "AIzaSyBjxygOGDjR1RGb6fNReHhJG_xRY7LLuHM",
            authDomain: "recipe-book-85758.firebaseapp.com",
            databaseURL: "https://recipe-book-85758-default-rtdb.asia-southeast1.firebasedatabase.app",
            projectId: "recipe-book-85758",
            storageBucket: "recipe-book-85758.appspot.com",
            messagingSenderId: "468286750333",
            appId: "1:468286750333:web:7e0a85caff79e0a996fb14",
            measurementId: "G-9HD8V5LLQN"
          };
    
        this.app = initializeApp(firebaseConfig);
    }

    storeRecipes(recipes: Recipe[]) {
        console.log('Data Service Logger: Storing Recipes');
        this.http.put(
            "https://recipe-book-85758-default-rtdb.asia-southeast1.firebasedatabase.app/recipes.json",
            recipes
        )
        .subscribe(response => {
            console.log('Data Service Logger: Storing Request Response:');
            console.log(response);
        });
    }
    fetchRecipes() {
        console.log('Data Service Logger: Fetching Recipes');
        this.http.get<Recipe[]>(
            "https://recipe-book-85758-default-rtdb.asia-southeast1.firebasedatabase.app/recipes.json",
        ).subscribe(recipes => {
            this.recipesDownloaded.emit(recipes);
        });
    }

    getFullImagePath(folder: string, filename: string){
        const storage = getStorage();
        const pathReference = ref(storage, folder+'/'+filename);
        return getDownloadURL(pathReference).then((url) => {
            return url;
          })
          .catch((error) => {
            console.log(error)
          });
    }

    uploadFile(fileName: string, file: File) {
        console.log('Data Service Logger: Uploading '+fileName)
        const storage = getStorage();
        const storageRef = ref(storage, fileName);
        uploadBytes(storageRef, file).then((snapshot) => {
            console.log('Data Service Logger: Upload Response');
            console.log(snapshot);
            this.fileUploaded.emit(fileName);
        });
      }

    deleteFile(fileName: string) {
        const storage = getStorage();
        const storageRef = ref(storage, fileName);
        console.log('Data Service Logger: Deleting file: '+fileName)
        // Delete the file
        deleteObject(storageRef).then(() => {
            console.log('Data Service Logger: Successfully Deleted: '+fileName);
        }).catch((error) => {
            console.log('Data Service Logger: Failed Delete due to: '+error);
        });
      }
}

