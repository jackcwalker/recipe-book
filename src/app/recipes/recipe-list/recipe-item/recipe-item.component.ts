import { Component,  Input, OnInit, EventEmitter, Output } from '@angular/core';
import { Recipe } from '../../recipe.model';
import { RecipeService } from '../../recipe.service';

@Component({
  selector: 'app-recipe-item',
  templateUrl: './recipe-item.component.html',
  styleUrls: ['./recipe-item.component.css']
})
export class RecipeItemComponent implements OnInit {
  @Input() recipe: Recipe;
  @Input ( ) index: number;
  firstImagePath: string;

  constructor (public recipeService: RecipeService) { }

  ngOnInit(): void {
    this.recipeService.getFullImagePath(this.recipe.name,this.recipe.images[0])
    .then((value) => {this.firstImagePath = value ? value : null});
  }

}
