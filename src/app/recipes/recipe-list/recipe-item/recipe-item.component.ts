import { Component,  Input, OnInit, EventEmitter, Output } from '@angular/core';
import { Recipe } from '../../recipe.model';
import { RecipeService } from '../../recipe.service';

@Component({
    selector: 'app-recipe-item',
    templateUrl: './recipe-item.component.html',
    styleUrls: ['./recipe-item.component.css'],
    standalone: false
})
export class RecipeItemComponent implements OnInit {
  @Input() recipe: Recipe;
  firstImagePath: string;

  constructor (public recipeService: RecipeService) { }

  ngOnInit(): void {
    if (this.recipe) {
      this.recipeService.getThumbPath(this.recipe,this.recipe.images[0])
      .then((value) => {this.firstImagePath = value ? value : null});
    }
  }
}
