import { Ingredient } from "../shared/ingredient.model";
import { recipeType } from '../shared/recipeType';

export class Recipe {
    public name: string;
    public description: string;
    public imagePath: string;
    public ingredients: Ingredient[];
    public recipeType: recipeType;
    public serves: number;
    public prepTime: number;
    public cookTime: number;
    public author: string;


    constructor(
        name: string, 
        desc: string, 
        imagePath: string, 
        ingredients: Ingredient[],
        recipeType: recipeType,
        serves: number,
        prepTime: number,
        cookTime: number,
        author: string,
    ) {
        const base = "https://firebasestorage.googleapis.com/v0/b/recipe-book-85758.appspot.com/o/";
        const key = "?alt=media&token=76e5d494-980e-45e2-b708-0a2118f78770"

        this.name = name;
        this.description = desc;
        this.imagePath = base + imagePath + key;
        this.ingredients = ingredients;
        this.recipeType = recipeType;
        this.serves = serves;
        this.prepTime = prepTime;
        this.cookTime = cookTime;
        this.author = author;
    }
}