import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreatorPage } from './creator.page';

describe('CreatorPage', () => {
  let component: CreatorPage;
  let fixture: ComponentFixture<CreatorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
