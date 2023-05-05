import { Component } from '@angular/core';
import { User } from 'src/app/shared/user.model';
import { UserService } from 'src/app/shared/user.service';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.css']
})
export class UserSettingsComponent {
  currentName: string = null
  currentTags: string[] = []
  constructor (
    private userService: UserService) {
      this.userService.currentUser$.subscribe((user: User)=>{
        this.currentName = user.name;
        this.currentTags = user.tags.slice();
      })
  }
  
  onSaveAutoFilter(tags: string[]){
    this.userService.saveTags(tags)
  }
}


