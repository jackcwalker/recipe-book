import { EventEmitter } from "@angular/core";
import { Ingredient } from "../shared/ingredient.model";

export class ShoppingListService{
    ingredientsChanged = new EventEmitter<Ingredient []>() ;
    startedEditing = new EventEmitter<number>() ;

    ingredients: Ingredient[] = [
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

    updateIngredient(index:  number, newIngredient: Ingredient) {
        this.ingredients[index] = newIngredient;
        this.ingredientsChanged.emit(this.ingredients.slice());
    }

    deleteIngredient(index:  number) {
        this.ingredients.splice(index,1);
        this.ingredientsChanged.emit(this.ingredients.slice());
    }  

    addIngredients (ingredients: Ingredient [] ) {
        for (let ingredient of ingredients) {
        this.addIngredient (ingredient);
        }
    }
}