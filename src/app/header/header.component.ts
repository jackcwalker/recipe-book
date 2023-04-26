import { Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import { recipeType } from '../shared/recipeType';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})

export class HeaderComponent {
  recipeTypes: string[];
  constructor () {
    this.recipeTypes = Object.values(recipeType);
   }
  ngOnInit(): void {}

}
