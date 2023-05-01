import { Ingredient } from "../shared/ingredient.model";
import { MethodStep } from "../shared/methodStep.model";
import { recipeType } from '../shared/recipeType';
import { RecipeImage } from "./recipeImage.model";

export class Recipe {
    public name: string;
    public method: MethodStep[];
    public images: RecipeImage[];
    public ingredients: Ingredient[];
    public catagory: recipeType;
    public serves: number;
    public prep: number;
    public cook: number;
    public author: string;

    constructor(
        name: string, 
        method: MethodStep[], 
        images: RecipeImage[], 
        ingredients: Ingredient[],
        catagory: recipeType,
        serves: number,
        prepTime: number,
        cookTime: number,
        author: string,
    ) {
        this.name = name;
        this.method = method;
        this.images = images;
        this.ingredients = ingredients;
        this.catagory = catagory;
        this.serves = serves;
        this.prep = prepTime;
        this.cook = cookTime;
        this.author = author;
    }
}