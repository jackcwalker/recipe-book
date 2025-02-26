import { Component,  OnInit } from '@angular/core';
import { Recipe } from '../recipe.model';
import { RecipeService } from '../recipe.service';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { UserService } from 'src/app/shared/user.service';
import { User } from 'src/app/shared/user.model';

@Component({
    selector: 'app-recipe-list',
    templateUrl: './recipe-list.component.html',
    styleUrls: ['./recipe-list.component.css'],
    standalone: false
})

export class RecipeListComponent implements OnInit {
  recipes: Recipe[] = [];
  filteredRecipes: Recipe[] = [];
  nameSearch = '';
  currentTags: string[];

  constructor (private recipeService: RecipeService,
    private userService: UserService,
    private router: Router,
    public route: ActivatedRoute) {
  }

  ngOnInit() {
    this.userService.currentUser$.subscribe((user: User)=>{
      if (user.tags){
        this.currentTags = user.tags.slice();
      }
    })
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
    this.router.navigate(['new'], {
      relativeTo: this.route,
      queryParamsHandling: 'merge'
    });
  }

  onNameFilter(nameSearch: string) {
    this.router.navigate([],
      {
        queryParams: { 'name': nameSearch },
        queryParamsHandling: 'merge' 
      }
    );
  }

  onTagFilter(searchTags: string[]) {
    this.router.navigate([],
      {
        queryParams: { 'tag': searchTags },
        queryParamsHandling: 'merge' 
      }
    );
  }
}
