import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagSelectComponent } from './tagselect.component';

describe('TagselectComponent', () => {
  let component: TagSelectComponent;
  let fixture: ComponentFixture<TagSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TagSelectComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TagSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
