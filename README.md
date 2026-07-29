# Terry Portfolio

A modern, dynamic fashion model portfolio built with TanStack Start, React, TypeScript, Tailwind CSS, and Appwrite.

## Features

- **Full-stack SSR:** Powered by TanStack Start for optimal performance and SEO.
- **Modern UI:** Built with React 19, Tailwind CSS v4, and Radix UI primitives for a responsive and accessible design.
- **Backend as a Service:** Fully integrated with Appwrite for Database, Authentication, and Storage.
- **Dynamic Content:** Easily manage clients, portfolio photos, social links, and general site content.
- **Type-safe:** End-to-end type safety with TypeScript and Zod.

## Tech Stack

- **Framework:** [TanStack Start](https://tanstack.com/start/latest) & [React 19](https://react.dev/)
- **Routing:** [TanStack Router](https://tanstack.com/router/latest)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & [Lucide React](https://lucide.dev/)
- **Components:** [Radix UI](https://www.radix-ui.com/)
- **Backend:** [Appwrite](https://appwrite.io/)
- **Tooling:** Vite, TypeScript, ESLint, Prettier

## Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v20 or higher recommended)
- npm or bun

You will also need an active [Appwrite](https://appwrite.io/) project to connect the backend services.

## Getting Started

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd terry-portifolio
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   bun install
   ```

3. **Environment Setup**:
   Ensure you have a `.env` file in the root of your project with your Appwrite configuration. You can copy the variables from your existing `.env` or set them up like this:
   ```env
   # Appwrite Configuration
   VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   VITE_APPWRITE_PROJECT_ID=your_project_id
   VITE_APPWRITE_DATABASE_ID=your_database_id
   VITE_APPWRITE_BUCKET_ID=your_bucket_id

   # Collection IDs
   VITE_APPWRITE_COLLECTION_PHOTOS=photos
   VITE_APPWRITE_COLLECTION_CLIENTS=clients
   VITE_APPWRITE_COLLECTION_SOCIAL_LINKS=social_links
   VITE_APPWRITE_COLLECTION_SITE_CONTENT=site_content
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   # or
   bun dev
   ```

5. **Open the app**:
   Open [http://localhost:3000](http://localhost:3000) (or the port specified in your console) to view it in the browser.

## Scripts

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the app for production.
- `npm run preview`: Locally preview the production build.
- `npm run lint`: Runs ESLint to find and fix problems.
- `npm run format`: Formats code using Prettier.

## Project Structure

- `/src`: Contains all application source code (components, routes, styles, and Appwrite clients).
- `/public`: Static assets.
- `/components.json`: Configuration for shadcn/ui components.
- `vite.config.ts`: Vite configuration, including TanStack Start plugins.
