# GalacticX dApp - MultiversX Integration Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Wallet Connection](#wallet-connection)
3. [NFT Ownership Verification](#nft-ownership-verification)
4. [Transaction Signing](#transaction-signing)
5. [Smart Contract Interactions](#smart-contract-interactions)
6. [API Integration](#api-integration)
7. [Security Considerations](#security-considerations)
8. [Testing on Different Networks](#testing-on-different-networks)

---

## Overview

GalacticX integrates with the MultiversX blockchain for:

1. **User Authentication**: Wallet-based login
2. **NFT Ownership**: Verify GalacticX NFT holdings
3. **Transactions**: Send rewards (EGLD, $GOAL tokens)
4. **Smart Contracts**: (Future) Interact with custom contracts

### MultiversX SDK Packages

The template already includes:

```json
{
  "@multiversx/sdk-core": "^15.2.1",
  "@multiversx/sdk-dapp": "^5.2.8",
  "@multiversx/sdk-dapp-ui": "^0.0.35",
  "@multiversx/sdk-dapp-utils": "^3.0.0"
}
```

**Purpose**:
- `sdk-core`: Low-level blockchain interactions
- `sdk-dapp`: React hooks and authentication
- `sdk-dapp-ui`: Pre-built UI components (wallet connect, transaction status)
- `sdk-dapp-utils`: Utility functions

---

## Wallet Connection

### Supported Wallet Types

GalacticX supports all MultiversX wallet methods:

1. **xPortal Mobile** - Scan QR code
2. **DeFi Wallet** - Browser extension
3. **Web Wallet** - Redirect flow
4. **Ledger** - Hardware wallet
5. **Passkey** - WebAuthn login

### Implementation (Already in Template)

The template provides a complete wallet connection flow in `src/pages/Home/components/HomeConnect/`.

#### Usage in Your Components

```typescript
import { useGetLoginInfo, useGetAccountInfo } from '@multiversx/sdk-dapp/hooks';

export const MyComponent = () => {
  const { isLoggedIn } = useGetLoginInfo();
  const { address, account } = useGetAccountInfo();
  
  if (!isLoggedIn) {
    return <Navigate to="/unlock" />;
  }
  
  return (
    <div>
      <p>Connected wallet: {address}</p>
      <p>Balance: {account.balance} EGLD</p>
    </div>
  );
};
```

### Configuration

Network configuration is in `src/config/`:

```typescript
// src/config/config.mainnet.ts
export const config = {
  network: {
    id: '1',
    name: 'Mainnet',
    egldLabel: 'EGLD',
    apiAddress: 'https://api.multiversx.com',
    gatewayAddress: 'https://gateway.multiversx.com',
    explorerAddress: 'https://explorer.multiversx.com'
  },
  walletConnectV2ProjectId: 'YOUR_PROJECT_ID'
};
```

### Logout

```typescript
import { logout } from '@multiversx/sdk-dapp/utils';

const handleLogout = () => {
  logout(window.location.origin);
};
```

---

## NFT Ownership Verification

### Fetching User NFTs

Create a service to fetch NFTs from MultiversX API:

```typescript
// src/lib/multiversx/nftService.ts
import axios from 'axios';
import { config } from 'config';

export interface NFTMetadata {
  identifier: string;
  collection: string;
  nonce: number;
  name: string;
  type: string;
  url: string;
  metadata?: {
    attributes?: string;  // Base64 encoded
  };
}

export const nftService = {
  /**
   * Fetch all NFTs owned by a wallet address
   */
  async getUserNFTs(walletAddress: string): Promise<NFTMetadata[]> {
    try {
      const response = await axios.get(
        `${config.network.apiAddress}/accounts/${walletAddress}/nfts`,
        {
          params: {
            collections: 'GALACTICX-abc123',  // Replace with your collection ID
            size: 100
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      throw error;
    }
  },

  /**
   * Check if user owns at least one GalacticX NFT
   */
  async hasGalacticXNFT(walletAddress: string): Promise<boolean> {
    const nfts = await this.getUserNFTs(walletAddress);
    return nfts.length > 0;
  },

  /**
   * Get NFT count for a wallet
   */
  async getNFTCount(walletAddress: string): Promise<number> {
    const nfts = await this.getUserNFTs(walletAddress);
    return nfts.length;
  },

  /**
   * Get specific NFT details
   */
  async getNFTDetails(nftId: string): Promise<NFTMetadata> {
    try {
      const response = await axios.get(
        `${config.network.apiAddress}/nfts/${nftId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching NFT details:', error);
      throw error;
    }
  },

  /**
   * Decode Base64 NFT attributes
   */
  decodeAttributes(base64Attributes?: string): Record<string, any> {
    if (!base64Attributes) return {};
    
    try {
      const decoded = atob(base64Attributes);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error decoding attributes:', error);
      return {};
    }
  }
};
```

### Custom Hook: useNFTOwnership

```typescript
// src/hooks/useNFTOwnership.ts
import { useState, useEffect } from 'react';
import { useGetAccountInfo } from '@multiversx/sdk-dapp/hooks';
import { nftService } from 'lib/multiversx/nftService';

export const useNFTOwnership = () => {
  const { address } = useGetAccountInfo();
  const [nfts, setNfts] = useState<NFTMetadata[]>([]);
  const [nftCount, setNftCount] = useState(0);
  const [hasNFT, setHasNFT] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!address) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userNFTs = await nftService.getUserNFTs(address);
        setNfts(userNFTs);
        setNftCount(userNFTs.length);
        setHasNFT(userNFTs.length > 0);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [address]);

  return { nfts, nftCount, hasNFT, loading, error };
};
```

### Usage: NFT Guard Component

```typescript
// src/wrappers/NFTGuard/NFTGuard.tsx
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader } from 'components/ui/Loader';
import { useNFTOwnership } from 'hooks/useNFTOwnership';

interface NFTGuardProps {
  children: ReactNode;
  minNFTCount?: number;
  redirectTo?: string;
}

export const NFTGuard = ({ 
  children, 
  minNFTCount = 1,
  redirectTo = '/'
}: NFTGuardProps) => {
  const { nftCount, loading, error } = useNFTOwnership();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-[var(--mvx-error)]">Error loading NFTs: {error.message}</p>
      </div>
    );
  }

  if (nftCount < minNFTCount) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">NFT Required</h2>
        <p className="text-[var(--mvx-text-secondary)] mb-6">
          You need at least {minNFTCount} GalacticX NFT{minNFTCount > 1 ? 's' : ''} to access this feature.
        </p>
        <Navigate to={redirectTo} replace />
      </div>
    );
  }

  return <>{children}</>;
};
```

### Protected Route Example

```typescript
// src/routes/routes.ts
{
  path: '/predictions',
  component: () => (
    <AuthGuard>
      <NFTGuard minNFTCount={1}>
        <Predictions />
      </NFTGuard>
    </AuthGuard>
  )
}
```

---

## Transaction Signing

### Sending EGLD

```typescript
// src/helpers/sendRewards.ts
import { sendTransactions } from '@multiversx/sdk-dapp/services';
import { Address, Transaction, TokenPayment } from '@multiversx/sdk-core';

export const sendRewards = async (
  recipients: string[],
  amounts: string[]  // In EGLD (e.g., "1.5")
) => {
  const transactions = recipients.map((recipient, index) => {
    return {
      value: TokenPayment.egldFromAmount(amounts[index]).toString(),
      receiver: recipient,
      data: 'GalacticX Team of the Week Reward',
      gasLimit: 50000
    };
  });

  try {
    const { sessionId } = await sendTransactions({
      transactions,
      transactionsDisplayInfo: {
        processingMessage: 'Sending rewards...',
        errorMessage: 'Failed to send rewards',
        successMessage: 'Rewards sent successfully!'
      }
    });

    return sessionId;
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
};
```

### Sending Custom Tokens (ESDT)

```typescript
// src/helpers/sendTokenRewards.ts
import { sendTransactions } from '@multiversx/sdk-dapp/services';
import { TokenPayment } from '@multiversx/sdk-core';

export const sendTokenRewards = async (
  recipients: string[],
  tokenIdentifier: string,  // e.g., 'GOAL-abc123'
  amounts: string[],         // Token amounts
  decimals: number = 18
) => {
  const transactions = recipients.map((recipient, index) => {
    const payment = TokenPayment.fungibleFromAmount(
      tokenIdentifier,
      amounts[index],
      decimals
    );

    return {
      value: '0',
      receiver: recipient,
      data: payment.valueOf().toString() + '@' + Buffer.from('TOTW Reward').toString('hex'),
      gasLimit: 500000
    };
  });

  const { sessionId } = await sendTransactions({
    transactions,
    transactionsDisplayInfo: {
      processingMessage: 'Sending token rewards...',
      errorMessage: 'Failed to send tokens',
      successMessage: 'Tokens sent successfully!'
    }
  });

  return sessionId;
};
```

### Transaction Status Tracking

```typescript
// Component example
import { useGetPendingTransactions } from '@multiversx/sdk-dapp/hooks';
import { useEffect } from 'react';

export const TransactionTracker = () => {
  const { pendingTransactions } = useGetPendingTransactions();

  useEffect(() => {
    if (pendingTransactions.length > 0) {
      console.log('Pending transactions:', pendingTransactions);
    }
  }, [pendingTransactions]);

  return (
    <div>
      {pendingTransactions.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-[var(--mvx-bg-secondary)] p-4 rounded-lg">
          <p>{pendingTransactions.length} transaction(s) pending...</p>
        </div>
      )}
    </div>
  );
};
```

---

## Smart Contract Interactions

### (Future) Calling Smart Contract Functions

```typescript
// Example: Staking NFTs in a smart contract
import { sendTransactions } from '@multiversx/sdk-dapp/services';
import { Address, ContractFunction, SmartContract } from '@multiversx/sdk-core';

export const stakeNFT = async (
  contractAddress: string,
  nftIdentifier: string,
  nonce: number
) => {
  const contract = new SmartContract({
    address: new Address(contractAddress)
  });

  const transaction = contract.call({
    func: new ContractFunction('stakeNFT'),
    args: [
      BytesValue.fromUTF8(nftIdentifier),
      new U64Value(nonce)
    ],
    gasLimit: 6000000,
    chainID: 'D'  // Devnet
  });

  const { sessionId } = await sendTransactions({
    transactions: [transaction],
    transactionsDisplayInfo: {
      processingMessage: 'Staking NFT...',
      errorMessage: 'Staking failed',
      successMessage: 'NFT staked successfully!'
    }
  });

  return sessionId;
};
```

---

## API Integration

### MultiversX API Endpoints

**Base URLs**:
- Mainnet: `https://api.multiversx.com`
- Devnet: `https://devnet-api.multiversx.com`
- Testnet: `https://testnet-api.multiversx.com`

### Common API Calls

#### Get Account Info

```typescript
GET /accounts/{address}

Response:
{
  "address": "erd1...",
  "balance": "1500000000000000000",  // 1.5 EGLD (18 decimals)
  "nonce": 42
}
```

#### Get Account NFTs

```typescript
GET /accounts/{address}/nfts?collections=COLLECTION-ID

Response: [
  {
    "identifier": "GALACTICX-abc123-01",
    "name": "Erling Haaland",
    "url": "ipfs://...",
    ...
  }
]
```

#### Get Transaction Status

```typescript
GET /transactions/{txHash}

Response:
{
  "txHash": "abc123...",
  "status": "success",  // or "pending", "fail"
  "sender": "erd1...",
  "receiver": "erd1...",
  ...
}
```

### API Helper Service

```typescript
// src/lib/multiversx/apiService.ts
import axios from 'axios';
import { config } from 'config';

const api = axios.create({
  baseURL: config.network.apiAddress,
  timeout: 10000
});

export const multiversxAPI = {
  async getAccount(address: string) {
    const { data } = await api.get(`/accounts/${address}`);
    return data;
  },

  async getTransaction(txHash: string) {
    const { data } = await api.get(`/transactions/${txHash}`);
    return data;
  },

  async getTokens(address: string) {
    const { data } = await api.get(`/accounts/${address}/tokens`);
    return data;
  }
};
```

---

## Security Considerations

### 1. Never Store Private Keys

❌ **NEVER** ask users for seed phrases or private keys  
✅ **ALWAYS** use wallet providers (xPortal, DeFi Wallet, etc.)

### 2. Validate Addresses

```typescript
import { Address } from '@multiversx/sdk-core';

export const isValidAddress = (address: string): boolean => {
  try {
    new Address(address);
    return true;
  } catch {
    return false;
  }
};
```

### 3. Verify Transaction Signatures

All transactions are signed client-side by the wallet. The dApp cannot forge transactions.

### 4. Gas Limit Safety

Always set reasonable gas limits:

```typescript
// Simple transfer
gasLimit: 50000

// Token transfer
gasLimit: 500000

// Smart contract call
gasLimit: 6000000
```

### 5. Double-Check Receivers

```typescript
// Before sending rewards, validate addresses
const validRecipients = recipients.filter(isValidAddress);
if (validRecipients.length !== recipients.length) {
  throw new Error('Invalid recipient addresses detected');
}
```

---

## Testing on Different Networks

### Switch Networks

Update `src/config/index.ts` based on environment:

```typescript
// Development
import { config } from './config.devnet';

// Staging
import { config } from './config.testnet';

// Production
import { config } from './config.mainnet';

export { config };
```

### NPM Scripts (Already in package.json)

```bash
# Development (Devnet)
npm run start-devnet

# Staging (Testnet)
npm run start-testnet

# Production (Mainnet)
npm run start-mainnet
```

### Environment-Specific Configuration

```typescript
// config.devnet.ts
export const config = {
  network: {
    id: 'D',
    name: 'Devnet',
    apiAddress: 'https://devnet-api.multiversx.com',
    explorerAddress: 'https://devnet-explorer.multiversx.com'
  },
  // Devnet collection ID
  galacticxCollection: 'GALACTICX-devnet-123'
};

// config.mainnet.ts
export const config = {
  network: {
    id: '1',
    name: 'Mainnet',
    apiAddress: 'https://api.multiversx.com',
    explorerAddress: 'https://explorer.multiversx.com'
  },
  // Mainnet collection ID
  galacticxCollection: 'GALACTICX-abc123'
};
```

### Testing Checklist

- [ ] Wallet connection works (all providers)
- [ ] NFT ownership detection accurate
- [ ] Transactions sign and execute successfully
- [ ] Transaction status tracking works
- [ ] Error handling for failed transactions
- [ ] Gas limits are appropriate
- [ ] Logout clears session properly

---

## Example: Complete NFT Check Flow

```typescript
// features/predictions/components/PredictionCard/PredictionCard.tsx
import { useGetAccountInfo } from '@multiversx/sdk-dapp/hooks';
import { useNFTOwnership } from 'hooks/useNFTOwnership';
import { useSubmitPrediction } from '../../hooks/useSubmitPrediction';

export const PredictionCard = ({ prediction }: Props) => {
  const { address } = useGetAccountInfo();
  const { hasNFT, loading: nftLoading } = useNFTOwnership();
  const { submit, isLoading } = useSubmitPrediction();

  const handleSubmit = async (optionId: string) => {
    // Check authentication
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    // Check NFT ownership
    if (!hasNFT) {
      toast.error('You need at least 1 GalacticX NFT to participate');
      return;
    }

    // Submit prediction
    await submit({
      prediction_id: prediction.id,
      selected_option_id: optionId
    });
  };

  return (
    <Card>
      {/* Prediction UI */}
      <Button 
        onClick={() => handleSubmit(selectedOption)}
        disabled={!address || !hasNFT || nftLoading || isLoading}
      >
        {!address ? 'Connect Wallet' : !hasNFT ? 'NFT Required' : 'Submit Prediction'}
      </Button>
    </Card>
  );
};
```

---

## Useful Resources

- **MultiversX Docs**: https://docs.multiversx.com/
- **SDK Dapp Docs**: https://github.com/multiversx/mx-sdk-dapp
- **API Reference**: https://docs.multiversx.com/sdk-and-tools/rest-api/
- **Explorer**: https://explorer.multiversx.com/
- **Devnet Faucet**: https://devnet-wallet.multiversx.com/faucet

---

## Conclusion

MultiversX integration in GalacticX provides:

✅ **Seamless Wallet Auth**: Multiple wallet options  
✅ **NFT Ownership**: Gated features based on NFT holdings  
✅ **Secure Transactions**: User-signed, verifiable  
✅ **Multi-Network**: Devnet, Testnet, Mainnet support  
✅ **Type-Safe**: Full TypeScript integration  

For additional context, see:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Overall system design
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - How NFT data is cached
- [API_ENDPOINTS.md](./API_ENDPOINTS.md) - NFT sync endpoints


