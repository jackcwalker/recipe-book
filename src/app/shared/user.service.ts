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
            this.getCurrentUser();
        });
        
    }

    setUser(user: string){
        this.cookieService.set('User', user);
        console.log('Setting User: '+this.currentUser.name);
    }

    getCurrentUser(){
        const username = this.cookieService.get('User');
        const index = this.getUserIndex(username);
        if (username){
            if (this.getUserIndex(username) != null){
                this.currentUser = this.userTable[index];
                console.log('Got User: '+this.currentUser.name);
            } else{
                this.currentUser = new User(username);
                this.userTable.push(this.currentUser);
                console.log('Added User: '+this.currentUser.name);
                this.dataService.saveUsers(this.userTable);
            }
        } else {
            this.currentUser = null
            console.log('No User Cookie Found');
        }
    }

    getUserIndex(name:string) {
        for (let i = 0; i < this.userTable.length; i++) {
            if (this.userTable[i].name == name) {
                console.log('User found'+i);
                return i;
            }
        }
        console.log('User not found');
        return null;
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