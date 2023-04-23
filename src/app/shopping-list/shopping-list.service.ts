import { Ingredient } from "../shared/ingredient.model";

export class ShoppingListService{
    ingredients: Ingredient[] = [
        new Ingredient('Eggs', 5),
        new Ingredient('Tomatoes', 10),
    ];

    getIngredients () {
        return this.ingredients.slice();
    }
}