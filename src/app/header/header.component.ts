import { Component} from '@angular/core';
import { recipeType } from '../shared/recipeSets.model';
import { UserService } from '../shared/user.service';
import { UiService } from '../shared/ui.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})

export class HeaderComponent {
  recipeTypes: string[];
  allUsers: string[];

  constructor(
    private userService: UserService,
    private uiService: UiService
  ) {}

  ngOnInit(): void {
    this.recipeTypes = Object.values(recipeType);
    this.allUsers = this.userService.getAllUsers();
  }

  onSetUser(user:string){
    this.uiService.createTimedSnackBar('Signed In',2);
    this.userService.setUser(user);
  }

}
