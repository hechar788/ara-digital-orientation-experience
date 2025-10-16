# Phase 4: Main App Integration

**Duration:** 15 minutes
**Difficulty:** Easy
**Prerequisites:** Phase 3 complete

---

## Objectives

By the end of this phase, you will have:

1. ✅ Chat component integrated into main app
2. ✅ Navigation system connected
3. ✅ Current location context working
4. ✅ Complete end-to-end flow tested
5. ✅ Production-ready implementation

---

## Step 4.1: Integrate Chat into Main App

**Time:** 5 minutes

### Update Main Route

Update `src/routes/index.tsx` to add the chat component:

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { PanoramicViewer } from '../components/viewer/PanoramicViewer'
import { PanoramicZoomSlider } from '../components/viewer/PanoramicZoomSlider'
import { Minimap } from '../components/viewer/Minimap'
import { Spinner } from '../components/ui/shadcn-io/spinner'
import { OnboardingProvider } from '../components/tour/onboarding/OnboardingContext'
import { useTourNavigation } from '../hooks/useTourNavigation'
import { useRaceStore } from '../hooks/useRaceStore'
import { RaceLocationCounter } from '../components/race/RaceLocationCounter'
import { TOTAL_HIDDEN_LOCATIONS } from '../data/hidden_locations/hiddenLocations'
import { AICampusChat } from '../components/chat/AICampusChat'  // ← ADD THIS
import type { DirectionType } from '../types/tour'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const {
    currentPhoto,
    currentPhotoImage,
    currentArea,
    isLoading,
    navigateDirection,
    jumpToPhoto,
    currentPhotoId,
    cameraLon,
    cameraLat,
    calculatedCameraAngle,
    handleCameraChange
  } = useTourNavigation()

  const [currentFov, setCurrentFov] = useState(81)
  const [isRaceMode, setIsRaceMode] = useState(false)
  const { hiddenLocationsCount } = useRaceStore()

  return (
    <OnboardingProvider>
      <div className="h-screen w-screen overflow-hidden bg-gray-900 relative">
        {/* Map and Navigation Info - Top Right */}
        <div className="absolute top-4 right-4 z-40 flex flex-col gap-1.5 items-end">
          <Minimap
            currentArea={currentArea}
            currentPhotoId={currentPhotoId}
            isRaceMode={isRaceMode}
          />

          {/* Zoom Slider */}
          <PanoramicZoomSlider
            currentFov={currentFov}
            onZoomChange={setCurrentFov}
            className="w-[11.55rem] lg:w-62 !py-1.5"
          />

          {/* Race Locations Counter - Only in Race Mode */}
          {isRaceMode && (
            <RaceLocationCounter
              locationsFound={hiddenLocationsCount}
              totalLocations={TOTAL_HIDDEN_LOCATIONS}
              className="w-[11.55rem] lg:w-62"
            />
          )}
        </div>

        <PanoramicViewer
          imageUrl={currentPhoto?.imageUrl ?? ''}
          photoImage={currentPhotoImage}
          className="w-full h-full"
          startingAngle={currentPhoto?.startingAngle}
          calculatedCameraAngle={calculatedCameraAngle}
          initialLon={cameraLon}
          initialLat={cameraLat}
          onCameraChange={handleCameraChange}
          currentPhoto={currentPhoto}
          onNavigate={(direction) => navigateDirection(direction as DirectionType)}
          onNavigateToPhoto={jumpToPhoto}
          cameraLon={cameraLon}
          initialFov={currentFov}
          onFovChange={setCurrentFov}
          timerClassName="absolute top-4 left-4 z-40"
          onRaceModeChange={setIsRaceMode}
        />

        {/* Navigation loading spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
            <Spinner className="text-gray-500" size={48} />
          </div>
        )}

        {/* AI Campus Chat - ADD THIS */}
        <AICampusChat
          currentPhotoId={currentPhotoId}
          onNavigate={jumpToPhoto}
        />
      </div>
    </OnboardingProvider>
  )
}
```

**What changed:**
1. Added import for `AICampusChat`
2. Added `<AICampusChat>` component at the end (before closing `</div>`)
3. Passed `currentPhotoId` for context
4. Passed `jumpToPhoto` for navigation

✅ **Validation:** File compiles with no TypeScript errors

---

## Step 4.2: Test End-to-End Flow

**Time:** 10 minutes

### Start Development Server

```bash
npm run dev
```

### Open Application

Visit: http://localhost:3000

### Test Complete Flow

**Test 1: Chat Appears**
- ✅ Chat widget should appear in bottom-right corner
- ✅ Shows "Campus Assistant" header
- ✅ Has initial greeting message
- ✅ Input field is ready

**Test 2: Simple Conversation**
1. Type: "Hello"
2. Press Enter
3. ✅ AI responds with greeting
4. ✅ No navigation triggered

**Test 3: Location Query**
1. Type: "Where is the library?"
2. Press Enter
3. ✅ AI provides directions
4. ✅ AI asks if you want automatic navigation
5. ✅ No navigation yet (waiting for confirmation)

**Test 4: Navigation Confirmation**
1. Type: "Yes please"
2. Press Enter
3. ✅ AI responds confirming navigation
4. ✅ Viewport **automatically navigates to library**
5. ✅ URL/state updates to library location
6. ✅ Only YOUR viewport moved (if testing with multiple tabs)

**Test 5: Different Location**
1. Type: "Take me to the gym"
2. Press Enter
3. ✅ Viewport navigates to gym

**Test 6: UI Controls**
1. Click minimize button
   - ✅ Chat minimizes to header bar
2. Click maximize button
   - ✅ Chat expands back
3. Click X button
   - ✅ Chat closes completely

**Test 7: Multi-User Isolation** (Optional)
1. Open app in two different browser windows
2. In Window 1: Navigate to library via AI
3. In Window 2: Navigate to gym via AI
4. ✅ Each window navigates independently
5. ✅ No interference between windows

**Test 8: Error Handling**
1. Type a very long message (5000+ characters)
2. ✅ Error message appears
3. Type 25 short messages in a row
4. ✅ "Conversation too long" error appears

**Test 9: Current Location Context**
1. Manually navigate to different location using arrows
2. Ask AI: "Where am I?"
3. ✅ AI describes current location correctly
4. ✅ Directions are relative to current location

### Verify No Regressions

**Existing Features Still Work:**
- ✅ Manual navigation (arrow buttons)
- ✅ Minimap displays correctly
- ✅ Zoom slider works
- ✅ Race mode still functional
- ✅ Onboarding flow unchanged
- ✅ All existing UI elements visible

✅ **Validation:** All tests pass, no regressions

---

## Step 4.3: Mobile Responsive Testing

**Time:** 5 minutes (optional)

### Test on Mobile Screen Size

In browser dev tools:
1. Press `F12` to open DevTools
2. Click device toggle (mobile icon)
3. Select "iPhone 12 Pro" or similar

### Mobile Tests

**Chat UI:**
- ✅ Chat width adjusts to screen (`max-width: calc(100vw - 2rem)`)
- ✅ Messages are readable
- ✅ Input field is usable
- ✅ Controls (minimize/close) are tappable

**Navigation:**
- ✅ AI navigation works on mobile
- ✅ Viewport updates correctly
- ✅ No UI overlap issues

**Fixes if needed:**

If chat is too wide on mobile, update the component:

```typescript
// In AICampusChat.tsx
<div
  className={`fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-300 ${
    isMinimized ? 'w-80 h-14' : 'w-96 h-[600px] md:w-96 md:h-[600px] w-full h-[500px]'
  }`}
  style={{ maxWidth: 'calc(100vw - 2rem)' }}
>
```

This makes it full-width on small screens, fixed-width on desktop.

✅ **Validation:** Chat works on mobile screens

---

## Step 4.4: Production Environment Variables

**Time:** 2 minutes

### Configure Vercel Environment Variables

When deploying to Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add variable:
   - **Key:** `OPENAI_API_KEY`
   - **Value:** `sk-proj-your-actual-key-here`
   - **Environments:** Production, Preview, Development

4. Click **Save**

**Important:**
- ✅ Never commit `.env.local` to git
- ✅ Add separate API keys for development vs production (optional but recommended)
- ✅ Set up budget alerts in OpenAI dashboard

### Deployment Command

```bash
git add .
git commit -m "Add AI campus chat assistant with OpenAI integration"
git push origin development
```

Vercel will automatically deploy with the environment variables.

✅ **Validation:** Environment variables configured for production

---

## Phase 4 Complete! 🎉

### Checklist Review

- [x] 4.1 - Integrated chat into main app
- [x] 4.2 - Tested complete end-to-end flow
- [x] 4.3 - (Optional) Tested mobile responsiveness
- [x] 4.4 - Configured production environment variables

### What You Accomplished

✅ **Complete AI chat integration**
✅ **Navigation system connected**
✅ **Multi-user isolation verified**
✅ **No regressions in existing features**
✅ **Production-ready implementation**

### Integration Summary

**Files Modified:** 1
- `src/routes/index.tsx` - Added chat component

**Files Created:** 2
- `src/lib/ai.ts` - Server function
- `src/components/chat/AICampusChat.tsx` - Chat UI

**Lines of Code Added:** ~350

**Total Implementation Time:** ~1 hour 30 minutes

---

## Architecture Diagram

```
User's Browser
├── React Components
│   ├── PanoramicViewer (existing)
│   ├── Minimap (existing)
│   └── AICampusChat (NEW)
│       ├── Input field
│       ├── Messages display
│       └── Calls getChatResponse(...)
│
├── Server Function (src/lib/ai.ts)
│   ├── Receives: messages + currentLocation
│   ├── Calls: OpenAI API
│   └── Returns: AI response + navigation command
│
└── OpenAI API
    ├── GPT-4 Turbo model
    ├── Function calling for navigation
    └── Returns: { message, functionCall }

Navigation Flow:
User message → Server function → OpenAI → Function call → jumpToPhoto() → Viewport navigates
```

---

## Cost Analysis

**Current Implementation:**
- Server function approach (no Vercel KV)
- OpenAI API only
- No Ably, no Copilot Studio, no Power Automate

**Monthly Cost Estimate:**
- 100 users × 10 messages/day = 1,000 messages/day
- ~280 tokens per message
- 280,000 tokens/day = 8.4M tokens/month
- **Cost: ~$126/month @ 100 active daily users**

**Cost per conversation:** ~$0.005

**Compare to Copilot Studio approach:**
- ❌ Blocked (can't publish without license)
- Would be: $15/month + $29/month Ably = $44/month MINIMUM
- Plus: 21 hours implementation vs 1.5 hours

---

## Next Steps

**Proceed to Phase 5:** [Phase 5 - Testing & Deployment](./phase-5-testing-deployment.md)

You'll implement:
- Comprehensive testing checklist
- Performance monitoring
- Cost tracking setup
- Production deployment
- Post-launch monitoring

**Estimated time:** 15 minutes
