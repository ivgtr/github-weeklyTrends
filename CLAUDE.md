# CLAUDE.md - AI Assistant Guide for github-weeklyTrends

## Project Overview

**github-weeklyTrends** is an automated Node.js/TypeScript application that:
- Scrapes GitHub's trending repositories weekly
- Creates GitHub Issues with trending data organized by programming language
- Translates repository descriptions to Japanese
- Automatically manages issue lifecycle (creates, comments, closes issues)

The project runs on a weekly schedule via GitHub Actions.

## Repository Structure

```
/
├── src/                          # TypeScript source code
│   ├── @types/
│   │   └── type.d.ts            # Type definitions (Repository, shapeRepository)
│   ├── utils/
│   │   ├── getGithubTrend.ts    # Web scraping logic using Cheerio
│   │   └── createReport.ts      # Issue creation/management via GitHub API
│   ├── index.ts                 # Main entry point for workflow
│   ├── deleteIssues.ts          # Bulk issue deletion utility
│   └── generateReadme.ts        # README generation & issue management
├── dist/                        # Compiled JavaScript output (generated)
├── .github/workflows/           # GitHub Actions automation
│   ├── schedule.yml             # Weekly cron job (Mondays 3:00 AM UTC)
│   ├── generate.yml             # Manual/triggered README generation
│   └── test.yml                 # CI testing (lint)
└── Configuration files (package.json, tsconfig.json, etc.)
```

## Technology Stack

- **Runtime**: Node.js (>=16.0.0)
- **Language**: TypeScript 5.0.4
- **Package Manager**: Yarn 3.0.0
- **Key Dependencies**:
  - `@octokit/rest` - GitHub API client
  - `axios` - HTTP requests
  - `cheerio` - HTML parsing/scraping
  - `dayjs` - Date manipulation
  - `dotenv` - Environment variables

## Common Commands

| Command | Purpose |
|---------|---------|
| `npm run workflow` | Execute main trending data fetcher |
| `npm run generate` | Generate README and manage issues |
| `npm run lint` | Run ESLint on TypeScript files |
| `npm run format` | Format code with Prettier |
| `npm run start` | TypeScript watch mode |
| `npm run delete` | Bulk delete GitHub issues |

## Development Workflow

1. **TypeScript compilation**: All source files in `src/` compile to `dist/`
2. **Linting**: ESLint with TypeScript rules + Prettier integration
3. **Formatting**: Prettier (2-space indent, 100-char width)
4. **Testing**: CI runs `npm run lint` on push/PR to master

## Code Conventions

### TypeScript
- Strict mode enabled with strict null checks
- Target: ES2017, Module: CommonJS
- All types defined in `src/@types/type.d.ts`
- Use explicit types, avoid `any`

### Formatting & Style
- 2-space indentation (no tabs)
- 100-character line width
- ESLint auto-fix on save (VSCode configured)
- Import organization enforced

### Key Types
```typescript
// Repository data from GitHub trending page
type Repository = {
  author: string;
  name: string;
  href: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  starsInPeriod: number;
}

// Grouped by programming language
type shapeRepository = {
  [key: string]: Repository[];
}
```

## Environment Variables

Required for full functionality:
- `GITHUB_ACCESS_TOKEN` - GitHub API authentication (GraphQL)
- `TRANSLATE_API` - External translation API endpoint (for Japanese)
- `TZ` - Timezone (set to `Asia/Tokyo` in workflows)

## GitHub Actions Workflows

### schedule.yml (Weekly Automation)
- Cron: Every Monday at 3:00 AM UTC
- Runs `npm run workflow`
- Creates issues with weekly trending data

### generate.yml (Manual Trigger)
- Triggered by 'weekly-trending' label or manual dispatch
- Updates README.md with latest issue link
- Auto-commits and pushes changes

### test.yml (CI)
- Runs on push to master and PRs
- Executes linting checks

## Key Implementation Notes

### Web Scraping (`src/utils/getGithubTrend.ts`)
- Scrapes `https://github.com/trending` using Cheerio
- Supports daily/weekly/monthly periods
- Extracts: author, repo name, description, language, stars, forks, weekly gains

### Issue Management (`src/utils/createReport.ts`)
- Uses GitHub GraphQL API for mutations
- Hardcoded repository ID and label ID (specific to this repo)
- Groups trending repos by programming language
- Adds comments with language-specific data

### README Generation (`src/generateReadme.ts`)
- Updates README with link to latest weekly trending issue
- Closes old issues (keeps max 2 open)

## When Making Changes

1. **Run lint before committing**: `npm run lint`
2. **Format code**: `npm run format`
3. **Test locally**: `npm run workflow` (requires env vars)
4. **Type definitions**: Update `src/@types/type.d.ts` for new types
5. **Keep hardcoded IDs updated** if changing repository settings

## Dependencies Management

- Renovate configured for automated updates
- Weekly update schedule
- Auto-merges minor versions and linters
- Lock files maintained monthly

## License

MIT (c) ivgtr
