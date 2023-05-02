import { EventEmitter, Injectable } from "@angular/core";
import { Recipe } from "./recipe.model";
import { Ingredient } from "../shared/ingredient.model";
import { ShoppingListService } from "../shopping-list/shopping-list.service";
import { DataStorageService } from "../shared/data-storage.service";
import { RecipeImage } from "./recipeImage.model";
import { ReplaySubject } from "rxjs";

@Injectable()
export class RecipeService {
    fullScreenChanged = new EventEmitter<boolean> ();
    gotImageDownloadUrl = new EventEmitter<string> ();
    fullScreen: boolean = false;
    
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

    setFullScreen(value: boolean) {
        this.fullScreen = value;
        this.fullScreenChanged.emit(this.fullScreen);
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

    addRecipe(recipe: Recipe) {
        console.log('Recipe Service Logger:  Adding Recipe: '+recipe.name)
        this.recipes.push(recipe);
        this.saveAndPushRecipes();
    }

    updateRecipe(index: number, newRecipe: Recipe) {
        this.recipes[index] = newRecipe;
        this.saveAndPushRecipes();
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