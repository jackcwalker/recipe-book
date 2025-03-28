import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable, map, startWith } from 'rxjs';
import { tags } from '../recipeSets.model';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-tagselect',
    templateUrl: './tagselect.component.html',
    styleUrls: ['./tagselect.component.css'],
    standalone: false
})
export class TagSelectComponent {
    @Input() selectedTags: string[] = [];
    @Input() searchMode: boolean = false;
    @Output() searchRequest = new EventEmitter<string[]>() ;

    // Tag OBjects
    separatorKeysCodes: number[] = [ENTER, COMMA];
    tagCtrl = new FormControl('');
    filteredTags: Observable<string[]>;
    allTags: string[] = tags;
    @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;

    constructor (private router: Router,
      public route: ActivatedRoute) {
    }

    ngOnInit() {
      this.filteredTags = this.tagCtrl.valueChanges.pipe(
        startWith(null),
        map((tag: string | null) => (tag ? this._filterTags(tag) : this.allTags.slice())),
      );
    }

    ngOnChanges(changes: SimpleChanges) {
      this.onSearchRequest();
    }

    onSearchRequest() {
      if (this.searchMode){
        this.searchRequest.emit(this.selectedTags);
      }
    }

    // ================= Tag Related Methods =================

    addTag(event: MatChipInputEvent): void {
      const value = (event.value || '').trim();
  
      // Add our tag
      if (value) {
        this.selectedTags.push(value);
      }
  
      // Clear the input value
      event.chipInput!.clear();
  
      this.tagCtrl.setValue(null);
      this.onSearchRequest();
    }
  
    removeTag(tag: string): void {
      const index = this.selectedTags.indexOf(tag);
  
      if (index >= 0) {
        this.selectedTags.splice(index, 1);
      }
      this.onSearchRequest();
    }
  
    selectedTag(event: MatAutocompleteSelectedEvent): void {
      this.selectedTags.push(event.option.viewValue);
      this.tagInput.nativeElement.value = '';
      this.tagCtrl.setValue(null);
      this.onSearchRequest();
    }
  
    private _filterTags(value: string): string[] {
      const filterValue = value.toLowerCase();
      return this.allTags.filter(tag => tag.toLowerCase().includes(filterValue));
    }
}
