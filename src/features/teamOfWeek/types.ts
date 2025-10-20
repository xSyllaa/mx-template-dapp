export interface Player {
  id: string;
  name: string;
  nftId: string;
  position?: string;
  league?: string;
  rarity?: string;
}

export interface PlayerWithHolders extends Player {
  holders: NFTHolder[];
}

export interface NFTHolder {
  address: string;
  balance: string;
}

export interface TeamOfWeek {
  id: string;
  week_start_date: string;
  week_end_date: string;
  title: string;
  description?: string;
  players: PlayerWithHolders[];
  total_holders: number;
  created_by: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTeamOfWeekData {
  week_start_date: string;
  week_end_date: string;
  title: string;
  description?: string;
  players: PlayerWithHolders[];
  total_holders: number;
}

export interface PlayerSearchResult {
  id: string;
  name: string;
  nftId: string;
  position?: string;
  league?: string;
  rarity?: string;
}
