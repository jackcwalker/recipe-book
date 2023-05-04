import { Component} from '@angular/core';
import { RecipeService } from '../recipes/recipe.service';
import { recipeType } from '../shared/recipeSets.model';
import { UserService } from '../shared/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})

export class HeaderComponent {
  recipeTypes: string[];
  allUsers: string[];

  constructor(
    private recipeService: RecipeService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.recipeTypes = Object.values(recipeType);
    this.allUsers = this.userService.getAllUsers();
  }

  onSetUser(user:string){
    this.userService.setUser(user);
  }

}
