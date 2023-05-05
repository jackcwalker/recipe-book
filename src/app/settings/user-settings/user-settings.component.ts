import { Component } from '@angular/core';
import { DataStorageService } from 'src/app/shared/data-storage.service';
import { UserService } from 'src/app/shared/user.service';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.css']
})
export class UserSettingsComponent {

  constructor (
    private userService: UserService) {
  }

  getCurrentUserName(){
    return this.userService.currentUser.name;
  }

  getCurrentTags(){
    return this.userService.currentUser.tags;
  }
  

  onSaveAutoFilter(tags: string[]){
    this.userService.saveTags(tags)
  }
}


