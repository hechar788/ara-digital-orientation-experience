# AI-Powered Navigation Implementation Plan v3.0

## Executive Summary

This implementation plan delivers a **production-ready** AI navigation system using **Ably Realtime** for instant command delivery and **Microsoft Copilot Studio** for natural language interaction. The architecture is designed specifically for **TanStack Start** SSR requirements and **Vercel deployment**.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│ User Browser                                                    │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ TanStack Start React App (SSR)                             │ │
│ │ • Session ID in localStorage                               │ │
│ │ • Ably client (WebSocket) subscribes to personal channel  │ │
│ │ • Receives navigation commands instantly (<100ms)         │ │
│ │ • Updates viewport via jumpToPhoto()                       │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
              ↕ WebSocket (via Ably Cloud)
┌─────────────────────────────────────────────────────────────────┐
│ Ably Realtime Cloud                                             │
│ • Manages WebSocket connections                                 │
│ • Routes messages to correct clients                            │
│ • Message history (2-minute replay on reconnect)                │
│ • 200 concurrent connections (free tier)                        │
└─────────────────────────────────────────────────────────────────┘
              ↕ REST API (publish)
┌─────────────────────────────────────────────────────────────────┐
│ Vercel Serverless Functions                                     │
│                                                                  │
│ API Routes:                                                      │
│ • POST /api/ably-token         - Secure token generation       │
│ • POST /api/navigate-to/:id    - Calculate & publish route     │
│ • GET  /api/location-directory - Generate knowledge base       │
│                                                                  │
│ Data:                                                            │
│ • Pre-built navigation graph (compile-time)                     │
│ • Location directory (for Copilot knowledge base)               │
│                                                                  │
│ Storage (Vercel KV):                                             │
│ • session:{id}:token    - Auth token                            │
│ • session:{id}:state    - Current nav state (optional)          │
│ • analytics:*           - Usage tracking                         │
└─────────────────────────────────────────────────────────────────┘
              ↕ HTTP Webhook
┌─────────────────────────────────────────────────────────────────┐
│ Microsoft Copilot Studio                                        │
│                                                                  │
│ Knowledge Base:                                                  │
│ • location-directory.json (uploaded once)                       │
│ • ~20-30 key locations with aliases                             │
│                                                                  │
│ Topics:                                                          │
│ • "Navigate to Location" - Handles user requests                │
│                                                                  │
│ Power Automate Flow:                                             │
│ • Extract sessionId + photoId from context                      │
│ • POST to /api/navigate-to/:photoId                             │
│ • Return success/error to user                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Improvements from v2

| Issue | v2 (Broken) | v3 (Fixed) |
|-------|-------------|------------|
| **SSE on Vercel Edge** | Stateless isolates can't share connections | Ably maintains state in their cloud |
| **Queue draining** | Commands queued but never dequeued | Ably delivers all messages in order |
| **Location tracking** | Missing KV writes | Client sends in navigation trigger |
| **EventSource recreation** | Tears down connection on every step | Ably handles reconnection automatically |
| **Cost analysis** | Overstated by 3X | Accurate with Ably free tier limits |
| **Client ack protocol** | Undefined | Not needed (Ably handles reliability) |
| **Token sync** | Hand-wavy | Proper token auth endpoint |

---

## Cost Analysis (Accurate)

### Per-User Session Breakdown

**User Flow:**
1. Open VR tour → Generate session ID (localStorage)
2. Connect to Ably → Request token from `/api/ably-token` (1 KV read)
3. Ask Copilot "Take me to library" → Agent calls `/api/navigate-to/library-main`
4. Server calculates route (8 steps) → Publishes 8 messages to Ably
5. Client receives 8 messages → Navigates through route
6. Session ends

**Resource Usage per Session:**

| Service | Operation | Count | Cost |
|---------|-----------|-------|------|
| **Vercel KV** | Token storage/retrieval | 2 | Free tier |
| **Vercel Functions** | Token generation | 1 | Free tier |
| **Vercel Functions** | Navigate-to API call | 1 | Free tier |
| **Ably Messages** | Navigation commands | 8 | Free tier |
| **Ably Connection** | 10-min active connection | 1 | Free tier |

**Total KV commands:** 2 per session

**Monthly Capacity (Free Tiers):**

```
Vercel KV: 30,000 commands/month
÷ 2 commands/session
= 15,000 sessions/month
= 500 sessions/day

Ably: 6M messages/month, 200 concurrent connections
Average session: 8 messages, 10 minutes
= 750,000 sessions/month (message-limited)
= 200 concurrent users (connection-limited)
= Effectively 200 concurrent / 10 min per session
= ~28,800 sessions/day (connection-limited)

Bottleneck: Ably concurrent connections (200)
Real capacity: ~300-400 sessions/day in practice
```

**Scaling Costs:**

| Daily Users | Monthly Sessions | Cost |
|-------------|------------------|------|
| 0-300 | 9,000 | **$0** (free tiers) |
| 300-500 | 15,000 | **$29/mo** (Ably Scale) |
| 500-1000 | 30,000 | **$29/mo** (Ably Scale) |
| 1000+ | 30,000+ | **$29/mo + overage** |

**You can support 300 daily users on free tier indefinitely.**

---

## Implementation Timeline

| Phase | Description | Duration | Dependencies |
|-------|-------------|----------|--------------|
| **Phase 1** | Foundation & Setup | 4 hours | None |
| **Phase 2** | Core Navigation System | 4 hours | Phase 1 |
| **Phase 3** | Ably Integration | 3 hours | Phase 2 |
| **Phase 4** | Copilot Studio Setup | 2 hours | Phase 3 |
| **Phase 5** | User Experience & Controls | 3 hours | Phase 4 |
| **Phase 6** | Security & Production | 2 hours | Phase 5 |
| **Phase 7** | Testing & Deployment | 3 hours | Phase 6 |
| **Total** | End-to-end implementation | **21 hours** | (~3 days) |

---

## Phase Checklist

Use this checklist to track implementation progress. Each phase has detailed step-by-step instructions in its own file.

### Phase 1: Foundation & Setup
**File:** [phase-1-foundation.md](./phase-1-foundation.md)
**Duration:** 4 hours
**Objective:** Set up accounts, install dependencies, create build scripts

- [ ] 1.1 - Create Ably account and get API keys
- [ ] 1.2 - Install required npm packages
- [ ] 1.3 - Configure environment variables
- [ ] 1.4 - Create build script for navigation graph
- [ ] 1.5 - Create location directory generator
- [ ] 1.6 - Validate graph connectivity
- [ ] 1.7 - Generate initial static assets
- [ ] **Validation:** Graph JSON exists, location directory has 20+ entries

---

### Phase 2: Core Navigation System
**File:** [phase-2-core-navigation.md](./phase-2-core-navigation.md)
**Duration:** 4 hours
**Objective:** Implement BFS pathfinding and navigation graph

- [ ] 2.1 - Create navigation graph types
- [ ] 2.2 - Implement graph builder (fix array edge bug)
- [ ] 2.3 - Implement BFS pathfinding algorithm
- [ ] 2.4 - Add graph validation functions
- [ ] 2.5 - Create compile-time graph generation
- [ ] 2.6 - Write unit tests for pathfinding
- [ ] 2.7 - Add location directory API endpoint
- [ ] **Validation:** Tests pass, graph validates, routes calculate correctly

---

### Phase 3: Ably Integration
**File:** [phase-3-ably-integration.md](./phase-3-ably-integration.md)
**Duration:** 3 hours
**Objective:** Integrate Ably for real-time messaging

- [ ] 3.1 - Create Ably token auth endpoint
- [ ] 3.2 - Create client-only Ably wrapper component
- [ ] 3.3 - Implement navigation-to API endpoint
- [ ] 3.4 - Test message publishing from server
- [ ] 3.5 - Test message receiving in client
- [ ] 3.6 - Implement connection status indicator
- [ ] 3.7 - Handle reconnection with message replay
- [ ] **Validation:** Messages arrive in <200ms, reconnection works, no SSR crashes

---

### Phase 4: Copilot Studio Setup
**File:** [phase-4-copilot-setup.md](./phase-4-copilot-setup.md)
**Duration:** 2 hours
**Objective:** Configure Copilot Studio with knowledge base and flows

- [ ] 4.1 - Generate location-directory.json
- [ ] 4.2 - Upload knowledge base to Copilot Studio
- [ ] 4.3 - Create "Navigate to Location" topic
- [ ] 4.4 - Configure global variables (sessionId)
- [ ] 4.5 - Create Power Automate flow
- [ ] 4.6 - Test knowledge base resolution
- [ ] 4.7 - Test end-to-end navigation from Copilot
- [ ] **Validation:** User can say "take me to library" and viewport navigates

---

### Phase 5: User Experience & Controls
**File:** [phase-5-user-experience.md](./phase-5-user-experience.md)
**Duration:** 3 hours
**Objective:** Add navigation controls, progress UI, and preferences

- [ ] 5.1 - Create navigation progress component
- [ ] 5.2 - Implement pause/resume controls
- [ ] 5.3 - Implement cancel navigation
- [ ] 5.4 - Add speed preference settings
- [ ] 5.5 - Create connection status indicator
- [ ] 5.6 - Add navigation timing/pacing
- [ ] 5.7 - Implement error notifications
- [ ] **Validation:** User can control navigation, see progress, adjust speed

---

### Phase 6: Security & Production Readiness
**File:** [phase-6-security-production.md](./phase-6-security-production.md)
**Duration:** 2 hours
**Objective:** Implement security, rate limiting, error handling

- [ ] 6.1 - Implement session token validation
- [ ] 6.2 - Add rate limiting to API endpoints
- [ ] 6.3 - Configure CORS for Copilot domains
- [ ] 6.4 - Implement comprehensive error handling
- [ ] 6.5 - Add analytics tracking
- [ ] 6.6 - Set up error monitoring (Sentry/Vercel)
- [ ] 6.7 - Create feature flags
- [ ] **Validation:** API rejects invalid tokens, rate limits trigger, errors are handled gracefully

---

### Phase 7: Testing & Deployment
**File:** [phase-7-testing-deployment.md](./phase-7-testing-deployment.md)
**Duration:** 3 hours
**Objective:** Test thoroughly and deploy to production

- [ ] 7.1 - Run unit tests (pathfinding)
- [ ] 7.2 - Run integration tests (API endpoints)
- [ ] 7.3 - Manual testing checklist (20+ items)
- [ ] 7.4 - Load testing (simulate 50 concurrent users)
- [ ] 7.5 - Deploy to Vercel preview
- [ ] 7.6 - Test with production Copilot
- [ ] 7.7 - Deploy to production
- [ ] 7.8 - Monitor for 24 hours
- [ ] **Validation:** All tests pass, production deployment successful, no critical errors

---

## Quick Start

**To begin implementation:**

1. Read [phase-1-foundation.md](./phase-1-foundation.md)
2. Complete Phase 1 checklist (4 hours)
3. Validate Phase 1 before moving to Phase 2
4. Repeat for each phase in order

**Do NOT skip phases.** Each phase builds on the previous one.

---

## File Structure After Implementation

```
src/
├── routes/
│   ├── index.tsx                           # Main VR tour page
│   └── api/
│       ├── ably-token.tsx                  # Ably auth endpoint
│       ├── navigate-to/
│       │   └── $photoId.tsx                # Navigation trigger
│       └── location-directory.tsx          # Knowledge base generator
│
├── components/
│   ├── AblyNavigation.client.tsx           # Client-only Ably wrapper
│   ├── NavigationControls.tsx              # User controls (pause/cancel)
│   └── ConnectionStatus.tsx                # Connection indicator
│
├── hooks/
│   ├── useNavigationState.ts               # Navigation state management
│   └── useNavigationSpeed.ts               # Speed preferences
│
├── lib/
│   ├── session.ts                          # Session ID management
│   ├── kv.ts                               # Vercel KV wrapper
│   └── analytics.ts                        # Event tracking
│
├── data/
│   ├── navigationGraph.ts                  # Runtime graph loader
│   └── blockUtils.ts                       # Existing data utilities
│
└── types/
    └── navigation.ts                       # Type definitions

scripts/
├── build-navigation-graph.ts               # Compile-time graph builder
└── validate-graph.ts                       # Graph validation script

public/
├── navigation-graph.json                   # Pre-built graph (generated)
└── location-directory.json                 # Copilot knowledge base (generated)

tests/
├── unit/
│   └── navigationGraph.test.ts             # Pathfinding tests
└── integration/
    ├── ably-token.test.ts                  # Token auth tests
    └── navigate-to.test.ts                 # Navigation API tests
```

---

## Prerequisites

Before starting, ensure you have:

- [ ] Node.js 18+ installed
- [ ] Git repository set up
- [ ] Vercel account (free tier)
- [ ] Access to Vercel KV (already set up in your project)
- [ ] Microsoft Copilot Studio access
- [ ] Text editor/IDE (VS Code recommended)
- [ ] Basic understanding of React, TypeScript, TanStack Start

---

## Support & Troubleshooting

Each phase includes:
- **Validation Steps** - How to verify phase completion
- **Troubleshooting** - Common issues and solutions
- **Rollback Plan** - How to undo if things go wrong

**If you get stuck:**
1. Check the troubleshooting section in the phase file
2. Validate prerequisites were completed
3. Check Vercel logs for errors
4. Check browser console for client errors

---

## Success Metrics

After full implementation, you should achieve:

- ✅ **Latency:** Navigation commands arrive in <200ms
- ✅ **Reliability:** 99.9% message delivery success
- ✅ **Capacity:** Supports 300 daily active users on free tier
- ✅ **UX:** Users can pause, resume, cancel navigation
- ✅ **Security:** Token authentication, rate limiting, CORS
- ✅ **Monitoring:** Analytics, error tracking, usage metrics

---

## Next Steps

**Start with Phase 1:** [phase-1-foundation.md](./phase-1-foundation.md)

Read through the entire phase before starting. Each step is numbered and sequential.

**Estimated total time to production:** 21 hours (3 working days)

---

## Version History

- **v1.0** (Rejected) - Polling-based architecture, exceeded free tier at 15 users
- **v2.0** (Broken) - SSE on Vercel Edge, stateless isolates caused failures
- **v3.0** (Current) - Ably Realtime with proper SSR handling, production-ready

---

## Credits

- **Ably Realtime** - WebSocket infrastructure
- **Microsoft Copilot Studio** - Natural language understanding
- **TanStack Start** - React SSR framework
- **Vercel** - Deployment platform
