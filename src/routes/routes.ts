import { RouteNamesEnum } from 'localConstants';
import {
  Dashboard,
  Disclaimer,
  Home,
  Unlock,
  Predictions,
  WarGames,
  Leaderboard,
  Streaks,
  MyNFTs,
  TeamOfWeek,
  Admin
} from 'pages';
import { RouteType } from 'types';

interface RouteWithTitleType extends RouteType {
  title: string;
  authenticatedRoute?: boolean;
  children?: RouteWithTitleType[];
}

export const routes: RouteWithTitleType[] = [
  {
    path: RouteNamesEnum.home,
    title: 'Home',
    component: Home,
    children: [
      {
        path: RouteNamesEnum.unlock,
        title: 'Unlock',
        component: Unlock
      }
    ]
  },
  {
    path: RouteNamesEnum.dashboard,
    title: 'Dashboard',
    component: Dashboard,
    authenticatedRoute: true
  },
  {
    path: '/predictions',
    title: 'Predictions',
    component: Predictions,
    authenticatedRoute: true
  },
  {
    path: '/war-games',
    title: 'War Games',
    component: WarGames,
    authenticatedRoute: true
  },
  {
    path: '/leaderboard',
    title: 'Leaderboards',
    component: Leaderboard,
    authenticatedRoute: true
  },
  {
    path: '/streaks',
    title: 'Streaks',
    component: Streaks,
    authenticatedRoute: true
  },
  {
    path: '/my-nfts',
    title: 'Mes NFTs',
    component: MyNFTs,
    authenticatedRoute: true
  },
  {
    path: '/team-of-week',
    title: 'Team of the Week',
    component: TeamOfWeek,
    authenticatedRoute: true
  },
  {
    path: '/admin',
    title: 'Admin',
    component: Admin,
    authenticatedRoute: true
  },
  {
    path: RouteNamesEnum.disclaimer,
    title: 'Disclaimer',
    component: Disclaimer
  }
];
