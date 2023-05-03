import { Component } from '@angular/core';
import { Recipe } from '../recipe.model';
import { RecipeService } from '../recipe.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { UiService } from 'src/app/shared/ui.service';

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
  mobileLayout = false;

  constructor (private recipeService: RecipeService, 
    public uiService: UiService,
    private route: ActivatedRoute,
    private router: Router) {
  };

  ngOnInit(){
    combineLatest([
      this.route.params,
      this.recipeService.recipes$
    ]).subscribe(([params, recipes]) => {
      this.id = this.recipeService.getRecipeIndex(params['route']);
      this.recipe = this.recipeService.getRecipe(this.id);
      this.getCurrentImagePath()
    });

    this.uiService.mobileLayout$.subscribe((mobileLayout: boolean) => {
      this.mobileLayout = mobileLayout;
    })
  }

  onAddToShoppingList ( ) {
    this.recipeService.addIngredientsToList(this.recipe.ingredients);
  }

  onFullScreen () {
    this.uiService.togFullScreen();
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
    if (this.recipe) {
      return this.recipeService.getFullImagePath(this.recipe.route,this.getCurrentImage())
      .then((value) => {this.currentImagePath = value ? value : null});
    }
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
