import { EventEmitter, Injectable } from "@angular/core";
import { Recipe } from "./recipe.model";
import { Ingredient } from "../shared/ingredient.model";
import { ShoppingListService } from "../shopping-list/shopping-list.service";
import { DataStorageService } from "../shared/data-storage.service";
import { RecipeImage } from "./recipeImage.model";
import { Observable, ReplaySubject } from "rxjs";

@Injectable()
export class RecipeService {
    gotImageDownloadUrl = new EventEmitter<string> ();
    
    recipes$ = new ReplaySubject();
    
    private recipes: Recipe[] = [];


    constructor (private slService: ShoppingListService, private dataService: DataStorageService) { 
        this.dataService.recipesDownloaded
        .subscribe(
          (recipes: Recipe[]) => {
            console.log("Recipe Service Logger: Recipes Downloaded");
            console.log(this.recipes);
            this.setRecipes(recipes);
          }
        )
        this.fetchRecipes();
    }

    setRecipes (recipes: Recipe[]) {
        if (recipes) {
            this.recipes = recipes;
        } else {
            this.recipes = []
        }
        this.recipes$.next(this.recipes.slice());
    }

    pushRecipes() {
        this.recipes$.next(this.recipes.slice());
    }
    saveAndPushRecipes() {
        this.pushRecipes()
        this.dataService.storeRecipes(this.recipes);
    }

    getFullImagePath(recipeName: string, image: RecipeImage){
        return this.dataService.getFullImagePath(this.getRecipeRoute(recipeName),image.path)
        .then((value) => {return value});
    }

    getRecipeRoute(recipeName: string){
        return recipeName.replace(/\s/g, '-');
    }

    addIngredientsToList(ingredients: Ingredient[]) {
        this.slService.addIngredients(ingredients);
    }

    getRecipeIndex(name:string) {
        for (let i = 0; i < this.recipes.length; i++) {
            if (this.recipes[i].name == name) {
                return i;
            }
        }
    }

    getRecipe (index: number) {
        return this.recipes[index];
    }

    addRecipe(recipe: Recipe, images: RecipeImage[]) {
        console.log('Recipe Service Logger:  Adding Recipe: '+recipe.name)
        this.recipes.push(recipe);
        this.saveAndPushRecipes();
        return this.updateImages(recipe.name, images);
    }

    updateRecipe(index: number, newRecipe: Recipe, images: RecipeImage[]) {
        console.log('Recipe Service Logger:  Editing Recipe: '+ newRecipe.name)
        this.recipes[index] = newRecipe;
        this.saveAndPushRecipes();
        return this.updateImages(newRecipe.name, images);
    }

    private updateImages(route: string, images: RecipeImage[]){
        console.log('Recipe Service Logger: Updating Images');
        const dataOperations: Promise<any>[] = [];

        for (let image of images) {
          if (image.toBeCreated && !image.toBeDeleted) {
            const newImagePath = route + '/' + image.name;
            console.log('Edit Logger: Uploading new image: '+newImagePath);
            dataOperations.push(this.dataService.uploadFile(newImagePath,image.file));

          } else if (image.toBeDeleted) {
            console.log('Edit Logger: Deleting image: '+route + '/' + image.path);
            dataOperations.push(this.dataService.deleteFile(route + '/' + image.path));
          }
        }

        return Promise.all(dataOperations);
      }

    deleteRecipe(index: number) {
        console.log("Recipe Service Logger: Service Deleting Recipe: " + this.recipes[index].name);
        for (let image of this.recipes[index].images){
            this.dataService.deleteFile(this.getRecipeRoute(this.recipes[index].name) + '/' + image.path);
        }
        this.recipes.splice(index,1);
        this.saveAndPushRecipes();
    }

    storeRecipes() {
        this.dataService.storeRecipes(this.recipes);
    }

    fetchRecipes() {
        this.dataService.fetchRecipes();
    }
}