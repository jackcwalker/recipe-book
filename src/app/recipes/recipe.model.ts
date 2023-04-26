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
        this.name = name;
        this.description = desc;
        this.imagePath = imagePath;
        this.ingredients = ingredients;
        this.recipeType = recipeType;
        this.serves = serves;
        this.prepTime = prepTime;
        this.cookTime = cookTime;
        this.author = author;
    }
}