# envguard

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg) ![License](https://img.shields.io/badge/license-MIT-green.svg) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg)

> Validate .env files against .env.example before launching your app

## Features

- CLI tool
- TypeScript support

## Tech Stack

**Runtime:**
- TypeScript v5.4.0

## Prerequisites

- Node.js >= 18.0.0
- npm or yarn

## Installation

```bash
cd envguard
npm install
```

Or install globally:

```bash
npm install -g envguard
```

## Usage

### CLI

```bash
envguard
```

### Available Scripts

| Script | Command |
|--------|---------|
| `npm run build` | `tsc` |
| `npm run start` | `node dist/index.js` |

## Project Structure

```
├── src
│   ├── comparator.ts
│   ├── format-env.ts
│   ├── formatter.ts
│   ├── index.ts
│   ├── init.ts
│   └── parser.ts
├── package.json
├── README.md
└── tsconfig.json
```

## License

This project is licensed under the **MIT** license.

---
> Maintained by [zakbot-agent](https://github.com/zakbot-agent) & [ZakariaDev000](https://github.com/ZakariaDev000)
