import { EventEmitter } from "@angular/core";
import { Ingredient } from "../shared/ingredient.model";

export class ShoppingListService{
    ingredientsChanged = new EventEmitter<Ingredient []>() ;
    startedEditing = new EventEmitter<number>() ;

    ingredients: Ingredient[] = [
        new Ingredient('Eggs', 5),
        new Ingredient('Tomatoes', 10),
    ];

    getIngredient(index: number){
        return this.ingredients[index];
    }

    getIngredients() {
        return this.ingredients.slice();
    }

    addIngredient(ingredient: Ingredient) {
        this.ingredients.push(ingredient);
        this.ingredientsChanged.emit(this.ingredients.slice());
    }

    addIngredients (ingredients: Ingredient [] ) {
        for (let ingredient of ingredients) {
        this.addIngredient (ingredient);
        }
    }
}