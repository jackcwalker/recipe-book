import { EventEmitter, Injectable } from "@angular/core";
import { Recipe } from "./recipe.model";
import { Ingredient } from "../shared/ingredient.model";
import { ShoppingListService } from "../shopping-list/shopping-list.service";
import { recipeType } from '../shared/recipeType';

@Injectable()
export class RecipeService {
    recipeSelected = new EventEmitter<Recipe> ();
    recipesChanged = new EventEmitter<Recipe[]>();
    fullScreenChanged = new EventEmitter<boolean> ();
    fullScreen: boolean = false;
    
    private  recipes: Recipe[] = [
        new Recipe('Chicken Biryani', 
        'This is simply biryani', 
        'https://geekrobocook.com/wp-content/uploads/2021/05/Muradabadi-chicken-biryani-1200x900.jpg', 
        [
            new Ingredient('Chicken',1),
            new Ingredient('Rice',20)
        ],
        recipeType.main,
        4,
        15,
        35,
        'Jack'),
        new Recipe('Pina Colada Smoothie', 
        'The Best Smoothie', 
        'https://geekrobocook.com/wp-content/uploads/2021/05/Muradabadi-chicken-biryani-1200x900.jpg', 
        [
            new Ingredient('Pinapple',1),
            new Ingredient('Coconut',1),
            new Ingredient('Protein Powder',1)
        ],
        recipeType.smoothie,
        4,
        15,
        35,
        'Jack'),
        new Recipe('Chicken noodles', 
        'This is simply noodles', 
        'https://www.licious.in/blog/wp-content/uploads/2020/12/Sesame-Chicken-Noodles.jpg',
        [
            new Ingredient('Chicken',1),
            new Ingredient('Noodle',18)
        ],
        recipeType.main,
        4,
        15,
        35,
        'Jack'),
    ];

    constructor (private slService: ShoppingListService) { }

    getRecipes() {
        return this.recipes.slice();
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