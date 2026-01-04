# CapsuleOS - Personal Intelligence Nexus

A **retro-futuristic 3D interactive platform** that synthesizes behavioral data across multiple life dimensions into coherent personal intelligence. Not music-specific. Ideology-focused.

## Philosophy

CapsuleOS answers the question: **"What does my digital behavior reveal about who I am?"**

Rather than analyzing isolated data streams (music, code, fitness), CapsuleOS treats your entire digital footprint as a **unified behavioral signal**. By combining insights from multiple sources—work patterns, learning behaviors, leisure preferences, wellness metrics—the platform creates a holistic **personal intelligence capsule** that evolves with you.

### Core Tenets

- **Determinism First**: All metrics computed without randomness or AI
- **Minimal AI Surface**: LLM used only for narrative interpretation
- **Privacy by Design**: Aggregated metrics only, no raw data persistence
- **Explainability**: Every insight traces back to measurable signals
- **Extensibility**: Add any data source without re-architecture
- **Ideology-Focused**: Understand yourself, not your consumption

## Visual Experience

### 3D Intelligence Nexus
At the heart of CapsuleOS is a **real-time 3D visualization** of your behavioral dimensions:

- **Central Core**: Your integrated personal intelligence (pulsing, rotating)
- **Intelligence Nodes**: Orbital nodes representing each connected data source (Spotify, GitHub, YouTube, etc.)
- **Network Connections**: Visualization of how different dimensions of your behavior interact
- **Animated Particles**: Real-time behavioral signals flowing through the network

### Retro-Futuristic UI
Built with **NeoBrutalism** aesthetics inspired by [RetroUI.dev](https://www.retroui.dev):

- **Bold Typography**: High-contrast, all-caps tracking for commanding presence
- **Thick Borders**: 4px borders creating raw, brutalist aesthetic
- **Neon Colors**: Cyan, magenta, yellow accents on pure black backgrounds
- **Scanline Effects**: Retro CRT monitor visual feedback
- **Interactive Feedback**: Shadow play, translate animations, tactile responses
- **Grid Backgrounds**: Subtle cyan grid pattern suggesting digital space

## Architecture

### 3D Visualization Stack
```
React Three Fiber (R3F)
├── Canvas3D: Main 3D rendering engine
├── Scene3D: Behavioral node network
├── CentralCore: Pulsing intelligence center
├── IntelligenceNode: Data source representations
└── NetworkGrid: Connection visualization
```

### UI/UX Stack
```
Retro Dashboard (NeoBrutalism)
├── Header: Platform branding + sync controls
├── Left Sidebar: Behavioral metrics cards
├── Right Panel: Daily insight capsule
├── Bottom Control Panel: Data sync + settings
└── Scanline Overlay: Retro CRT effects
```

### Backend (Unchanged)
```
Supabase
├── PostgreSQL (Generic intelligence schema)
├── Edge Functions (Multi-source orchestration)
├── RLS Policies (Privacy enforcement)
└── Real-time updates
```

## Behavioral Metrics

Instead of music-specific metrics, CapsuleOS computes **ideology-agnostic behavioral indices**:

### Example Metrics (Extensible)
- **Exploration Index** (0-10): Rate of novelty-seeking vs routine behavior
- **Consistency Score** (0-10): Stability and predictability patterns
- **Diversity Metric** (count): Number of distinct behavioral dimensions engaged
- **Engagement Level** (0-10): Intensity of interaction across sources
- **Focus Pattern**: Attention distribution across activities
- **Growth Trajectory**: Skill/knowledge expansion over time

Each metric:
- ✅ Computed deterministically from aggregated source data
- ✅ Versioned independently for future improvements
- ✅ Explainable: traces to specific source signals
- ✅ Comparable: normalized across sources

## Data Sources (Plugin Architecture)

CapsuleOS supports any behavioral data source. Current integrations available:

| Source | Category | Status | Behavioral Signals |
|--------|----------|--------|-------------------|
| **Spotify** | Music | ✅ Live | Taste evolution, discovery patterns, listening consistency |
| **YouTube** | Content | ✅ Live | Content identity, intellectual diet, subscription health |
| **GitHub** | Developer | 🔜 Coming | Coding cadence, language diversity, contribution rhythm |
| **Reading Platforms** | Content | 🔜 Coming | Shallow vs deep reading, topic breadth |
| **Fitness Tracker** | Wellness | 🔜 Coming | Activity patterns, consistency, intensity |
| **Calendar** | Productivity | 🔜 Coming | Time allocation, focus blocks, fragmentation |

**Future**: Twitter/X, Notion, Obsidian, Goodreads, Letterboxd, Wakatime, Typeform, etc.

## Daily Insight Capsule

Each day at synthesis time, CapsuleOS generates a personalized **Insight Capsule**:

### Components
1. **Personality Signature** (2-4 words)
   - Example: "Adaptive Explorer" or "Focused Learner"
   - Generated from day's metric deviations

2. **Key Behavioral Insights** (3 observations)
   - Pattern analysis: "Multi-dimensional engagement detected"
   - Trend spotting: "Cross-domain consistency maintained"
   - Anomalies: "Peak exploration during evening hours"

3. **Trend Explanation** (1 sentence)
   - Comparative context: How today differs from your baseline
   - Direction: "Behavioral complexity increased 23% week-over-week"

4. **Shareable Summary** (1-liner)
   - For sharing without overwhelming detail
   - "Today revealed a balanced explorer with deepening focus"

### Generation Method
- **LLM-Generated** (Primary): Gemini API for rich narrative
  - Limited to 1 call/user/day (cost control)
  - Receives only aggregated metrics (privacy)
- **Template Fallback** (Graceful Degradation): Data-driven templates if LLM unavailable

## Installation & Setup

### Prerequisites
```bash
Node.js 18+
Supabase account (free tier sufficient)
GitHub account (optional, for GitHub integration)
Spotify Developer credentials (optional)
```

### Quick Start
```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Run development server
npm run dev
# Visit: http://localhost:5173

# Build for production
npm run build
```

### Environment Variables
```env
# Required
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional (for integrations)
VITE_SPOTIFY_CLIENT_ID=your-client-id
VITE_SPOTIFY_REDIRECT_URI=your-redirect-uri

# YouTube integration (Google OAuth)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5173/youtube/callback
```

### Supabase Configuration
1. Create Supabase project
2. Run migrations:
   ```sql
   -- Created automatically via migrations/
   ```
3. Set Edge Function secrets (automatic environment configuration)

### Integration Setup Guides
- **Spotify**: See [SPOTIFY_OAUTH_SETUP.md](SPOTIFY_OAUTH_SETUP.md)
- **YouTube**: See [YOUTUBE_OAUTH_SETUP.md](YOUTUBE_OAUTH_SETUP.md)

## Project Structure

```
src/
├── components/
│   ├── InteractiveDashboard.tsx    # Main 3D + UI container
│   ├── Canvas3D.tsx                # Three.js canvas setup
│   ├── Scene3D.tsx                 # 3D scene graph
│   ├── CentralCore.tsx             # Central intelligence node
│   ├── IntelligenceNode.tsx        # Data source nodes
│   ├── RetroDashboard.tsx          # NeoBrutalism UI overlay
│   └── LoginPage.tsx               # Retro auth screen
├── contexts/
│   └── AuthContext.tsx             # Supabase auth state
├── lib/
│   ├── supabase.ts                 # Supabase client
│   └── api.ts                      # API helper functions
├── App.tsx                         # Main router
└── index.css                       # Tailwind + custom styles

supabase/
├── migrations/
│   ├── 001_*_initial_schema.sql        # Initial setup
│   ├── 002_*_generic_schema.sql        # Generic intelligence schema
│   └── *_youtube_integration.sql       # YouTube tables & RLS
└── functions/
    ├── auth-spotify/                   # Spotify OAuth
    ├── auth-youtube/                   # YouTube OAuth
    ├── spotify-sync/                   # Spotify data sync
    ├── youtube-sync/                   # YouTube data sync
    ├── generate-capsule/               # LLM orchestration
    └── dashboard/                      # Data retrieval
```

## Technology Stack

### Frontend
- **React 18** + TypeScript (type-safe components)
- **Vite** (lightning-fast builds)
- **Tailwind CSS** (utility-first styling)
- **React Three Fiber** (R3F, 3D rendering)
- **Three.js** (3D graphics library)
- **Framer Motion** (smooth animations)
- **Lucide React** (icon library)
- **React Router v6** (client routing)

### Backend
- **Supabase** (PostgreSQL + Auth + Edge Functions)
- **Edge Functions** (Deno-based serverless)
- **Google Gemini API** (LLM orchestration)
- **Supabase RLS** (row-level security)

### Database Schema (Generic)
```sql
users                    -- User profiles
user_data_sources        -- Connected integrations
intelligence_sources     -- Available platforms registry
behavioral_metrics       -- Time-series metrics (source-agnostic)
metric_definitions       -- Versioned metric schemas
insight_capsules         -- Daily synthesis + AI insights
system_health            -- Platform health monitoring
```

## Key Design Patterns

### Modular Intelligence Architecture
Each data source is treated as a **black box**:
1. Fetch raw data from external API
2. Normalize to canonical internal format (NO metric computation)
3. Analytics Engine computes all metrics independently
4. LLM Orchestrator synthesizes insights from metrics only

Benefits:
- Add new sources without touching analytics
- Share analytics logic across sources
- Isolate failures to individual integrations
- Privacy: raw data never persisted

### Stateless Core, Stateful Edge
```
Stateless (Core Logic)
├── Analytics Engine
├── LLM Orchestrator
└── Capsule Synthesis

Stateful (Persistent Storage)
└── Supabase PostgreSQL
    ├── Metrics
    ├── Capsules
    └── Source Tokens
```

### Resilience Patterns
- **Circuit Breakers**: Prevent cascading failures
- **Graceful Degradation**: Fallback templates if LLM fails
- **Failure Isolation**: One broken source ≠ broken platform
- **Exponential Backoff**: Retry on transient errors

## Usage Flow

### 1. Authentication
- Sign up/login with email + password
- Supabase Auth handles session management
- JWT token persists in local storage

### 2. Connect Data Sources
- User clicks "Connect Source" in dashboard
- OAuth flow to external platform
- Encrypted tokens stored in `user_data_sources`
- Permissions: read-only, minimal scopes

### 3. Sync Behavioral Data
- User clicks "SYNC DATA" button
- Each enabled source:
  - Fetches recent data via API
  - Normalizes to internal format
  - Stores encrypted in Supabase
- Metrics computed deterministically
- Stored in `behavioral_metrics` table

### 4. Generate Insight Capsule
- Daily at 6 AM (user timezone, future feature)
- Retrieves today's metrics
- Prepares LLM context (current vs 30-day avg)
- Calls Gemini API (max 1/day)
- Caches result in `insight_capsules`
- If LLM fails: uses template instead

### 5. View Dashboard
- 3D scene with rotating intelligence nodes
- Real-time metric updates
- 7-day trend sparklines
- Today's insight capsule
- Share functionality

## Performance Metrics

### Build Size
- **Total**: 1.4 MB (gzipped: 419 KB)
- **Breakdown**:
  - Three.js: ~500 KB
  - React + React DOM: ~350 KB
  - UI Components & utilities: ~550 KB
  - Code splitting recommended for production

### Rendering
- **3D Frame Rate**: 60 FPS (auto-rotate + interactive)
- **Metric Query**: <200ms (Supabase RLS)
- **Dashboard Load**: <2s (including 3D scene)
- **Analytics Compute**: <30s per user

### Scalability
- **Concurrent Users**: 1,000+ (Supabase free tier)
- **Daily Syncs**: Capped at 1 per user
- **LLM Calls**: Capped at 1 per user per day
- **Storage**: ~1 MB per user per year (aggregated data)

## Security & Privacy

### Data Protection
- ✅ All tokens encrypted at-rest via Supabase
- ✅ RLS policies enforce user isolation
- ✅ No raw listening/browsing data persisted
- ✅ Only aggregated metrics stored
- ✅ HTTPS only (production)

### User Control
- ✅ Users can disconnect sources anytime
- ✅ Instant deletion of all associated data
- ✅ No data sharing with third parties
- ✅ No advertising or monetization
- ✅ GDPR-aligned data practices

### Compliance
- Data minimization: Only aggregated metrics
- User consent: Explicit OAuth scopes
- Portability: Export metrics in JSON format
- Deletion: Complete data wipe on account removal

## Roadmap

### Phase 1 (MVP - Complete ✓)
- [x] 3D interactive dashboard with retro UI
- [x] Generic schema for any data source
- [x] Spotify integration (music behavior)
- [x] Daily insight capsule generation
- [x] Metric computation + trend analysis

### Phase 2 (Live Now ✓)
- [x] **YouTube integration** (content consumption patterns)
- [x] **Cross-platform intelligence** (Spotify + YouTube synthesis)
- [x] Content identity classification
- [x] Intellectual diet analysis
- [x] Subscription health tracking
- [ ] GitHub integration (developer patterns)
- [ ] Reading platforms (learning analysis)
- [ ] Advanced trend prediction (30/60/90 day)
- [ ] Custom metric definitions (user-defined)

### Phase 3 (Future Vision)
- [ ] Cross-source correlation analysis
- [ ] Predictive behavioral modeling
- [ ] Personalized recommendations
- [ ] Community insights (anonymized)
- [ ] Mobile app (React Native)
- [ ] Offline sync (local-first)

## Contributing

This is a personal project showcasing:
- Modern 3D web visualization (Three.js)
- Retro-futuristic UI design (NeoBrutalism)
- Privacy-first architecture
- Extensible behavioral analytics
- Thoughtful UX for self-reflection

### Areas for Contribution
- New data source integrations
- Enhanced 3D visualizations
- Improved LLM prompt engineering
- Performance optimizations
- Additional metric definitions

## FAQ

### Is this music analytics?
**No.** Spotify is just one optional source. CapsuleOS treats it equally with YouTube, code, fitness, reading, productivity data.

### What if I don't use Spotify or YouTube?
CapsuleOS works with any data sources. You can:
- Use only Spotify or only YouTube
- Combine Spotify + YouTube for cross-platform insights
- Wait for future integrations (GitHub, Goodreads, etc.)
- Add custom data via API

### How often are insights generated?
By default, daily at 6 AM in your timezone. Manual sync anytime. Insights cached—never regenerated same day.

### Can I export my data?
Yes. All metrics available via API as JSON. Database schema designed for easy portability.

### Is my data sold?
No. Ever. CapsuleOS is built around privacy. No ads, no tracking, no monetization.

### How much does it cost?
Free. Runs on Supabase free tier + Google's free Gemini API tier. No paid upgrades planned.

## Resources

- **Design Inspiration**: [RetroUI.dev](https://www.retroui.dev)
- **3D Graphics**: [React Three Fiber Docs](https://r3f.docs.pmnd.rs)
- **Three.js**: [Three.js Documentation](https://threejs.org/docs)
- **Retro Aesthetics**: [NeoBrutalism Design](https://www.nngroup.com/articles/neobrutalism/)
- **Architecture**: See `requirements.md` and `design.md`

## License

MIT

---

Built to answer the question: **"What does my digital behavior reveal about who I am?"**

CapsuleOS transforms fragmented data into coherent self-insight.
