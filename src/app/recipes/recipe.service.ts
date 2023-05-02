import { EventEmitter, Injectable } from "@angular/core";
import { Recipe } from "./recipe.model";
import { Ingredient } from "../shared/ingredient.model";
import { ShoppingListService } from "../shopping-list/shopping-list.service";
import { DataStorageService } from "../shared/data-storage.service";
import { RecipeImage } from "./recipeImage.model";

@Injectable()
export class RecipeService {
    recipeSelected = new EventEmitter<Recipe> ();
    recipesChanged = new EventEmitter<Recipe[]>();
    fullScreenChanged = new EventEmitter<boolean> ();
    gotImageDownloadUrl = new EventEmitter<string> ();
    fullScreen: boolean = false;
    
    private recipes: Recipe[] = [];


    constructor (private slService: ShoppingListService, private dataService: DataStorageService) { 
        this.dataService.recipesDownloaded
        .subscribe(
          (recipes: Recipe[]) => {
            console.log("Logger: Recipe Downloaded");
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
            this.recipesChanged.emit(this.recipes.slice());
        }
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
            if (this.recipes[i].name = name) {
                return i;
            }
        }
    }

    getRecipe (index: number) {
        return this.recipes[index];
    }

    addRecipe(recipe: Recipe) {
        this.recipes.push(recipe);
        this.recipesChanged.emit(this.recipes.slice());
        this.storeRecipes()
    }

    updateRecipe(index: number, newRecipe: Recipe) {
        this.recipes[index] = newRecipe;
        this.recipesChanged.emit(this.recipes.slice());
        this.storeRecipes()
    }

    deleteRecipe(index: number) {
        console.log("Logger: Deleting Recipe" + this.recipes[index].name);
        for (let image of this.recipes[index].images){
            this.dataService.deleteFile(this.getRecipeRoute(this.recipes[index].name) + '/' + image.path);
        }
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