import { EventEmitter, Injectable } from "@angular/core";
import { Recipe } from "./recipe.model";
import { Ingredient } from "../shared/ingredient.model";
import { ShoppingListService } from "../shopping-list/shopping-list.service";

@Injectable()
export class RecipeService {
    recipeSelected = new EventEmitter<Recipe> ();
    
    private  recipes: Recipe[] = [
        new Recipe('Chicken Biryani', 'This is simply biryani', 'https://geekrobocook.com/wp-content/uploads/2021/05/Muradabadi-chicken-biryani-1200x900.jpg', [
            new Ingredient('Chicken',1),
            new Ingredient('Rice',20)
        ]),
        new Recipe('Chicken noodles', 'This is simply noodles', 'https://www.licious.in/blog/wp-content/uploads/2020/12/Sesame-Chicken-Noodles.jpg',[
            new Ingredient('Chicken',1),
            new Ingredient('Noodle',18)
        ])
    ];

    constructor (private slService: ShoppingListService) { }

    getRecipes () {
        return this.recipes.slice();
    }
    addIngredientsToList (ingredients: Ingredient []) {
        this.slService.addIngredients(ingredients);
    }
}