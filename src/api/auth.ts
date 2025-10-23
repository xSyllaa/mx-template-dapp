/**
 * Authentication API
 * Handles user authentication with MultiversX wallet
 */

import { apiClient } from './client';
import { LoginResponse, MeResponse, CheckWalletResponse } from './types';

export const authAPI = {
  /**
   * Login with MultiversX wallet signature
   * @param walletAddress - User's wallet address
   * @param signature - Signature from MultiversX wallet
   * @param message - Original message that was signed
   */
  async login(
    walletAddress: string,
    signature: string,
    message: string
  ): Promise<LoginResponse> {
    return apiClient<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, signature, message }),
    });
  },

  /**
   * Get current user profile
   * Requires JWT authentication
   */
  async getMe(): Promise<MeResponse> {
    return apiClient<MeResponse>('/auth/me');
  },

  /**
   * Check if wallet address exists in the system
   * @param walletAddress - Wallet address to check
   */
  async checkWallet(walletAddress: string): Promise<CheckWalletResponse> {
    return apiClient<CheckWalletResponse>(
      `/auth/check?walletAddress=${walletAddress}`
    );
  },
};

