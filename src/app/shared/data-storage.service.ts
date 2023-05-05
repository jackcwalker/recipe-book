import { HttpClient } from "@angular/common/http";
import { EventEmitter, Injectable } from "@angular/core";
import { Recipe } from "../recipes/recipe.model";
import { initializeApp, FirebaseApp } from "firebase/app";
import { getStorage, ref, uploadBytes, deleteObject, getDownloadURL } from "firebase/storage";
import { NgxImageCompressService} from 'ngx-image-compress';
import { User } from "./user.model";

@Injectable ({ providedIn: 'root' })
export class DataStorageService {
    private app: FirebaseApp;
    recipesDownloaded = new EventEmitter<Recipe[]> ();

    constructor (private http: HttpClient,
        private imageCompress: NgxImageCompressService) {
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
    saveUsers(users: User[]) {
        console.log('Data Service Logger: Storing User Table');
        this.http.put(
            "https://recipe-book-85758-default-rtdb.asia-southeast1.firebasedatabase.app/users.json",
            users
        )
        .subscribe(response => {
            console.log('Data Service Logger: Storing User Request Response:');
            console.log(response);
        });
    }
    fetchRecipes() {
        console.log('Data Service Logger: Fetching Recipes');
        return this.http.get<Recipe[]>(
            "https://recipe-book-85758-default-rtdb.asia-southeast1.firebasedatabase.app/recipes.json",
        );
    }

    getFullImagePath(folder: string, filename: string){
        const storage = getStorage();
        const pathReference = ref(storage, folder+'/'+filename);
        return getDownloadURL(pathReference)
          .catch((error) => {
            console.log(error)
          });
    }

    uploadFile(fileName: string, file: File) {
        console.log('Data Service Logger: Upload request received for: '+fileName)
        const storage = getStorage();
        const storageRef = ref(storage, fileName);
        return uploadBytes(storageRef, file);
      }

    uploadCompressedFile(fileName: string, file: File) {
        console.log('Data Service Logger: Upload request received for: '+fileName)
        const storage = getStorage();
        const storageRef = ref(storage, fileName);
        return this.resizeImage(file).then((compressedImage) => {
            // call method that creates a blob from dataUri
            const imageBlob = this.dataURItoBlob(compressedImage.split(',')[1]);
            console.log('Data Service Logger: Uploading Compressed Image')
            return uploadBytes(storageRef, imageBlob);
        }
        )
      }

    uploadThumnail(fileName: string, file: File) {
        console.log('Data Service Logger: Thumbnail request received for: '+fileName)
        const storage = getStorage();
        const storageRef = ref(storage, fileName);
        return this.makeThumbnail(file).then((compressedImage) => {
            // call method that creates a blob from dataUri
            const imageBlob = this.dataURItoBlob(compressedImage.split(',')[1]);
            console.log('Data Service Logger: Uploading Compressed Thumbnail')
            return uploadBytes(storageRef, imageBlob);
        }
        )
      }

    deleteFile(fileName: string) {
        const storage = getStorage();
        const storageRef = ref(storage, fileName);
        console.log('Data Service Logger: Deleting file: '+fileName)
        // Delete the file
        return deleteObject(storageRef)
      }

    resizeImage(image: File) {
        console.log('Data Service Logger: Original image size:', this.imageCompress.byteCount(URL.createObjectURL(image)));
        return this.imageCompress.compressFile(URL.createObjectURL(image), this.imageCompress.DOC_ORIENTATION.Default, 100, 100, 1000, 1000).then(
            (image) => {
                console.log('Data Service Logger: Compressed image size:', this.imageCompress.byteCount(image));
                return image
        }
        ) // 50% ratio, 50% quality
        };

    makeThumbnail(image: File) {
        console.log('Data Service Logger: Original thumbnail size:', this.imageCompress.byteCount(URL.createObjectURL(image)));
        return this.imageCompress.compressFile(URL.createObjectURL(image), this.imageCompress.DOC_ORIENTATION.Default, 100, 100, 75, 75).then(
            (image) => {
                console.log('Data Service Logger: Compressed thumbnail size:', this.imageCompress.byteCount(image));
                return image}
        ) // 50% ratio, 50% quality
        };

    dataURItoBlob(dataURI) {
        const byteString = window.atob(dataURI);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const int8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) {
            int8Array[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([int8Array], { type: 'image/jpeg' });
        return blob;
    }
            
}

