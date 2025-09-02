import { Injectable } from '@angular/core';

export interface ScoreEntry { 
  name: string; 
  score: number; 
  date: string; 
}

@Injectable({ 
  providedIn: 'root' 
})

export class LeaderBoardService {
  private key = 'ball-drop-leaderboard';

  /* Store/retrieve from localStorage for simplicity */
  getAll(): ScoreEntry[] {
    try { 
      return JSON.parse(localStorage.getItem(this.key) || '[]'); 
    }
    catch { 
      return []; 
    }
  }
  
  add(entry: ScoreEntry): void {
    const list = this.getAll();
    list.push(entry);
    list.sort((a,b) => b.score - a.score);
    localStorage.setItem(this.key, JSON.stringify(list.slice(0, 20)));
  }
}
