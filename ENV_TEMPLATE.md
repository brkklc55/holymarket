# ===========================================
# HolyMarket Environment Variables
# ===========================================
# Copy this file to .env.local and fill in the values

# -----------------------------------------
# WalletConnect (Required for wallet connections)
# -----------------------------------------
# Get your free Project ID at: https://cloud.walletconnect.com/
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# -----------------------------------------
# App Configuration
# -----------------------------------------
# Base URL for the application (used for meta tags, sharing, etc.)
NEXT_PUBLIC_MINIAPP_URL=https://www.baseappholymarket.xyz

# Base URL alternative
NEXT_PUBLIC_URL=https://www.baseappholymarket.xyz

# -----------------------------------------
# Blockchain / Smart Contract
# -----------------------------------------
# Prediction Market Contract Address (Base Sepolia)
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=0xd2424429bd9b9254b99b81a651c582b9897be880

# RPC URL for Base Sepolia
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://base-sepolia.publicnode.com

# Alternative server-side RPC
BASE_SEPOLIA_RPC_URL=https://base-sepolia.publicnode.com

# -----------------------------------------
# Farcaster Account Association
# -----------------------------------------
# These are used for the .well-known/farcaster.json manifest
# Generate these at: https://warpcast.com/~/developers/frames
FARCASTER_ACCOUNT_ASSOCIATION_HEADER=your_header_here
FARCASTER_ACCOUNT_ASSOCIATION_PAYLOAD=your_payload_here
FARCASTER_ACCOUNT_ASSOCIATION_SIGNATURE=your_signature_here

# -----------------------------------------
# Neynar API (Required for Farcaster webhooks)
# -----------------------------------------
# Get your API key at: https://neynar.com/
NEYNAR_API_KEY=your_neynar_api_key_here

# -----------------------------------------
# Supabase (Optional - for persistent data storage)
# -----------------------------------------
# Create a project at: https://supabase.com/
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_KV_TABLE=holymarket_kv
SUPABASE_POINTS_KEY=points_db_v1

# -----------------------------------------
# Pricing (for points calculation)
# -----------------------------------------
# ETH price in USD (used for points calculation)
NEXT_PUBLIC_BNB_USD=3000
BNB_USD=3000
