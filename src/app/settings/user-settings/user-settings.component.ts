import { Component } from '@angular/core';
import { User } from 'src/app/shared/user.model';
import { UserService } from 'src/app/shared/user.service';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.css']
})
export class UserSettingsComponent {
  currentUser: User = null
  constructor (
    private userService: UserService) {
      this.userService.currentUser$.subscribe((user: User)=>{
        this.currentUser = user;
      })
  }
  
  onSaveAutoFilter(tags: string[]){
    this.userService.saveTags(tags)
  }
}


