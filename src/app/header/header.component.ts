import { Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import { recipeType } from '../shared/recipeType';
import { DataStorageService } from '../shared/data-storage.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})

export class HeaderComponent {
  recipeTypes: string[];
  constructor(private dataStorageService: DataStorageService) {
    this.recipeTypes = Object.values(recipeType);
   }
  ngOnInit(): void {}
  onSaveData() {
    this.dataStorageService.storeRecipes();
  }

}
