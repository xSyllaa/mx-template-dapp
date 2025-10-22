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
  Collection,
  Admin,
  CreatePrediction,
  ManagePredictions,
  SelectTeamOfWeek
} from 'pages';
import { RouteType } from 'types';

interface RouteWithTitleType extends RouteType {
  title: string;
  authenticatedRoute?: boolean;
  adminRoute?: boolean;
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
    path: '/collection',
    title: 'Collection',
    component: Collection,
    authenticatedRoute: true
  },
  {
    path: '/admin',
    title: 'Admin',
    component: Admin,
    authenticatedRoute: true,
    adminRoute: true
  },
  {
    path: '/admin/create-prediction',
    title: 'Create Prediction',
    component: CreatePrediction,
    authenticatedRoute: true,
    adminRoute: true
  },
  {
    path: '/admin/manage-predictions',
    title: 'Manage Predictions',
    component: ManagePredictions,
    authenticatedRoute: true,
    adminRoute: true
  },
  {
    path: '/admin/select-team-of-week',
    title: 'Select Team of Week',
    component: SelectTeamOfWeek,
    authenticatedRoute: true,
    adminRoute: true
  },
  {
    path: RouteNamesEnum.disclaimer,
    title: 'Disclaimer',
    component: Disclaimer
  }
];
