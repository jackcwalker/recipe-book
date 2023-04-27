import { Component } from '@angular/core';
import { Recipe } from '../recipe.model';
import { RecipeService } from '../recipe.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DataStorageService } from 'src/app/shared/data-storage.service';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css']
})
export class RecipeDetailComponent {
  recipe: Recipe;
  id: number;
  image: HTMLElement;

  constructor (private recipeService: RecipeService, 
    private dataStorageService: DataStorageService,
    private route: ActivatedRoute,
    private router: Router) { }

  onAddToShoppingList ( ) {
    this.recipeService.addIngredientsToList(this.recipe.ingredients);
  }

  onFullScreen ( ) {
    this.recipeService.toggleFullScreen();
  }

  ngOnInit(){
    this.route.params.subscribe(
      (params: Params) => {
        this.id = +params['id'];
        this.recipe = this.recipeService.getRecipe(this.id);
      }
    )
    this.image = this.dataStorageService.downloadFile()
  }

  onEditRecipe() {
    this.router.navigate(['edit'], {relativeTo: this.route});
  }

  onDeleteRecipe() {
    this.recipeService.deleteRecipe(this.id);
    this.router.navigate(['/recipes']);
  }
}
