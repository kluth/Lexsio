import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { LTile } from './l-tile';

describe('LTile Component', () => {
  let component: LTile;
  let fixture: ComponentFixture<LTile>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LTile],
    });

    fixture = TestBed.createComponent(LTile);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement).toBeTruthy();
  });
});
