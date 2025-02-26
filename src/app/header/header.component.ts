import { Component} from '@angular/core';
import { recipeType } from '../shared/recipeSets.model';
import { UserService } from '../shared/user.service';
import { UiService } from '../shared/ui.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
    standalone: false
})

export class HeaderComponent {
  recipeTypes: string[];
  allUsers: string[];
  mobileLayout = false;

  constructor(
    private userService: UserService,
    private uiService: UiService
  ) {}

  ngOnInit(): void {
    this.recipeTypes = Object.values(recipeType);
    this.allUsers = this.userService.getAllUsers();
    this.uiService.mobileLayout$
    .subscribe(
    (mobileLayout: boolean) => {
      this.mobileLayout = mobileLayout;
    }
  );
  }

  onSetUser(user:string){
    this.uiService.createTimedSnackBar('Signed In as '+user,2);
    this.userService.setUser(user);
  }

}
