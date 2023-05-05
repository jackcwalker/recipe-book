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
        this.dataService.loadUsers().subscribe((users)=>{
            this.userTable = users;
            this.loadCookieUser();
        });
        
    }

    setUser(user: string){
        this.cookieService.set('User', user);
        this.setCurrentUser(user);
        console.log('User Service: User cookie set as '+user);
    }

    setCurrentUser(username: string){
        const index = this.getUserIndex(username);
        if (this.getUserIndex(username) != null){
            this.currentUser = this.userTable[index];
            console.log('User Service: Current user is '+this.currentUser.name);
        } else{
            this.currentUser = new User(username);
            this.userTable.push(this.currentUser);
            console.log('User Service: Add new user '+this.currentUser.name);
            this.dataService.saveUsers(this.userTable);
        }
    }

    loadCookieUser(){
        const username = this.cookieService.get('User');
        if (username){
            this.setCurrentUser(username);
        } else {
            this.currentUser = null
            console.log('User Service: No User Cookie Found');
        }
    }

    getUserIndex(name:string) {
        for (let i = 0; i < this.userTable.length; i++) {
            if (this.userTable[i].name == name) {
                return i;
            }
        }
        console.log('User Service: User not found in table');
        return null;
    }

    getAllUsers(){
        return users;
    }

    saveTags(tags: string[]){
        this.currentUser.tags=tags;
        console.log('User Service: Saving tags for' + this.currentUser.name + this.currentUser.tags);
        this.dataService.saveUsers(this.userTable);
    }
}