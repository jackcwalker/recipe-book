import {CookieService} from 'ngx-cookie-service';
import {Injectable} from '@angular/core';
import { users } from './recipeSets.model';
import { User } from './user.model';
import { DataStorageService } from './data-storage.service';


@Injectable ({ providedIn: 'root' })

export class UserService {
    currentUser: User = null;
    private userTable: User[] =[];
    
    constructor(
        private cookieService: CookieService,
        private dataService: DataStorageService
    ) {
        this.loadUser();
    }

    setUser(user: string){
        this.cookieService.set('User', user);
        console.log('Setting User: '+this.currentUser.name);
    }

    loadUser(){
        if (this.cookieService.get('User')){
            this.currentUser = new User(this.cookieService.get('User'));
            console.log('Got User: '+this.currentUser.name);
        }
        console.log('No User Cookie Found');
    }

    getAllUsers(){
        return users;
    }

    saveTags(tags: string[]){
        this.currentUser.tags=tags;
        this.userTable.push(this.currentUser);
        this.dataService.saveUsers(this.userTable);
    }
}