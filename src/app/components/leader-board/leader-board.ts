import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { LeaderBoardService, ScoreEntry } from '../../services/leader-board/leader-board';

@Component({
  selector: 'app-leader-board',
  standalone: true,
  templateUrl: './leader-board.html',
  styleUrl: './leader-board.scss',
  imports: [
    CommonModule,   // *ngFor / *ngIf
    FormsModule,    // [(ngModel)]
    DatePipe        // | date
  ]
})
export class LeaderBoardComponent {
  entries: ScoreEntry[] = [];
  name = '';

  constructor(private lb: LeaderBoardService) {
    this.refresh();
  }

  refresh(): void {
    this.entries = this.lb.getAll();
  }

  save(scoreInput: HTMLInputElement): void {
    const raw = scoreInput.value.trim();
    const score = Number(raw);
    if (!Number.isFinite(score)) return;

    this.lb.add({
      name: this.name || 'Player',
      score,
      date: new Date().toISOString()
    });

    this.name = '';
    scoreInput.value = '';
    this.refresh();
  }
}
