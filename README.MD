# Frontend - Stellar Smart Contract Deployer

This is a [Next.js](https://nextjs.org) application that provides a web interface for deploying Stellar smart contracts from GitHub repositories. It handles user authentication, Stellar keypair management, and the deployment process.

## ✨ Key Features

- **GitHub Authentication**: Securely log in with your GitHub account using NextAuth.js.
- **Stellar Wallet Management**: Generate, import, and manage Stellar keypairs for testnet deployments.
- **Repository Importer**: Fetches and displays your Rust-based GitHub repositories.
- **One-Click Deployment**: Streamlined process to deploy smart contracts to the Stellar testnet.
- **Deployment History**: View a list of your past deployments and their statuses.
- **SDK Generation**: Generate a TypeScript SDK from a deployed contract address.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) with GitHub Provider
- **Database**: [MongoDB](https://www.mongodb.com/) with [Prisma](https://www.prisma.io/) ORM
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Stellar Integration**: [Stellar SDK](https://www.stellar.org/developers/js-stellar-sdk)

## 🚀 Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/en/) (v20 or later)
- [pnpm](https://pnpm.io/installation)
- A [MongoDB](https://www.mongodb.com/) database instance.
- A [GitHub OAuth Application](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app) for authentication.

### 2. Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/your-repo/deployer.git
cd deployer/frontend
pnpm install
```

### 3. Environment Variables

Create a `.env.local` file in the `frontend` directory and add the following variables.

```env
# Prisma - Your MongoDB connection string
DATABASE_URL="mongodb+srv://<user>:<password>@<cluster>/<database>?retryWrites=true&w=majority"

# NextAuth.js - GitHub Credentials
GITHUB_ID="your_github_oauth_app_id"
GITHUB_SECRET="your_github_oauth_app_secret"

# NextAuth.js - A secret for signing tokens
NEXTAUTH_SECRET="generate_a_random_secret_string"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Database Setup

Push the Prisma schema to your MongoDB database. This will create the necessary collections.

```bash
pnpm prisma db push
```

### 5. Run the Development Server

Start the Next.js development server:

```bash
pnpm dev
```

Open [http://stellar-sm.fenol64.com.br](http://stellar-sm.fenol64.com.br) with your browser to see the result.

## 📂 Frontend Project settings

- `src/app/`: Contains the main pages and layouts of the application.
  - `api/`: API routes for handling backend logic (auth, deployments, Stellar actions).
  - `(pages)/`: Different pages of the application like `/add`, `/deploy`, `/settings`.
- `src/components/`: Reusable React components used across the application.
- `src/lib/`: Core utility files, including `auth.ts` for NextAuth configuration and `prisma.ts` for the Prisma client instance.
- `src/hooks/`: Custom React hooks, like `useStellarKeypair.ts`.
- `prisma/`: Contains the `schema.prisma` file that defines the database models.
- `public/`: Static assets like images and SVGs.

## ▲ Deploy on GCP (Google Cloud Platform)

This project is deployed in a VPS inside GCP.
