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
    
    private  recipes: Recipe[] = [];


    constructor (private slService: ShoppingListService, private dataService: DataStorageService) { }

    getRecipes() {
        return this.recipes.slice();
    }

    setRecipes (recipes: Recipe[]) {
        this.recipes = recipes;
        for (var recipe of recipes) {
            recipe.fullImagePath = this.dataService.getFullImagePath(recipe.imagePath);
        }
        this.recipesChanged.emit(this.recipes.slice());
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
        this.recipesChanged.emit(this.recipes.slice());
    }

    updateRecipe(index: number, newRecipe: Recipe) {
        this.recipes[index] = newRecipe;
        this.recipesChanged.emit(this.recipes.slice());
    }

    deleteRecipe(index: number) {
        this.recipes.splice(index,1);
        this.recipesChanged.emit(this.recipes.slice());
    }
}