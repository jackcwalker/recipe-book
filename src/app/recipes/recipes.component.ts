import { Component, OnInit } from '@angular/core';
import { Recipe } from './recipe.model';
import { RecipeService } from './recipe.service';

@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.css'],
})
export class RecipesComponent implements OnInit {
  selectedRecipe: Recipe;
  fullScreen: boolean;
  
  constructor (private recipeService: RecipeService) { }

  ngOnInit(): void {
    this.recipeService.recipeSelected
      .subscribe(
      (recipe: Recipe) => {
        this.selectedRecipe = recipe;
      }
    );
    this.recipeService.fullScreenChanged
    .subscribe(
    (fullScreen: boolean) => {
      this.fullScreen = fullScreen;
    }
  );
  }

}
