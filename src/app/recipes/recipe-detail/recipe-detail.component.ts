import { Component } from '@angular/core';
import { Recipe } from '../recipe.model';
import { RecipeService } from '../recipe.service';
import { ActivatedRoute, Params, Router } from '@angular/router';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css']
})
export class RecipeDetailComponent {
  recipe: Recipe;
  id: number;
  methodChecked = new Map();
  imageIndex = 0;
  currentImagePath: string;

  constructor (private recipeService: RecipeService, 
    private route: ActivatedRoute,
    private router: Router) { }

  onAddToShoppingList ( ) {
    this.recipeService.addIngredientsToList(this.recipe.ingredients);
  }

  onFullScreen () {
    this.recipeService.setFullScreen(!this.recipeService.fullScreen);
  }

  ngOnInit(){
    this.route.params.subscribe(
      (params: Params) => {
        this.id = this.recipeService.getRecipeIndex(params['name']);
        this.recipe = this.recipeService.getRecipe(this.id);
        this.recipeService.setFullScreen(true);
        this.getCurrentImagePath()
      }
    )
    this.recipeService.recipesChanged.subscribe(
      () => {
        this.recipe = this.recipeService.getRecipe(this.id);
        this.getCurrentImagePath()
      }
    )
  }

  onEditRecipe() {
    this.router.navigate(['edit'], {relativeTo: this.route});
  }

  onDeleteRecipe() {
    this.recipeService.deleteRecipe(this.id);
    this.router.navigate(['/recipes']);
  }

  togChecked(index: number) {
    if (this.methodChecked.has(index)){
      this.methodChecked.set(index,!this.methodChecked.get(index));
    } else{
      this.methodChecked.set(index,true)
    }
    
  }

  getCheckedClass(index: number){
    if (this.methodChecked.get(index)) {
      return 'grayout';
    }
  }

  getCurrentImage() {
    return this.recipe.images[this.imageIndex];
  }

  getCurrentImagePath() {
    return this.recipeService.getFullImagePath(this.recipe.name,this.getCurrentImage())
    .then((value) => {this.currentImagePath = value ? value : null});
  }

  onPreviousImage() {
    if (this.imageIndex-1 < 0){
      this.imageIndex = this.recipe.images.length-1;
    } else {
      this.imageIndex = 0;
    }
    this.getCurrentImagePath();
  }

  onNextImage() {
    if (this.imageIndex+1 <= this.recipe.images.length-1){
      this.imageIndex = this.imageIndex+1;
    } else {
      this.imageIndex = 0;
    }
    this.getCurrentImagePath();
  }

}
