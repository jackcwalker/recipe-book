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
  nameSearch = '';

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
      this.filteredRecipes = this.recipes;
      if (params['type'] != null){
        this.filteredRecipes = this.filteredRecipes.filter(recipe => recipe.catagory == params['type']);
      };
      if (params['name'] != null){
        this.filteredRecipes = this.filteredRecipes.filter(recipe => recipe.name.toLowerCase().includes(params['name'].toLowerCase()));
      }
      if (params['tag'] != null){
        for (let tag of params['tag']){
          this.filteredRecipes = this.filteredRecipes.filter(recipe => {
            if (recipe.tags){
              return recipe.tags.includes(tag);
            }
          });
        }
      }
    });
  }

  onNewRecipe() {
    this.router.navigate(['new'], {relativeTo: this.route});
  }

  onNameFilter(nameSearch: string) {
    this.router.navigate(['/recipes'],
      {
        queryParams: { 'name': nameSearch },
        queryParamsHandling: 'merge' 
      }
    );
  }

  onTagFilter(searchTags: string[]) {
    console.log('searching!')
    this.router.navigate(['/recipes'],
      {
        queryParams: { 'tag': searchTags },
        queryParamsHandling: 'merge' 
      }
    );
  }
}
