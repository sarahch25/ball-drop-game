import { Routes } from '@angular/router';
import { GamePageComponent } from './pages/game-page/game-page';
import { LeaderBoardComponent } from './components/leader-board/leader-board';


export const routes: Routes = [
  { path: '', component: GamePageComponent },
  { path: 'leaderboard', component: LeaderBoardComponent },
  { path: '**', redirectTo: '' }
];
