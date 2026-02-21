# NutriBin — Server

<img width="936" height="328" alt="image" src="https://github.com/user-attachments/assets/6c962171-3add-41db-a3ba-0d2597b2c2d6" />

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE) [![Project Status](https://img.shields.io/badge/status-Development-green.svg)](#)

A comprehensive system designed for managing and monitoring smart waste bins. This repository contains the source code for both the backend API and the web-based management dashboard. 

--

## Features

- **Full-stack Architecture**: Seamless integration between a NestJS backend and a React/Vite frontend.
- **Real-time Monitoring**: Dashboard for tracking machine health, sales, and analytics.
- **Security & Authentication**: Robust user management with MFA (SMS/Email) support and secure authentication flows.
- **Automated Workflows**: Cron jobs for database backups and scheduled tasks.

## Repo Layout

- **`Backend/`**: NestJS application handling logic, database (PostgreSQL/Supabase), and services. See [Backend/](Backend/)
- **`Frontend/`**: React + Vite application for the administration and management dashboard. See [Frontend/](Frontend/)
- **`scripts/`**: Root level utilities (if any) or documentation.
- **`.github/`**: Workflow configurations and contribution guidelines.

## Quick Start

Prerequisites:

- **Node.js 18+**
- **npm** (or yarn/pnpm)
- **PostgreSQL** (Local or Supabase)

Clone the repository and install dependencies for both projects:

```bash
git clone https://github.com/JohnIvn/NutriBin-Server.git
cd NutriBin-Server

# Setup Backend
cd Backend
npm install

# Setup Frontend
cd ../Frontend
npm install
```

## Backend — NestJS

The backend handles the core business logic and data persistence.

1. **Environment Configuration**: Create a `.env` file in the `Backend/` directory with your `DATABASE_URL`.
2. **Development**:
   ```bash
   npm run start:dev
   ```
3. **Database Seeding**:
   ```bash
   npm run seed:admin
   ```

Outputs and logs are displayed in the terminal. Backups are stored in `Backend/backups/`.

## Frontend — React/Vite

The frontend provides the user interface for administrators and staff.

1. **Development**:
   ```bash
   npm run dev
   ```
2. **Build**:
   ```bash
   npm run build
   ```

The application will be available at `http://localhost:5173` by default.

## Available Scripts

Commonly used commands across the repository:

- **Backend**: `npm run start:dev`, `npm run build`, `npm run lint`, `npm run backup:create`.
- **Frontend**: `npm run dev`, `npm run build`, `npm run lint`.

## Contributing

- **Fork** the repo, create a feature branch, and open a PR.
- Please follow the guidelines in [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md).
- Ensure code passes linting before submission.

## Next Steps

- Expand automated testing coverage (e2e and unit tests).
- Integrate more advanced analytics visualizations on the dashboard.
- Optimize build containerization with Docker.

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE).

--

If you have questions or need support, please refer to the documentation or open an issue.
