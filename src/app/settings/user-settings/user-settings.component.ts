import { Component } from '@angular/core';
import { UiService } from 'src/app/shared/ui.service';
import { User } from 'src/app/shared/user.model';
import { UserService } from 'src/app/shared/user.service';

@Component({
    selector: 'app-user-settings',
    templateUrl: './user-settings.component.html',
    styleUrls: ['./user-settings.component.css'],
    standalone: false
})
export class UserSettingsComponent {
  currentName: string = null
  currentTags: string[] = []
  constructor (
    private userService: UserService,
    private uiService: UiService) {
      this.userService.currentUser$.subscribe((user: User)=>{
        this.currentName = user.name;
        if (user.tags){
          this.currentTags = user.tags.slice();
        }
      })
  }
  
  onSaveAutoFilter(tags: string[]){
    this.userService.saveTags(tags)
    this.uiService.createTimedSnackBar('Tags Saved!',2);
  }
}


