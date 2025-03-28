import { Component, OnInit } from '@angular/core';
import { RecipeService } from './recipe.service';
import { UiService } from '../shared/ui.service';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-recipes',
    templateUrl: './recipes.component.html',
    styleUrls: ['./recipes.component.css'],
    standalone: false
})
export class RecipesComponent implements OnInit {
  fullScreen: boolean;
  
  constructor (private recipeService: RecipeService, 
    private uiService: UiService,
    private route: ActivatedRoute,) { }

  ngOnInit(): void {
    this.uiService.fullScreen$
      .subscribe(
      (fullScreen: boolean) => {
        this.fullScreen = fullScreen;
      }
    );

    this.route.params
    .subscribe((params) => {
      if (params['route'] == null){
        this.uiService.setFullScreen(false);
      }
    });
  }

  

}
