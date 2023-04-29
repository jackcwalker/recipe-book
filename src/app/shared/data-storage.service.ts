import { HttpClient } from "@angular/common/http";
import { EventEmitter, Injectable } from "@angular/core";
import { RecipeService } from "../recipes/recipe.service";
import { Recipe } from "../recipes/recipe.model";
import { initializeApp, FirebaseApp } from "firebase/app";
import { StorageReference, getStorage, ref, uploadBytes, deleteObject } from "firebase/storage";

@Injectable ({ providedIn: 'root' })
export class DataStorageService {
    private app: FirebaseApp;
    fileUploaded = new EventEmitter<string> ();

    constructor (private http: HttpClient, private recipeService: RecipeService) {
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

    storeRecipes() {
        const recipes = this.recipeService.getRecipes();
        this.http.put(
            "https://recipe-book-85758-default-rtdb.asia-southeast1.firebasedatabase.app/recipes.json",
            recipes
        )
        .subscribe(response => {
        console.log(response);
        });
    }
    fetchRecipes() {
        this.http.get<Recipe[]>(
            "https://recipe-book-85758-default-rtdb.asia-southeast1.firebasedatabase.app/recipes.json",
        )
        .subscribe(recipes => {
            this.recipeService.setRecipes(recipes);
        });
    }

    uploadFile(fileName: string, file: File) {
        const storage = getStorage();
        const storageRef = ref(storage, fileName);
        uploadBytes(storageRef, file).then((snapshot) => {
            this.fileUploaded.emit(fileName);
        });
      }

      deleteFile(fileName: string) {
        const storage = getStorage();
        const storageRef = ref(storage, fileName);
        // Delete the file
        deleteObject(storageRef).then(() => {
            // File deleted successfully
        }).catch((error) => {
            // Uh-oh, an error occurred!
        });
      }
}

