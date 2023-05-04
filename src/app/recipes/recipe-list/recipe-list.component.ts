import { Component,  OnInit } from '@angular/core';
import { Recipe } from '../recipe.model';
import { RecipeService } from '../recipe.service';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css']
})
export class RecipeListComponent implements OnInit {
  recipes: Recipe[] = [];
  filteredRecipes: Recipe[] = [];

  constructor (private recipeService: RecipeService,
    private router: Router,
    public route: ActivatedRoute) {
  }

  ngOnInit() {
    combineLatest([
      this.route.queryParams,
      this.recipeService.recipes$
    ]).subscribe(([params, recipes]) => {
      this.recipes = (<Recipe[]> recipes);
      console.log('query params:')
      console.log(params)
      if (params['type'] != null){
        this.filteredRecipes = this.recipes.filter(recipe => { 
          recipe.catagory === params['type']
        });
      } else {
        this.filteredRecipes = this.recipes;
      }
    });
  }

  onNewRecipe() {
    this.router.navigate(['new'], {relativeTo: this.route});
  }

}
