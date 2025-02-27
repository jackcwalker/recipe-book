import { HttpClient } from "@angular/common/http";
import { EventEmitter, Injectable } from "@angular/core";
import { Recipe } from "../recipes/recipe.model";
import { initializeApp, FirebaseApp } from "firebase/app";
import { Auth, getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { getStorage, ref, uploadBytes, deleteObject, getDownloadURL } from "firebase/storage";
import { NgxImageCompressService } from 'ngx-image-compress';
import { User } from "./user.model";

@Injectable({ providedIn: 'root' })
export class DataStorageService {
  private app: FirebaseApp;
  private auth: Auth;
  private isAuthenticated = false; // Track authentication status
  private authPromise: Promise<boolean>; // To wait for authentication
  recipesDownloaded = new EventEmitter<Recipe[]>();

  constructor(private http: HttpClient, private imageCompress: NgxImageCompressService) {
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
    console.log('Initializing Data Storage Service');

    this.app = initializeApp(firebaseConfig);
    this.auth = getAuth(this.app);

    // Sign in anonymously and set authentication status
    signInAnonymously(this.auth)
      .then(() => {
        console.log("Signed in anonymously");
      })
      .catch((error) => {
        console.error("Anonymous sign-in failed:", error);
      });

    // Monitor authentication state and update status
    this.authPromise = new Promise((resolve) => {
      onAuthStateChanged(this.auth, (user) => {
        if (user) {
          console.log("Authenticated as:", user.uid);
          this.isAuthenticated = true; // Update authentication status
          resolve(true); // Resolve promise
        } else {
          console.log("User signed out.");
          this.isAuthenticated = false;
          resolve(false); // Resolve promise with false
        }
      });
    });
  }

  // Helper method to wait for authentication
  private async waitForAuthentication() {
    if (!this.isAuthenticated) {
      console.log("Waiting for authentication...");
      await this.authPromise; // Wait for authentication to resolve
      console.log("Authentication complete.");
    }
  }

  // Wait for authentication before performing operations
  async storeRecipes(recipes: Recipe[]) {
    await this.waitForAuthentication(); // Wait for authentication
    if (!this.isAuthenticated) {
      console.error('User is not authenticated');
      return;
    }
    console.log('Data Service Logger: Storing All Recipes');
    return this.http.put(
      "https://recipe-book-85758-default-rtdb.asia-southeast1.firebasedatabase.app/recipes.json",
      recipes
    );
  }

  async storeRecipe(recipe: Recipe) {
    await this.waitForAuthentication(); // Wait for authentication
    if (!this.isAuthenticated) {
      console.error('User is not authenticated');
      return;
    }
    console.log('Data Service Logger: Storing ' + recipe.name);
    return this.http.put(
      "https://recipe-book-85758-default-rtdb.asia-southeast1.firebasedatabase.app/recipe/" + recipe.route + ".json",
      recipe
    );
  }

  async getRecipe(route: string) {
    await this.waitForAuthentication(); // Wait for authentication
    if (!this.isAuthenticated) {
      console.error('User is not authenticated');
      return;
    }
    console.log('Data Service Logger: Getting ' + route);
    return this.http.get<Recipe>(
      "https://recipe-book-85758-default-rtdb.asia-southeast1.firebasedatabase.app/recipe/" + route + ".json"
    );
  }

  async deleteRecipe(recipe: Recipe) {
    await this.waitForAuthentication(); // Wait for authentication
    if (!this.isAuthenticated) {
      console.error('User is not authenticated');
      return;
    }
    console.log('Data Service Logger: Deleting ' + recipe.name);
    this.http.delete(
      "https://recipe-book-85758-default-rtdb.asia-southeast1.firebasedatabase.app/recipe/" + recipe.route + ".json"
    ).subscribe(response => {
      console.log('Data Service Logger: Deleting Request Response for ' + recipe.name);
      console.log(response);
    });
  }

  async saveUsers(users: User[]) {
    await this.waitForAuthentication(); // Wait for authentication
    if (!this.isAuthenticated) {
      console.error('User is not authenticated');
      return;
    }
    console.log('Data Service Logger: Storing User Table');
    this.http.put(
      "https://recipe-book-85758-default-rtdb.asia-southeast1.firebasedatabase.app/users.json",
      users
    ).subscribe(response => {
      console.log('Data Service Logger: Storing User Request Response:');
      console.log(response);
    });
  }

  async loadUsers() {
    await this.waitForAuthentication(); // Wait for authentication
    if (!this.isAuthenticated) {
      console.error('User is not authenticated');
      return;
    }
    console.log('User Service Logger: Getting User Table');
    return this.http.get<User[]>(
      "https://recipe-book-85758-default-rtdb.asia-southeast1.firebasedatabase.app/users.json"
    );
  }

  async fetchRecipes() {
    await this.waitForAuthentication(); // Wait for authentication
    if (!this.isAuthenticated) {
      console.error('User is not authenticated');
      return;
    }
    console.log('Data Service Logger: Fetching Recipes');
    return this.http.get<Recipe[]>(
      "https://recipe-book-85758-default-rtdb.asia-southeast1.firebasedatabase.app/recipes.json"
    );
  }

  async getFullImagePath(folder: string, filename: string) {
    await this.waitForAuthentication(); // Wait for authentication
    if (!this.isAuthenticated) {
      console.error('User is not authenticated');
      return;
    }
    const storage = getStorage();
    const pathReference = ref(storage, folder + '/' + filename);
    return getDownloadURL(pathReference)
      .catch((error) => {
        console.log(error);
      });
  }

  async uploadFile(fileName: string, file: File) {
    await this.waitForAuthentication(); // Wait for authentication
    if (!this.isAuthenticated) {
      console.error('User is not authenticated');
      return;
    }
    console.log('Data Service Logger: Upload request received for: ' + fileName);
    const storage = getStorage();
    const storageRef = ref(storage, fileName);
    return uploadBytes(storageRef, file);
  }

  async uploadCompressedFile(fileName: string, file: File) {
    await this.waitForAuthentication(); // Wait for authentication
    if (!this.isAuthenticated) {
      console.error('User is not authenticated');
      return;
    }
    console.log('Data Service Logger: Upload request received for: ' + fileName);
    const storage = getStorage();
    const storageRef = ref(storage, fileName);
    return this.resizeImage(file).then((compressedImage) => {
      const imageBlob = this.dataURItoBlob(compressedImage.split(',')[1]);
      console.log('Data Service Logger: Uploading Compressed Image');
      return uploadBytes(storageRef, imageBlob);
    });
  }

  async uploadThumnail(fileName: string, file: File) {
    await this.waitForAuthentication(); // Wait for authentication
    if (!this.isAuthenticated) {
      console.error('User is not authenticated');
      return;
    }
    console.log('Data Service Logger: Thumbnail request received for: ' + fileName);
    const storage = getStorage();
    const storageRef = ref(storage, fileName);
    return this.makeThumbnail(file).then((compressedImage) => {
      const imageBlob = this.dataURItoBlob(compressedImage.split(',')[1]);
      console.log('Data Service Logger: Uploading Compressed Thumbnail');
      return uploadBytes(storageRef, imageBlob);
    });
  }

  async deleteFile(fileName: string) {
    await this.waitForAuthentication(); // Wait for authentication
    if (!this.isAuthenticated) {
      console.error('User is not authenticated');
      return;
    }
    const storage = getStorage();
    const storageRef = ref(storage, fileName);
    console.log('Data Service Logger: Deleting file: ' + fileName);
    return deleteObject(storageRef);
  }

  async resizeImage(image: File) {
    await this.waitForAuthentication(); // Wait for authentication
    if (!this.isAuthenticated) {
      console.error('User is not authenticated');
      return;
    }
    console.log('Data Service Logger: Original image size:', this.imageCompress.byteCount(URL.createObjectURL(image)));
    return this.imageCompress.compressFile(URL.createObjectURL(image), this.imageCompress.DOC_ORIENTATION.Default, 100, 100, 1000, 1000).then(
      (image) => {
        console.log('Data Service Logger: Compressed image size:', this.imageCompress.byteCount(image));
        return image;
      }
    );
  }

  async makeThumbnail(image: File) {
    await this.waitForAuthentication(); // Wait for authentication
    if (!this.isAuthenticated) {
      console.error('User is not authenticated');
      return;
    }
    console.log('Data Service Logger: Original thumbnail size:', this.imageCompress.byteCount(URL.createObjectURL(image)));
    return this.imageCompress.compressFile(URL.createObjectURL(image), this.imageCompress.DOC_ORIENTATION.Default, 100, 100, 75, 75).then(
      (image) => {
        console.log('Data Service Logger: Compressed thumbnail size:', this.imageCompress.byteCount(image));
        return image;
      }
    );
  }

  // Helper method to convert data URI to Blob
  dataURItoBlob(dataURI: string) {
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