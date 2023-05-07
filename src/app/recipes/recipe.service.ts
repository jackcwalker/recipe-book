import { EventEmitter, Injectable } from "@angular/core";
import { Recipe } from "./recipe.model";
import { Ingredient } from "../shared/ingredient.model";
import { ShoppingListService } from "../shopping-list/shopping-list.service";
import { DataStorageService } from "../shared/data-storage.service";
import { RecipeImage } from "./recipeImage.model";
import { ReplaySubject, forkJoin, map, switchMap, take } from "rxjs";

@Injectable()
export class RecipeService {
    gotImageDownloadUrl = new EventEmitter<string> ();
    existingNames: string[] = [];
    existingRoutes: string[] = [];
    recipes$ = new ReplaySubject();


    constructor (private dataService: DataStorageService) { 
        this._fetchRecipes();
    }

    getFullImagePath(route: string, image: RecipeImage){
        return this.dataService.getFullImagePath(route,image.path);
    }

    getThumbPath(reipe: Recipe, image: RecipeImage){
        return this.dataService.getFullImagePath(reipe.route+'/thumb/',image.path);
    }

    getRecipe(route: string){
        return this.dataService.getRecipe(route);
    }

    setRecipe(recipe: Recipe, images: RecipeImage[]) {
        console.log('Recipe Service Logger: Setting Recipe: '+recipe.name)
        return this._getRecipes().pipe( switchMap( (recipes) => {
            recipes = this._addRecipe(recipe,recipes);
            return forkJoin(
                [this.dataService.storeRecipe(recipe),
                this.updateImages(recipe.route, images),
                this._pushAndSaveRecipes(recipes)]
            )
        }))
    }

    deleteRecipe(recipe: Recipe) {
        console.log('Recipe Service Logger: Service Deleting Recipe: '+recipe.name)
        this._getRecipes().subscribe( (recipes: Recipe[]) => {
            for (let image of recipe.images){
                this.dataService.deleteFile(recipe.route + '/' + image.path);
                this.dataService.deleteFile(recipe.route + '/thumb/' + image.path);
            }
            const index = this._getRecipeIndex(recipe.route, recipes);
            recipes.splice(index,1);
            this.dataService.deleteRecipe(recipe);
            this._pushAndSaveRecipes(recipes).subscribe( () => {
                console.log('Recipe Service Logger: Deletion Complete')
            }
            );
        })
    }

    checkIfNameExists(name: string) {
        return (this.existingNames.includes(name) || this.existingRoutes.includes(this.formatRoute(name)));
    }

    formatRoute(name: string) {
        return name.replace(/\s/g, '-');
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

    private _fetchRecipes() {
        this._getRecipes().subscribe( (recipes: Recipe[]) => {
            this._pushRecipes(recipes);
        });
    }

    private _pushAndSaveRecipes(recipes: Recipe[]) {
        console.log("Pushing and saving:");
        console.log(recipes);
        this._pushRecipes(recipes);
        return this._storeRecipes(recipes);
    }

    private _pushRecipes(recipes: Recipe[]) {
        if (recipes) {
            recipes.sort((a,b)=>a.name.localeCompare(b.name));
            } else {
            recipes = [];
        }
        this.existingNames = recipes.map( (recipe) => recipe.name).slice();
        this.existingRoutes = recipes.map( (recipe) => recipe.route).slice();
        this.recipes$.next(recipes.slice());
    }

    private _storeRecipes(recipes: Recipe[]) {
        console.log('Recipe Service Logger: Saving Recipes');
        console.log(recipes)
        return this.dataService.storeRecipes(recipes);
    }

    private _getRecipeIndex(route:string, recipes:Recipe[]) {
        for (let i = 0; i < recipes.length; i++) {
            if (recipes[i].route == route) {
                return i;
            }
        }
        return null;
    }

    private _addRecipe(newRecipe: Recipe, recipes: Recipe[]) {
        const index = this._getRecipeIndex(newRecipe.route, recipes);
        if (index != null) {
            recipes[index] = newRecipe;
        } else {
            recipes.push(newRecipe);
        }
        return recipes;
    }

    private _getRecipes () {
        return this.dataService.fetchRecipes().pipe(take(1));
    }
}