# AI Campus Assistant Implementation v2 - OpenAI Architecture

**Implementation Time:** 1-2 hours
**Complexity:** Low
**Prerequisites:** OpenAI account, $5-10 API credit
**Monthly Cost:** $0.50-5 (vs blocked Copilot Studio)

---

## Overview

This is a complete replacement for the Copilot Studio + Ably + Power Automate architecture with a **much simpler** OpenAI-based solution using TanStack Start server functions.

### What This System Does

Users can have natural conversations with an AI assistant that:
1. Answers questions about campus locations
2. Provides directions to facilities
3. **Automatically navigates the VR viewport** when users confirm

Example conversation:
```
User: "I can't find the library"
AI:   "The Library is about 50 meters southwest from your current location.
       From the main entrance, head down the hallway and turn left at the atrium.
       Would you like me to take you there?"
User: "Yes please"
AI:   [Automatically navigates viewport to library-main-entrance]
```

---

## Architecture Comparison

### Old Approach (Copilot Studio)
```
User → Copilot Studio iframe → Entity Extraction → Power Automate Flow
    → HTTP Request to Vercel → Ably WebSocket → Client Navigation
```

**Problems:**
- ❌ Blocked by license restrictions (can't publish)
- ❌ 5 services to maintain (Copilot, Power Automate, Ably, Vercel, KV)
- ❌ 21 hours implementation time (7 phases)
- ❌ $29-54/month ongoing costs
- ❌ Complex WebSocket infrastructure for single-client navigation

### New Approach (OpenAI + Server Functions)
```
User → Custom Chat UI → TanStack Server Function → OpenAI API
    → Function Call → Direct Client Navigation
```

**Benefits:**
- ✅ No licensing restrictions
- ✅ 1 service (OpenAI API)
- ✅ 1-2 hours implementation time
- ✅ $0.50-5/month cost
- ✅ Simple, direct architecture

---

## Technical Architecture

### Core Components

1. **Server Function (`src/lib/ai.ts`)**
   - `'use server'` directive ensures server-only execution
   - Calls OpenAI API with function calling
   - Returns navigation commands
   - **Fully type-safe** (TypeScript end-to-end)

2. **Chat Component (`src/components/chat/AICampusChat.tsx`)**
   - Custom React chat UI
   - Floating window with minimize/maximize
   - Conversation history management
   - Direct viewport navigation on AI response

3. **Integration (`src/routes/index.tsx`)**
   - Passes `currentPhotoId` for context
   - Passes `jumpToPhoto` callback for navigation
   - Zero modifications to existing navigation system

### Data Flow

```typescript
// 1. User sends message
const userMessage = "Take me to the library"

// 2. Call server function (looks like regular function!)
const result = await getChatResponse(messages, currentPhotoId)
//    ^? Full TypeScript type inference works here!

// 3. OpenAI returns function call
result = {
  message: "I'll take you to the library!",
  functionCall: {
    name: "navigate_to",
    arguments: { photoId: "library-main-entrance" }
  }
}

// 4. Client executes navigation
if (result.functionCall) {
  jumpToPhoto(result.functionCall.arguments.photoId)
  // Only THIS user's viewport navigates!
}
```

### Multi-User Isolation

**Each browser:**
- Has its own React state (`messages`, `currentPhotoId`)
- Makes independent HTTP requests
- Receives responses on its own connection
- Executes navigation in its own DOM

**Result:** 100 simultaneous users = 100 independent conversations + navigations. Zero interference.

---

## File Structure

```
src/
├── lib/
│   └── ai.ts                          # Server function for OpenAI calls
├── components/
│   └── chat/
│       └── AICampusChat.tsx          # Chat UI component
├── routes/
│   └── index.tsx                      # Main app (integration point)
└── types/
    └── tour.ts                        # Existing types (unchanged)
```

**Total new files:** 2
**Modified files:** 1
**Lines of code:** ~300

---

## Why Server Functions vs API Routes?

### Server Functions (RECOMMENDED)
```typescript
// Define
export async function getChatResponse(...) {
  'use server'
  // OpenAI call
}

// Use
const result = await getChatResponse(messages, location)
//    ^? Full type safety!
```

**Pros:**
- ✅ End-to-end type safety (no manual type assertions)
- ✅ Simpler syntax (looks like regular function call)
- ✅ Less boilerplate (no fetch, headers, JSON parsing)
- ✅ Better error handling (try/catch works naturally)

**Cons:**
- ❌ Can't be called from external services (not relevant for single web app)
- ❌ Harder to add complex rate limiting (but OpenAI has built-in limits)

### For This Use Case
Server functions are **perfect** because:
1. Single web app (no mobile app, no external access needed)
2. OpenAI handles rate limiting automatically
3. Type safety is extremely valuable for AI responses
4. Simpler code = faster implementation

---

## Security & Cost Control

### API Key Protection
```typescript
// Server function
'use server'
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY! // Never exposed to client
})
```

**How it works:**
- Server functions only run on server
- API key never bundled to client
- Client only calls `/api/_server-fn/getChatResponse` endpoint
- TanStack Start automatically creates secure RPC endpoint

### Cost Protection

**OpenAI Built-in Limits:**
- 500 requests/minute (Tier 1 account)
- 200,000 tokens/minute
- If exceeded: OpenAI returns 429 error automatically

**Additional Protection (optional):**
```typescript
export async function getChatResponse(...) {
  'use server'

  // Limit conversation length
  if (messages.length > 20) {
    throw new Error('Conversation too long')
  }

  // Limit message size
  const totalChars = messages.reduce((sum, m) => sum + m.content.length, 0)
  if (totalChars > 5000) {
    throw new Error('Message too long')
  }

  // OpenAI call...
}
```

**Monthly cost estimate:**
- 100 users × 10 messages/day = 1,000 messages/day
- ~280 tokens per message
- 280,000 tokens/day = 8.4M tokens/month
- Cost: ~$126/month @ 100 active daily users
- **Compare to:** Copilot Studio (blocked, can't even deploy)

---

## Implementation Phases

### Phase 1: Setup & Dependencies (15 minutes)
- Install OpenAI SDK
- Create OpenAI account
- Add API key to environment
- Test basic connection

### Phase 2: Server Function (20 minutes)
- Create `src/lib/ai.ts`
- Implement OpenAI function calling
- Define navigation function schema
- Add error handling

### Phase 3: Chat Component (30 minutes)
- Create `src/components/chat/AICampusChat.tsx`
- Build floating chat UI
- Implement conversation state
- Add minimize/maximize/close controls

### Phase 4: Integration (15 minutes)
- Update `src/routes/index.tsx`
- Pass `currentPhotoId` and `jumpToPhoto`
- Test navigation flow

### Phase 5: Testing & Polish (15 minutes)
- Test multi-turn conversations
- Test navigation commands
- Test error handling
- Deploy to Vercel

**Total: 1 hour 35 minutes**

---

## Success Criteria

After implementation, verify:

✅ **Functionality:**
- Users can chat about campus locations
- AI provides helpful directions
- Navigation triggers automatically on confirmation
- Conversation history persists during session

✅ **Performance:**
- AI responses in 1-2 seconds
- No UI freezing during requests
- Smooth viewport navigation
- Multi-user isolation working

✅ **User Experience:**
- Chat UI is intuitive and accessible
- Minimize/maximize works smoothly
- Error messages are helpful
- Mobile-responsive layout

✅ **Cost & Security:**
- API key never exposed to client
- OpenAI costs within budget
- No rate limit exceeded errors

---

## What You're NOT Building

**Don't need:**
- ❌ WebSocket infrastructure (Ably)
- ❌ Complex authentication system
- ❌ Rate limiting database (Vercel KV)
- ❌ Navigation graph builder
- ❌ BFS pathfinding algorithm
- ❌ Power Automate flows
- ❌ Entity CSV files
- ❌ Session token validation
- ❌ CORS configuration
- ❌ Real-time message bus

**Why not?**
- Single-client navigation (no multi-user coordination needed)
- HTTP request/response is sufficient
- OpenAI handles rate limiting
- Simple is better

---

## Next Steps

**Ready to implement?**

Proceed to: [Phase 1 - Setup & Dependencies](./phase-1-setup.md)

**Estimated completion time:** 1-2 hours for full working system
