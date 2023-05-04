import {CookieService} from 'ngx-cookie-service';
import {Injectable} from '@angular/core';
import { users } from './recipeSets.model';


@Injectable ({ providedIn: 'root' })

export class UserService {
    user: string = null;
    
    constructor(private cookieService: CookieService) {
        this.loadUser();
    }

    setUser(user: string){
        this.cookieService.set('User', user);
        console.log('Setting User: '+this.user);
    }

    loadUser(){
        if (this.cookieService.get('User')){
            this.user = this.cookieService.get('User');
            console.log('Got User: '+this.user);
        }
        console.log('No User Cookie Found');
    }

    getAllUsers(){
        return users;
    }
}