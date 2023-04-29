import { EventEmitter, Injectable } from "@angular/core";
import { Recipe } from "./recipe.model";
import { Ingredient } from "../shared/ingredient.model";
import { ShoppingListService } from "../shopping-list/shopping-list.service";

@Injectable()
export class RecipeService {
    recipeSelected = new EventEmitter<Recipe> ();
    recipesChanged = new EventEmitter<Recipe[]>();
    fullScreenChanged = new EventEmitter<boolean> ();
    fullScreen: boolean = false;
    
    private recipes: Recipe[] = [];


    constructor (private slService: ShoppingListService) { }

    getRecipes() {
        return this.recipes.slice();
    }

    setRecipes (recipes: Recipe[]) {
        this.recipes = recipes;
        for (var recipe of recipes) {
            recipe.fullImagePath = this.getFullImagePath(recipe.imagePath);
        }
        this.recipesChanged.emit(this.recipes.slice());
    }

    getFullImagePath(path: string){
        const base = "https://firebasestorage.googleapis.com/v0/b/recipe-book-85758.appspot.com/o/";
        const key = "?alt=media&token=76e5d494-980e-45e2-b708-0a2118f78770"
        return (base + path + key);
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
    }

    updateRecipe(index: number, newRecipe: Recipe) {
        newRecipe.fullImagePath = this.getFullImagePath(newRecipe.imagePath);
        this.recipes[index] = newRecipe;
        this.recipesChanged.emit(this.recipes.slice());
    }

    deleteRecipe(index: number) {
        this.recipes.splice(index,1);
        this.recipesChanged.emit(this.recipes.slice());
    }
}