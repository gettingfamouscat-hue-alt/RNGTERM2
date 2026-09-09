# RNGTERM

A polished, terminal-inspired daily random number game where players roll once per UTC day to earn badges and climb the leaderboard.

## Features

### Player Game
- **Daily Roll**: Generate a random number from 0 to 1,000,000 once per UTC day
- **Badge System**: 41 unique badges with different rarities based on number patterns:
  - Digit patterns (palindromes, repeating digits, sequences)
  - Math properties (primes, perfect squares, Fibonacci numbers)
  - Cultural/meme numbers (69, 420, 666, 777, 1337, etc.)
  - Special patterns (all unique, binary-like, balanced)
- **Rarity Tiers**: Trash / Common / Uncommon / Rare / Epic / Anomaly / Mythic
- **Entropy Points (EP)**: Cumulative score based on badges earned
- **Leaderboard**: See today's top rolls and compete with other players
- **Roll History**: View your past rolls and collected badges
- **Profile**: Customize your display name and track your stats

### Admin Panel
- **Secure Access**: Password-protected admin panel at `/admin`
- **Dashboard**: View total players, rolls, and badge statistics
- **Player Management**: Search players and grant extra rolls
- **Roll Browser**: View all rolls across all players
- **Badge Management**: Enable/disable badges
- **Maintenance Mode**: Block new rolls for maintenance

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom terminal/neon aesthetic
- **Database**: SQLite via Prisma ORM
- **Authentication**: Iron Session (secure httpOnly cookies)
- **RNG**: Node.js crypto.randomInt (cryptographically secure)

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Clone the repository
```bash
git clone <repo-url>
cd rngterm
```

2. Install dependencies
```bash
npm install
```

3. Set up the database
```bash
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

4. Start the development server
```bash
npm run dev
```

5. Open your browser to `http://localhost:3000`

## Environment Variables

The app uses the following environment variables (already configured in `.env.local`):

```env
DATABASE_URL="file:./dev.db"
ADMIN_USERNAME="Damian"
ADMIN_PASSWORD="9198765432Gg(hello)!"
SESSION_SECRET="rngterm-super-secret-key-change-in-production-please"
```

### Admin Access

To access the admin panel:
1. Navigate to `/admin` (not linked in public UI)
2. Log in with:
   - **Username**: `Damian`
   - **Password**: `9198765432Gg(hello)!`

**IMPORTANT**: Change these credentials in production by updating the `.env` file!

## Database

The app uses SQLite for local development. The database file is created at `dev.db` in the project root.

### Database Schema

- **Player**: User profiles with display names and total EP
- **Roll**: Individual roll records with number, EP, rarity, and UTC date
- **Badge**: Badge definitions with detection rules and EP values
- **RollBadge**: Junction table linking rolls to earned badges
- **MaintenanceMode**: Global flag to enable/disable rolling

### Resetting the Database

```bash
rm dev.db
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

## Badge System

The game includes 41 unique badges across multiple categories:

### Extreme Values (Mythic)
- **Absolute Zero**: Rolled exactly 0
- **One in a Million**: Rolled exactly 1,000,000
- **Seventh Heaven**: All seven digits are 7s
- And more...

### Math Properties
- **Prime Time**: Number is prime
- **Square Deal**: Perfect square
- **Cube Root**: Perfect cube
- **Golden Ratio**: Fibonacci number

### Cultural/Meme Numbers
- **Nice**: Exactly 69
- **420 Blaze It**: Exactly 420
- **Number of the Beast**: Exactly 666
- **Jackpot**: Exactly 777
- **1337 H4X0R**: Exactly 1337

### Pattern Detection
- **Mirror Image**: Perfect palindrome
- **Zigzag**: Alternating digits
- **Consecutive Streak**: 5+ consecutive digits
- **Full House**: Three of one digit, two of another
- And many more...

## Project Structure

```
/workspace
├── app/
│   ├── actions.ts           # Player game server actions
│   ├── page.tsx             # Main game page
│   ├── globals.css          # Global styles with terminal aesthetic
│   ├── layout.tsx           # Root layout
│   └── admin/
│       ├── actions.ts       # Admin server actions
│       └── page.tsx         # Admin panel page
├── components/
│   ├── RollAnimation.tsx    # Roll button and number reveal
│   ├── BadgeDisplay.tsx     # Badge cascade animation
│   ├── Leaderboard.tsx      # Leaderboard table
│   ├── History.tsx          # Roll history display
│   ├── ProfilePanel.tsx     # Player profile editor
│   └── admin/
│       └── AdminDashboard.tsx  # Admin panel UI
├── lib/
│   ├── prisma.ts            # Prisma client with SQLite adapter
│   ├── badges.ts            # Badge definitions and detection
│   └── session.ts           # Admin session management
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── seed.ts              # Database seeding script
│   └── migrations/          # Database migrations
└── dev.db                   # SQLite database file
```

## Development

### Running Tests

```bash
npm run build     # Test production build
npm run lint      # Run ESLint
```

### Adding New Badges

1. Add badge definition to `lib/badges.ts` in the `BADGES` array
2. Include detector function, rarity, EP value, and description
3. Run seed script to update database: `npx tsx prisma/seed.ts`

Example:
```typescript
{
  code: 'my_badge',
  name: 'My Badge',
  description: 'Description of when this badge is earned',
  rarity: 'Rare',
  epValue: 500,
  detector: (n) => n % 123 === 0,  // Custom detection logic
}
```

## Deployment

### Production Checklist

1. **Change Admin Credentials**: Update `ADMIN_USERNAME` and `ADMIN_PASSWORD` in production environment
2. **Change Session Secret**: Update `SESSION_SECRET` to a secure random value
3. **Database**: Consider migrating to Turso (libSQL) or PostgreSQL for production
4. **Environment**: Ensure all environment variables are set
5. **Build**: Run `npm run build` to create production build

### Environment Variables for Production

```env
DATABASE_URL="your-production-database-url"
ADMIN_USERNAME="your-secure-username"
ADMIN_PASSWORD="your-secure-password"
SESSION_SECRET="your-secure-session-secret-min-32-chars"
NODE_ENV="production"
```

## Security Notes

- Admin password verification happens server-side only (never exposed to client)
- Session cookies are httpOnly and secure in production
- One roll per player per UTC day is enforced server-side
- All admin actions require valid session authentication
- Admin route is not linked anywhere in public UI

## License

MIT

## Credits

Inspired by [RNGdle](https://rngdle.com) - Original concept by RNGdle team.
RNGTERM is an independent implementation with unique features and branding.
