import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagselectComponent } from './tagselect.component';

describe('TagselectComponent', () => {
  let component: TagselectComponent;
  let fixture: ComponentFixture<TagselectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TagselectComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TagselectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
