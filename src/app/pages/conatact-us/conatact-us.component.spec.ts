import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConatactUsComponent } from './conatact-us.component';

describe('ConatactUsComponent', () => {
  let component: ConatactUsComponent;
  let fixture: ComponentFixture<ConatactUsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConatactUsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConatactUsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
