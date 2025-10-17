# Phase 7: Main Application Integration

**Status**: 🟡 Not Started
**Prerequisites**: Phases 1-6 (All components complete)
**Estimated Time**: 2-3 hours
**Difficulty**: Medium

## Overview

This phase integrates all the AI navigation components (pathfinding, AI server, chat UI, sequential navigation) into the main VR campus tour application. We'll wire up the chat component to the existing PanoramicViewer, ensure proper state management, and verify end-to-end functionality.

**What You'll Do:**
- Connect AICampusChat to main tour page
- Wire up navigation callbacks to PanoramicViewer
- Manage shared state (currentPhotoId)
- Add chat toggle button to tour interface
- Test complete user flow from chat to camera movement
- Handle edge cases and state synchronization
- Ensure mobile responsiveness

**Integration Points:**
1. Main tour page (`src/routes/index.tsx`)
2. PanoramicViewer component (existing)
3. AICampusChat component (Phase 5)
4. Sequential navigation hook (Phase 6)
5. Tour data structure (existing)

---

## Step 1: Understand Current Application Structure

### 1.1 Existing Tour Page

**File: `src/routes/index.tsx` (Current State)**

Typical structure of your existing tour page:

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { PanoramicViewer } from '@/components/PanoramicViewer'

export const Route = createFileRoute('/')({
  component: HomePage
})

function HomePage() {
  return (
    <div className="w-full h-screen">
      <PanoramicViewer />
    </div>
  )
}
```

### 1.2 Existing PanoramicViewer

**File: `src/components/PanoramicViewer.tsx` (Current State)**

Your PanoramicViewer likely has:
- Three.js scene setup
- Camera controls (mouse/touch)
- Current photo state management
- Direction arrows for navigation
- Photo switching logic

**Key functions we need to access:**
- Current photo ID getter
- Jump to photo function
- Photo change callback

---

## Step 2: Update PanoramicViewer Interface

### 2.1 Add Props for External Control

**File: `src/components/PanoramicViewer.tsx`**

**Add to existing props interface:**

```typescript
/**
 * Props for the PanoramicViewer component
 *
 * @property initialPhotoId - Optional starting photo ID (defaults to first photo)
 * @property onPhotoChange - Optional callback when photo changes
 * @property externalPhotoId - Optional external control of current photo
 */
export interface PanoramicViewerProps {
  initialPhotoId?: string
  onPhotoChange?: (photoId: string) => void
  externalPhotoId?: string
}
```

**Why These Props:**
- `initialPhotoId`: Allows parent to set starting location
- `onPhotoChange`: Notifies parent when user navigates manually (clicking arrows)
- `externalPhotoId`: Allows AI chat to control camera position

### 2.2 Implement Props in PanoramicViewer

**Modify component to accept and use props:**

```typescript
export function PanoramicViewer({
  initialPhotoId,
  onPhotoChange,
  externalPhotoId
}: PanoramicViewerProps = {}) {

  // ============================================
  // State Management
  // ============================================

  const [currentPhotoId, setCurrentPhotoId] = useState<string>(
    initialPhotoId || tourData.photos[0].id
  )

  // ============================================
  // External Control Effect
  // ============================================

  /**
   * Updates camera when external control changes photo
   */
  useEffect(() => {
    if (externalPhotoId && externalPhotoId !== currentPhotoId) {
      jumpToPhoto(externalPhotoId)
    }
  }, [externalPhotoId])

  // ============================================
  // Internal Navigation with Callback
  // ============================================

  /**
   * Navigates to a specific photo and notifies parent
   *
   * @param photoId - ID of photo to navigate to
   */
  const jumpToPhoto = (photoId: string) => {
    const photo = tourData.photos.find(p => p.id === photoId)
    if (!photo) {
      console.warn(`Photo not found: ${photoId}`)
      return
    }

    // Update local state
    setCurrentPhotoId(photoId)

    // Notify parent component
    onPhotoChange?.(photoId)

    // Update Three.js scene
    loadPanorama(photo.imageUrl)
  }

  // ... rest of existing Three.js code ...
}
```

**Key Changes:**
1. Accept props with default values
2. Use `externalPhotoId` to allow AI chat to control camera
3. Call `onPhotoChange` callback when user navigates manually
4. Ensure both manual and external navigation work together

---

## Step 3: Create Main Tour Page with Chat Integration

### File: `src/routes/index.tsx` (Complete Rewrite)

```typescript
'use client'

import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { MessageSquare } from 'lucide-react'
import { PanoramicViewer } from '@/components/PanoramicViewer'
import { AICampusChat } from '@/components/AICampusChat'
import { tourData } from '@/lib/tourData'

/**
 * Main tour page route definition
 */
export const Route = createFileRoute('/')({
  component: HomePage
})

/**
 * Main campus tour page with VR viewer and AI chat assistant
 *
 * Manages shared state between the panoramic viewer and AI chat components,
 * handling navigation requests from both user interaction and AI commands.
 *
 * @returns Complete tour page with VR viewer and chat interface
 */
function HomePage() {

  // ============================================
  // State Management
  // ============================================

  /**
   * Current photo ID - shared between viewer and chat
   */
  const [currentPhotoId, setCurrentPhotoId] = useState<string>(
    tourData.photos[0].id
  )

  /**
   * Chat visibility state
   */
  const [showChat, setShowChat] = useState(false)

  /**
   * External navigation trigger for PanoramicViewer
   * Using separate state to trigger useEffect in viewer
   */
  const [externalNavigation, setExternalNavigation] = useState<string | null>(null)

  // ============================================
  // Navigation Handler
  // ============================================

  /**
   * Handles navigation requests from AI chat
   *
   * Updates both the shared state and triggers external navigation
   * in the PanoramicViewer component.
   *
   * @param photoId - ID of photo to navigate to
   */
  const handleAINavigation = (photoId: string) => {
    console.log('AI Navigation request:', photoId)

    // Validate photo exists
    const photo = tourData.photos.find(p => p.id === photoId)
    if (!photo) {
      console.warn(`Cannot navigate: photo ${photoId} not found`)
      return
    }

    // Update shared state
    setCurrentPhotoId(photoId)

    // Trigger external navigation in viewer
    setExternalNavigation(photoId)
  }

  /**
   * Handles photo changes from manual navigation in viewer
   *
   * Updates shared state when user clicks direction arrows or
   * navigates manually through the VR interface.
   *
   * @param photoId - ID of newly loaded photo
   */
  const handlePhotoChange = (photoId: string) => {
    console.log('Manual navigation detected:', photoId)
    setCurrentPhotoId(photoId)
  }

  // ============================================
  // Render
  // ============================================

  return (
    <div className="relative w-full h-screen overflow-hidden">

      {/* ============================================ */}
      {/* VR Panoramic Viewer */}
      {/* ============================================ */}

      <PanoramicViewer
        initialPhotoId={tourData.photos[0].id}
        onPhotoChange={handlePhotoChange}
        externalPhotoId={externalNavigation || undefined}
      />

      {/* ============================================ */}
      {/* Chat Toggle Button */}
      {/* ============================================ */}

      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 z-40 group"
          aria-label="Open AI campus assistant"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="font-medium">Ask AI Assistant</span>

          {/* Pulse Animation for First-Time Users */}
          <span className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-20 group-hover:opacity-0"></span>
        </button>
      )}

      {/* ============================================ */}
      {/* AI Chat Component */}
      {/* ============================================ */}

      {showChat && (
        <AICampusChat
          currentPhotoId={currentPhotoId}
          onNavigate={handleAINavigation}
          onClose={() => setShowChat(false)}
        />
      )}

      {/* ============================================ */}
      {/* Optional: Current Location Indicator */}
      {/* ============================================ */}

      <div className="fixed top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-4 py-2 z-30">
        <p className="text-xs text-gray-500 mb-0.5">Current Location</p>
        <p className="text-sm font-semibold text-gray-900">
          {tourData.photos.find(p => p.id === currentPhotoId)?.title || 'Unknown'}
        </p>
      </div>
    </div>
  )
}
```

---

## Step 4: State Synchronization Strategy

### 4.1 State Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│                  HomePage (Parent)                   │
│                                                       │
│  State: currentPhotoId, showChat, externalNavigation │
└───────────┬─────────────────────────┬────────────────┘
            │                         │
            │                         │
    ┌───────▼──────────┐     ┌────────▼────────┐
    │ PanoramicViewer  │     │  AICampusChat   │
    │                  │     │                  │
    │ Props:           │     │ Props:           │
    │ - externalPhotoId│     │ - currentPhotoId │
    │ - onPhotoChange  │     │ - onNavigate     │
    └───────┬──────────┘     └────────┬─────────┘
            │                         │
            │                         │
    User clicks arrow          User asks AI
    "Go to library"            "Take me to library"
            │                         │
            └──────────┬──────────────┘
                       │
                       ▼
            HomePage updates currentPhotoId
                       │
                       ▼
            Both components reflect new state
```

### 4.2 Why This Architecture

**Single Source of Truth:**
- `currentPhotoId` lives in parent (HomePage)
- Both child components receive and update this state
- No state conflicts or desynchronization

**Bidirectional Communication:**
- Viewer → Parent: `onPhotoChange` callback
- Parent → Viewer: `externalPhotoId` prop
- Chat → Parent: `onNavigate` callback
- Parent → Chat: `currentPhotoId` prop

**Benefits:**
- Easy to debug (all state in one place)
- No duplicate state management
- Parent can log all navigation events
- Can add analytics/tracking easily

---

## Step 5: Testing Integration

### 5.1 Manual Test Checklist

**Basic Navigation:**
- [ ] Page loads with initial photo displayed
- [ ] Current location indicator shows correct name
- [ ] "Ask AI Assistant" button visible
- [ ] Clicking button opens chat
- [ ] Chat shows greeting message
- [ ] Can type and send message

**AI Navigation:**
- [ ] Ask "Take me to the library"
- [ ] AI responds with route information
- [ ] Sequential navigation begins
- [ ] Progress overlay appears
- [ ] Camera moves step-by-step
- [ ] Current location indicator updates each step
- [ ] Navigation completes at destination
- [ ] Progress overlay disappears

**Manual Navigation:**
- [ ] Click direction arrow in viewer
- [ ] Camera moves to new location
- [ ] Current location indicator updates
- [ ] Chat remembers new location context
- [ ] Ask "Where am I?" - AI knows current location

**State Synchronization:**
- [ ] Start AI navigation to gym
- [ ] During navigation, click direction arrow (manual nav)
- [ ] AI navigation cancels correctly
- [ ] Manual navigation works
- [ ] States remain synchronized

**Chat Controls:**
- [ ] Minimize chat during navigation
- [ ] Navigation continues
- [ ] Maximize chat - sees updated progress
- [ ] Close chat during navigation
- [ ] Navigation continues (or cancels if configured)
- [ ] Reopen chat - new conversation starts

**Mobile Testing:**
- [ ] Open on mobile device (or responsive mode)
- [ ] VR viewer works with touch controls
- [ ] Chat button sized appropriately
- [ ] Chat overlay full-width on mobile
- [ ] Progress overlay readable on small screen
- [ ] Can navigate using AI on mobile
- [ ] Keyboard doesn't obscure input

---

## Step 6: Summary

**What Phase 7 Accomplishes:**

✅ **Complete Integration**: All AI components connected to main VR tour
✅ **State Management**: Shared state between viewer and chat components
✅ **Bidirectional Navigation**: Manual arrows and AI commands both work
✅ **State Synchronization**: Current location always accurate across components
✅ **Edge Case Handling**: Concurrent navigation, invalid IDs, disconnects
✅ **Mobile Responsive**: Optimized UI for desktop and mobile
✅ **User Experience**: Smooth transitions, clear feedback, intuitive controls

**Files Modified:**
- `src/routes/index.tsx` - Main tour page with chat integration
- `src/components/PanoramicViewer.tsx` - Added props for external control

**Ready for Phase 8:**
All features implemented and integrated. Phase 8 will focus on:
- Comprehensive testing across browsers and devices
- Performance optimization and profiling
- Production deployment to Vercel
- Monitoring and analytics setup
- Documentation for end users

---

## Verification Checklist

Before moving to Phase 8, verify:

### Component Integration
- [ ] AICampusChat imported and rendered in main page
- [ ] PanoramicViewer accepts and uses props
- [ ] State flows correctly: HomePage → AICampusChat
- [ ] State flows correctly: HomePage → PanoramicViewer
- [ ] Callbacks work: AICampusChat → HomePage
- [ ] Callbacks work: PanoramicViewer → HomePage

### Navigation Functionality
- [ ] AI navigation request triggers camera movement
- [ ] Sequential navigation works step-by-step
- [ ] Manual navigation (arrows) updates shared state
- [ ] Current location indicator shows correct name
- [ ] Progress overlay appears during AI navigation
- [ ] Skip and cancel buttons work

---

## Time Estimate Breakdown

- **Step 1** (Understanding Structure): 15 minutes
- **Step 2** (Update PanoramicViewer): 30 minutes
- **Step 3** (Create Main Page): 30 minutes
- **Step 4** (State Management): 15 minutes
- **Step 5** (Testing): 45 minutes
- **Step 6** (Summary): 15 minutes

**Total: 2-3 hours** (including testing and debugging)

---

**Phase 7 Status**: Ready for implementation 🚀
