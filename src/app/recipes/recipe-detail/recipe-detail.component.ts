import { Component } from '@angular/core';
import { Recipe } from '../recipe.model';
import { RecipeService } from '../recipe.service';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, switchMap } from 'rxjs';
import { UiService } from 'src/app/shared/ui.service';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from 'src/app/shared/user.service';
import { User } from 'src/app/shared/user.model';
import { ShoppingListService } from 'src/app/shopping-list/shopping-list.service';
import { FormControl, Validators } from '@angular/forms';
import { RecipeComment } from 'src/app/shared/recipeComment.model';

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
  userCanEdit = false;
  currentUsername: string = null;
  commentForm = new FormControl('', Validators.required);

  constructor (private recipeService: RecipeService, 
    private uiService: UiService,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    public dialog: MatDialog,
    private slService: ShoppingListService) {
  };

  ngOnInit(){

    combineLatest([
      this.route.params,
      this.recipeService.recipes$,
    ]).pipe( switchMap( ([params, recipes]) => this.recipeService.getRecipe(params['route'])))
    .subscribe( (recipe: Recipe) => {
        this.recipe = recipe;
        this.getCurrentImagePath()
        this.imageIndex = 0;
        this.setUserPermissions()
    });
    
    this.userService.currentUser$.subscribe((user: User)=>{
      if (user){
        this.currentUsername=user.name;
      } else{
        this.currentUsername=null;
      }
      this.setUserPermissions()
    })
      
    this.uiService.mobileLayout$.subscribe((mobileLayout: boolean) => {
      this.mobileLayout = mobileLayout;
      this.uiService.setFullScreen(mobileLayout);
    })
  }

  setUserPermissions() {
    if (this.currentUsername != null && this.recipe != null) {
      this.userCanEdit = (this.recipe.author === this.currentUsername);
    }
  }
  onAddToShoppingList() {
    this.slService.addIngredients(this.recipe.ingredients);
  }

  onFullScreen() {
    this.uiService.togFullScreen();
  }

  onEditRecipe() {
    this.router.navigate(['edit'], {
      relativeTo: this.route,
      queryParamsHandling: 'merge'
    });
  }

  onDeleteRecipe() {
    if(confirm("Are you sure to delete "+this.recipe.name+"?")) {
      this.recipeService.deleteRecipe(this.recipe);
      this.router.navigate(['/recipes'],{
        queryParamsHandling: 'merge'
      });
    }
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

  onCopy() {
    let url = document.location.href
    navigator.clipboard.writeText(url).then(function() {
        console.log('URL Copied!');
    }, function() {
        console.log('Copy error')
    });
  }

  onSubmitComment() {
    let commenter = this.currentUsername;
    if (this.currentUsername == null) {
      commenter = 'Anonymous';
    }
    this.recipeService.addComment(this.recipe, new RecipeComment(commenter, this.commentForm.value)).subscribe(()=>{
      this.commentForm.setValue('');
      console.log('Recipe Detail Logger: Added comment');
      this.uiService.createTimedSnackBar('Successfully Added Comment',2)
  });
  }

}
