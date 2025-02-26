import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { RecipesComponent } from './recipes/recipes.component';
import { RecipeDetailComponent } from './recipes/recipe-detail/recipe-detail.component';
import { RecipeListComponent } from './recipes/recipe-list/recipe-list.component';
import { RecipeItemComponent } from './recipes/recipe-list/recipe-item/recipe-item.component';
import { ShoppingListComponent } from './shopping-list/shopping-list.component';
import { ShoppingEditComponent } from './shopping-list/shopping-edit/shopping-edit.component';
import { DropdownDirective } from './shared/dropdown.directive';
import { ShoppingListService } from './shopping-list/shopping-list.service';
import { AppRoutingModule } from './app-routing.module';
import { RecipeStartComponent } from './recipes/recipe-start/recipe-start.component';
import { RecipeEditComponent } from './recipes/recipe-edit/recipe-edit.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RecipeService } from './recipes/recipe.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MatCheckboxModule} from '@angular/material/checkbox';
import { MatIconModule} from '@angular/material/icon';
import { MatListModule} from '@angular/material/list';
import { MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule} from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatNativeDateModule} from '@angular/material/core';
import { MaterialExampleModule } from './shared/material.module';
import { UiService } from './shared/ui.service';
import { NgxImageCompressService} from 'ngx-image-compress';
import { UserSettingsComponent } from './settings/user-settings/user-settings.component';
import { TagSelectComponent } from './shared/tagselect/tagselect.component';


@NgModule({ declarations: [
        AppComponent,
        HeaderComponent,
        RecipesComponent,
        RecipeDetailComponent,
        RecipeListComponent,
        RecipeItemComponent,
        TagSelectComponent,
        ShoppingListComponent,
        ShoppingEditComponent,
        DropdownDirective,
        RecipeStartComponent,
        RecipeEditComponent,
        UserSettingsComponent
    ],
    exports: [
        MatIconModule
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        AppRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        MatIconModule,
        MatCheckboxModule,
        MatListModule,
        MatFormFieldModule,
        MatInputModule,
        BrowserAnimationsModule,
        MatNativeDateModule,
        MaterialExampleModule], providers: [ShoppingListService, RecipeService, UiService, NgxImageCompressService, provideHttpClient(withInterceptorsFromDi())] })
export class AppModule { }
