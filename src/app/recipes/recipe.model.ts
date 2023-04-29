import { Ingredient } from "../shared/ingredient.model";
import { MethodStep } from "../shared/methodStep.model";
import { recipeType } from '../shared/recipeType';

export class Recipe {
    public name: string;
    public method: MethodStep[];
    public imagePath: string;
    public ingredients: Ingredient[];
    public recipeType: recipeType;
    public serves: number;
    public prepTime: number;
    public cookTime: number;
    public author: string;
    public fullImagePath: string;

    constructor(
        name: string, 
        method: MethodStep[], 
        imagePath: string, 
        ingredients: Ingredient[],
        recipeType: recipeType,
        serves: number,
        prepTime: number,
        cookTime: number,
        author: string,
    ) {
        this.name = name;
        this.method = method;
        this.imagePath = imagePath;
        this.ingredients = ingredients;
        this.recipeType = recipeType;
        this.serves = serves;
        this.prepTime = prepTime;
        this.cookTime = cookTime;
        this.author = author;
    }
}