import { EventEmitter, Injectable } from "@angular/core";
import { Recipe } from "./recipe.model";
import { Ingredient } from "../shared/ingredient.model";
import { ShoppingListService } from "../shopping-list/shopping-list.service";
import { DataStorageService } from "../shared/data-storage.service";

@Injectable()
export class RecipeService {
    recipeSelected = new EventEmitter<Recipe> ();
    recipesChanged = new EventEmitter<Recipe[]>();
    fullScreenChanged = new EventEmitter<boolean> ();
    fullScreen: boolean = false;
    
    private recipes: Recipe[] = [];


    constructor (private slService: ShoppingListService, private dataService: DataStorageService) { 
        this.dataService.recipesDownloaded
        .subscribe(
          (recipes: Recipe[]) => {
            console.log("recipes downloaded");
            this.setRecipes(recipes);
          }
        )
        this.fetchRecipes();
    }

    getRecipes() {
        return this.recipes.slice();
    }

    setRecipes (recipes: Recipe[]) {
        if (recipes) {
            this.recipes = recipes;
            for (var recipe of recipes) {
                recipe.fullImagePath = this.getFullImagePath(recipe.imagePath);
            }
            this.recipesChanged.emit(this.recipes.slice());
        }
    }

    getFullImagePath(path: string){
        return this.dataService.getFullImagePath(path);
    }

    addIngredientsToList(ingredients: Ingredient[]) {
        this.slService.addIngredients(ingredients);
    }

    toggleFullScreen() {
        this.fullScreen = !this.fullScreen;
        this.fullScreenChanged.emit(this.fullScreen);
    }

    getRecipe (index: number) {
        return this.recipes[index];
    }

    addRecipe(recipe: Recipe) {
        this.recipes.push(recipe);
        recipe.fullImagePath = this.getFullImagePath(recipe.imagePath);
        this.recipesChanged.emit(this.recipes.slice());
        this.storeRecipes()
    }

    updateRecipe(index: number, newRecipe: Recipe) {
        newRecipe.fullImagePath = this.getFullImagePath(newRecipe.imagePath);
        this.recipes[index] = newRecipe;
        this.recipesChanged.emit(this.recipes.slice());
        this.storeRecipes()
    }

    deleteRecipe(index: number) {
        this.recipes.splice(index,1);
        this.recipesChanged.emit(this.recipes.slice());
        this.storeRecipes()
    }

    storeRecipes() {
        this.dataService.storeRecipes(this.recipes);
    }

    fetchRecipes() {
        this.dataService.fetchRecipes();
    }
}