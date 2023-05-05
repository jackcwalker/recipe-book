import { EventEmitter, Injectable } from "@angular/core";
import { Recipe } from "./recipe.model";
import { Ingredient } from "../shared/ingredient.model";
import { ShoppingListService } from "../shopping-list/shopping-list.service";
import { DataStorageService } from "../shared/data-storage.service";
import { RecipeImage } from "./recipeImage.model";
import { ReplaySubject } from "rxjs";

@Injectable()
export class RecipeService {
    gotImageDownloadUrl = new EventEmitter<string> ();
    
    recipes$ = new ReplaySubject();
    
    private recipes: Recipe[] = [];


    constructor (private slService: ShoppingListService, private dataService: DataStorageService) { 
        this.dataService.fetchRecipes()
        .subscribe(
          (recipes: Recipe[]) => {
            console.log("Recipe Service Logger: Recipes Downloaded");
            console.log(this.recipes);
            this.setRecipes(recipes);
          }
        )
    }

    setRecipes (recipes: Recipe[]) {
        if (recipes) {
            this.recipes = recipes.sort((a,b)=>a.name.localeCompare(b.name));
        } else {
            this.recipes = []
        }
        this.recipes$.next(this.recipes.slice());
    }

    saveAndPushRecipes() {
        console.log('Recipe Service Logger: Saving & Pushing!');
        this.recipes$.next(this.recipes.slice());
        this.dataService.storeRecipes(this.recipes);
    }

    getFullImagePath(route: string, image: RecipeImage){
        return this.dataService.getFullImagePath(route,image.path);
    }

    getThumbPath(reipe: Recipe, image: RecipeImage){
        return this.dataService.getFullImagePath(reipe.route+'/thumb/',image.path);
    }

    addIngredientsToList(ingredients: Ingredient[]) {
        this.slService.addIngredients(ingredients);
    }

    getRecipeIndex(route:string) {
        for (let i = 0; i < this.recipes.length; i++) {
            if (this.recipes[i].route == route) {
                return i;
            }
        }
    }

    getRecipe (index: number) {
        return this.recipes[index];
    }

    addRecipe(recipe: Recipe, images: RecipeImage[]) {
        console.log('Recipe Service Logger:  Adding Recipe: '+recipe.name)
        this.recipes.push(recipe);
        return this.updateImages(recipe.route, images).then(()=>{
            console.log('Recipe Service Logger: Images Updated');
            this.saveAndPushRecipes();
        });
    }

    updateRecipe(newRecipe: Recipe, images: RecipeImage[]) {
        console.log('Recipe Service Logger:  Editing Recipe: '+ newRecipe.name)
        const index = this.getRecipeIndex(newRecipe.route);
        this.recipes[index] = newRecipe;
        return this.updateImages(newRecipe.route, images).then(()=>{
            console.log('Recipe Service Logger: Images Updated');
            this.saveAndPushRecipes();
        });
    }

    private updateImages(route: string, images: RecipeImage[]){
        console.log('Recipe Service Logger: Updating Images');
        const dataOperations: Promise<any>[] = [];

        for (let image of images) {
            const fullPath = route + '/' + image.name;
            const thumbPath = route + '/thumb/' + image.name;
            if (image.toBeCreated && !image.toBeDeleted) {
                console.log('Recipe Service Logger: Uploading new image: '+fullPath);
                dataOperations.push(this.dataService.uploadCompressedFile(fullPath,image.file));
                dataOperations.push(this.dataService.uploadThumnail(thumbPath,image.file));
            } else if (!image.toBeCreated && image.toBeDeleted) {
                console.log('Recipe Service Logger: Deleting image: '+fullPath);
                dataOperations.push(this.dataService.deleteFile(fullPath));
                dataOperations.push(this.dataService.deleteFile(thumbPath));
            }
        }
        return Promise.all(dataOperations);
      }

    deleteRecipe(recipe: Recipe) {
        const index = this.getRecipeIndex(recipe.route);
        console.log("Recipe Service Logger: Service Deleting Recipe: " + this.recipes[index].name);
        for (let image of this.recipes[index].images){
            this.dataService.deleteFile(this.recipes[index].route + '/' + image.path);
            this.dataService.deleteFile(this.recipes[index].route + '/thumb/' + image.path);
        }
        this.recipes.splice(index,1);
        this.saveAndPushRecipes();
    }

    storeRecipes() {
        this.dataService.storeRecipes(this.recipes);
    }

    fetchRecipes() {
        return this.dataService.fetchRecipes();
    }

    checkIfNameExists(name: string) {
        let existingNames = this.recipes.map((recipe) => recipe.name);
        let existingRoutes = this.recipes.map((recipe) => recipe.route);
        return (existingNames.includes(name) || existingRoutes.includes(this.formatRoute(name)));
    }

    formatRoute(name: string) {
        return name.replace(/\s/g, '-');
    }
}