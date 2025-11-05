import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { App } from './app';
import { GameMode } from './models/game-modes.models';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have correct title', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app.title).toBe('Lixso - Logic Puzzle Game');
  });

  it('should start with game view', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app.currentView).toBe('game');
  });

  it('should handle mode selection', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    app.onModeSelected({ mode: GameMode.TIME_ATTACK, difficulty: 5 });

    expect(app.selectedMode).toBe(GameMode.TIME_ATTACK);
    expect(app.selectedDifficulty).toBe(5);
    expect(app.currentView).toBe('game');
  });

  it('should navigate to highscores', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    app.onViewHighscores();

    expect(app.currentView).toBe('highscores');
  });

  it('should navigate to tournaments', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    app.onViewTournaments();

    expect(app.currentView).toBe('tournaments');
  });

  it('should navigate back to menu', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    app.currentView = 'game';
    app.backToMenu();

    expect(app.currentView).toBe('menu');
  });

  it('should have default game mode as CLASSIC', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    expect(app.selectedMode).toBe(GameMode.CLASSIC);
  });

  it('should have default difficulty of 3', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    expect(app.selectedDifficulty).toBe(3);
  });
});
