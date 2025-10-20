import playersData from 'data/playersData.json';
import type { PlayerSearchResult } from '../types';

export class PlayerSearchService {
  /**
   * Recherche des joueurs par nom avec fuzzy matching
   */
  static searchPlayers(query: string, limit: number = 10): PlayerSearchResult[] {
    if (!query || query.length < 2) {
      return [];
    }

    const searchTerm = query.toLowerCase().trim();
    
    // Filtrer et scorer les joueurs
    const results = playersData
      .filter((player) => {
        const playerName = player['Player Name']?.toLowerCase() || '';
        return playerName.includes(searchTerm);
      })
      .map((player) => {
        const playerName = player['Player Name'] || '';
        const nftId = player['MAINSEASON'] || '';
        
        // Calculer un score de pertinence
        const nameMatch = playerName.toLowerCase();
        let score = 0;
        
        // Score plus élevé si le terme apparaît au début du nom
        if (nameMatch.startsWith(searchTerm)) {
          score += 100;
        }
        
        // Score pour la correspondance exacte des mots
        const words = nameMatch.split(' ');
        const searchWords = searchTerm.split(' ');
        
        searchWords.forEach(searchWord => {
          words.forEach(word => {
            if (word.startsWith(searchWord)) {
              score += 50;
            } else if (word.includes(searchWord)) {
              score += 25;
            }
          });
        });

        return {
          id: player['ID'] || '',
          name: playerName,
          nftId: nftId,
          position: this.extractPosition(playerName),
          league: 'Premier League', // Par défaut, pourrait être extrait des données
          rarity: this.determineRarity(nftId),
          score
        };
      })
      .filter((player) => player.nftId) // Seulement les joueurs avec NFT
      .sort((a, b) => b.score - a.score) // Trier par score décroissant
      .slice(0, limit)
      .map(({ score, ...player }) => player); // Retirer le score du résultat final

    return results;
  }

  /**
   * Récupère un joueur par son ID exact
   */
  static getPlayerById(playerId: string): PlayerSearchResult | null {
    const player = playersData.find(p => p['ID'] === playerId);
    
    if (!player || !player['MAINSEASON']) {
      return null;
    }

    return {
      id: player['ID'] || '',
      name: player['Player Name'] || '',
      nftId: player['MAINSEASON'] || '',
      position: this.extractPosition(player['Player Name'] || ''),
      league: 'Premier League',
      rarity: this.determineRarity(player['MAINSEASON'] || '')
    };
  }

  /**
   * Récupère un joueur par son NFT ID
   */
  static getPlayerByNftId(nftId: string): PlayerSearchResult | null {
    const player = playersData.find(p => p['MAINSEASON'] === nftId);
    
    if (!player) {
      return null;
    }

    return {
      id: player['ID'] || '',
      name: player['Player Name'] || '',
      nftId: player['MAINSEASON'] || '',
      position: this.extractPosition(player['Player Name'] || ''),
      league: 'Premier League',
      rarity: this.determineRarity(player['MAINSEASON'] || '')
    };
  }

  /**
   * Récupère tous les joueurs avec NFT (pour l'admin)
   */
  static getAllPlayersWithNFT(): PlayerSearchResult[] {
    return playersData
      .filter(player => player['MAINSEASON']) // Seulement ceux avec NFT
      .map(player => ({
        id: player['ID'] || '',
        name: player['Player Name'] || '',
        nftId: player['MAINSEASON'] || '',
        position: this.extractPosition(player['Player Name'] || ''),
        league: 'Premier League',
        rarity: this.determineRarity(player['MAINSEASON'] || '')
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Extrait la position du joueur (basique, pourrait être amélioré)
   */
  private static extractPosition(playerName: string): string {
    // Logique basique - pourrait être améliorée avec plus de données
    // Pour l'instant, retourne une position générique
    return 'PLAYER';
  }

  /**
   * Détermine la rareté basée sur l'ID NFT
   */
  private static determineRarity(nftId: string): string {
    if (!nftId) return 'Common';
    
    // Logique basique basée sur l'ID - pourrait être améliorée
    const lastDigits = nftId.slice(-2);
    const num = parseInt(lastDigits, 16) || 0;
    
    if (num > 240) return 'Legendary';
    if (num > 200) return 'Epic';
    if (num > 150) return 'Rare';
    return 'Common';
  }
}
