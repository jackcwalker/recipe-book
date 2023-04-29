import { Component} from '@angular/core';
import { recipeType } from '../shared/recipeType';
import { RecipeService } from '../recipes/recipe.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})

export class HeaderComponent {
  recipeTypes: string[];
  constructor(private recipeService: RecipeService) {
    this.recipeTypes = Object.values(recipeType);
   }
  ngOnInit(): void {}
  onSaveData() {
    this.recipeService.storeRecipes();
  }
  onFetchData() {
    this.recipeService.fetchRecipes();
  }

}
