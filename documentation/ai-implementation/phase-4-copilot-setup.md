# Phase 4: Copilot Studio Setup

**Duration:** 2 hours
**Difficulty:** Easy
**Prerequisites:** Phase 3 complete, Copilot Studio access

---

## Objectives

1. ✅ Upload location directory to Copilot knowledge base
2. ✅ Create navigation topic with NLU
3. ✅ Configure global variables (sessionId)
4. ✅ Create Power Automate flow
5. ✅ Test end-to-end navigation from chat

---

## Step 4.1: Generate & Upload Knowledge Base

**Time:** 15 minutes

### Generate JSON file:

```bash
curl http://localhost:3000/api/location-directory > location-directory.json
```

### Upload to Copilot Studio:

1. Go to https://copilotstudio.microsoft.com
2. Select your copilot (or create new one)
3. Click **"Knowledge"** in left sidebar
4. Click **"Add knowledge" → "Files"**
5. Upload `location-directory.json`
6. Wait for indexing (~2 minutes)
7. Test in chat: "What is the library?"
   - Should return location details

**✅ Validation:** Copilot can answer "What is X" for locations in JSON

---

## Step 4.2: Configure Global Variables

**Time:** 10 minutes

1. In Copilot Studio, click **"Topics" → "System" → "Variables"**
2. Click **"Add global variable"**
3. Create variable:
   - **Name:** `sessionId`
   - **Type:** String
   - **Default value:** (leave empty)

4. Click **"Save"**

**Note:** sessionId will be populated by Web Chat SDK when user connects.

**✅ Validation:** Global variable `sessionId` exists in system variables

---

## Step 4.3: Create Navigation Topic

**Time:** 30 minutes

### Create Topic:

1. Click **"Topics" → "+ New topic"**
2. Name: **"Navigate to Location"**
3. Add trigger phrases:
   - "take me to"
   - "I can't find"
   - "where is"
   - "show me"
   - "guide me to"

### Build Topic Flow:

```
┌─────────────────────────────────────────────────────┐
│ 1. Ask a question                                   │
│    "What location would you like to visit?"         │
│    Save response as: location                       │
└─────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────┐
│ 2. Search knowledge base                            │
│    Data source: location-directory.json             │
│    Query: {location}                                │
│    Save as: locationData                            │
└─────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────┐
│ 3. Condition: locationData found?                   │
│    If yes → Continue                                │
│    If no → "Sorry, I don't recognize that location" │
└─────────────────────────────────────────────────────┘
              ↓ (Yes)
┌─────────────────────────────────────────────────────┐
│ 4. Ask a question                                   │
│    "Would you like me to take you to                │
│     {locationData.locationName}?"                   │
│    Options: [Yes] [No]                              │
└─────────────────────────────────────────────────────┘
              ↓ (Yes)
┌─────────────────────────────────────────────────────┐
│ 5. Call Power Automate Flow                         │
│    Flow: "VR Campus Navigation"                     │
│    Inputs:                                           │
│      sessionId: {Global.sessionId}                  │
│      photoId: {locationData.photoId}                │
│      currentLocation: {Global.currentLocation}      │
└─────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────┐
│ 6. Send a message                                   │
│    If flow success:                                 │
│      "Taking you to {locationData.locationName}     │
│       now! This will take about {flow.estimatedTime}│
│       seconds."                                      │
│    If flow error:                                   │
│      "Sorry, I couldn't find a route there."        │
└─────────────────────────────────────────────────────┘
```

**✅ Validation:** Topic saves successfully, trigger phrases work in test

---

## Step 4.4: Create Power Automate Flow

**Time:** 45 minutes

### Create New Flow:

1. In Copilot Studio, click **"Actions" → "+ Add action"**
2. Click **"Create a new flow"**
3. Name: **"VR Campus Navigation"**

### Flow Steps:

```
┌─────────────────────────────────────────────────────┐
│ Trigger: Called from Copilot                        │
│                                                      │
│ Inputs:                                              │
│ • sessionId (string)                                 │
│ • photoId (string)                                   │
│ • currentLocation (string)                           │
└─────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────┐
│ HTTP - POST Request                                 │
│                                                      │
│ URI: https://your-domain.vercel.app/api/navigate-to/@{photoId}
│ Method: POST                                         │
│ Headers:                                             │
│   Content-Type: application/json                    │
│ Body:                                                │
│   {                                                  │
│     "sessionId": "@{triggerBody()?['sessionId']}",  │
│     "currentLocation": "@{triggerBody()?['currentLocation']}"
│   }                                                  │
└─────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────┐
│ Parse JSON                                          │
│                                                      │
│ Content: @{body('HTTP')}                            │
│ Schema: {                                            │
│   "type": "object",                                  │
│   "properties": {                                    │
│     "success": {"type": "boolean"},                 │
│     "route": {                                       │
│       "type": "object",                              │
│       "properties": {                                │
│         "distance": {"type": "number"},             │
│         "steps": {"type": "number"},                │
│         "estimatedTime": {"type": "number"}         │
│       }                                              │
│     },                                               │
│     "error": {"type": "string"}                     │
│   }                                                  │
│ }                                                    │
└─────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────┐
│ Condition: success = true?                          │
│                                                      │
│ If yes → Return to Copilot:                         │
│   {                                                  │
│     "status": "success",                            │
│     "estimatedTime": @{body('Parse_JSON')?['route']?['estimatedTime']}
│   }                                                  │
│                                                      │
│ If no → Return to Copilot:                          │
│   {                                                  │
│     "status": "error",                              │
│     "error": @{body('Parse_JSON')?['error']}       │
│   }                                                  │
└─────────────────────────────────────────────────────┘
```

### Save and Test:

1. Click **"Save"** in top-right
2. Click **"Test"** button
3. Enter test inputs:
   - sessionId: `test-123`
   - photoId: `library-main-entrance`
   - currentLocation: `a-f1-north-entrance`
4. Click **"Run flow"**

**Expected:** Flow runs successfully, returns success status

**✅ Validation:** Flow saves, test run succeeds

---

## Step 4.5: Connect Flow to Topic

**Time:** 10 minutes

1. Go back to your **"Navigate to Location"** topic
2. In step 5 (Call Power Automate), select your flow
3. Map inputs:
   - sessionId → `{Global.sessionId}`
   - photoId → `{locationData.photoId}`
   - currentLocation → `a-f1-north-entrance` (temporary hardcode)
4. Save topic

**Note:** We'll fix currentLocation tracking in Phase 5.

**✅ Validation:** Topic connects to flow without errors

---

## Step 4.6: Integrate Web Chat SDK

**Time:** 20 minutes

Update `src/routes/index.tsx` to embed Copilot:

```typescript
import { useEffect } from 'react'

export default function VRTourPage() {
  const sessionId = useMemo(() => getOrCreateSession(), [])

  // Load Copilot Web Chat SDK
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdn.botframework.com/botframework-webchat/latest/webchat.js'
    script.async = true
    script.onload = () => {
      // Initialize Web Chat
      const directLine = window.WebChat.createDirectLine({
        token: 'YOUR_DIRECTLINE_TOKEN' // Get from Copilot Studio
      })

      window.WebChat.renderWebChat({
        directLine,
        userID: sessionId,
        username: 'User',
        locale: 'en-US',
        styleOptions: {
          botAvatarInitials: 'AI',
          userAvatarInitials: 'U'
        }
      }, document.getElementById('webchat'))

      // Pass sessionId to Copilot
      directLine.postActivity({
        type: 'event',
        name: 'setVariable',
        value: {
          sessionId: sessionId
        }
      }).subscribe()
    }
    document.body.appendChild(script)
  }, [sessionId])

  return (
    <div>
      <AblyNavigationProvider sessionId={sessionId} onNavigate={handleNavigate}>
        <PanoramicViewer currentPhotoId={currentPhotoId} />
      </AblyNavigationProvider>

      {/* Copilot Chat Widget */}
      <div
        id="webchat"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '400px',
          height: '600px',
          boxShadow: '0 0 20px rgba(0,0,0,0.2)',
          borderRadius: '10px'
        }}
      />
    </div>
  )
}
```

**Get DirectLine Token:**

1. In Copilot Studio, click **"Channels" → "Web Chat"**
2. Copy the token
3. Paste into code above

**✅ Validation:** Chat widget appears in bottom-right, can send messages

---

## Step 4.7: End-to-End Test

**Time:** 10 minutes

1. Open VR tour in browser
2. Wait for "🟢 AI Navigation Ready"
3. In chat, type: **"Take me to the library"**
4. Copilot should ask: "Would you like me to take you to the Library?"
5. Click **"Yes"**
6. **VR viewport should start navigating automatically!**

**Expected behavior:**
- Copilot confirms navigation
- Ably messages arrive
- Viewport moves through route
- Arrives at library entrance

**✅ Validation:** Complete navigation from chat to viewport works

---

## Phase 4 Complete! 🎉

### Checklist Review

- [x] 4.1 - Generate location-directory.json
- [x] 4.2 - Upload knowledge base to Copilot Studio
- [x] 4.3 - Create "Navigate to Location" topic
- [x] 4.4 - Configure global variables (sessionId)
- [x] 4.5 - Create Power Automate flow
- [x] 4.6 - Test knowledge base resolution
- [x] 4.7 - Test end-to-end navigation from Copilot

### Troubleshooting

**Chat widget doesn't appear:**
- Check browser console for script errors
- Verify DirectLine token is correct
- Check Copilot channel is enabled

**Flow fails with 404:**
- Verify Vercel deployment URL is correct
- Check API endpoint is accessible publicly
- Test endpoint with curl first

**SessionId not passed:**
- Verify global variable exists
- Check Web Chat SDK initialization
- Look at flow run history in Power Automate

---

## Next Steps

**Proceed to Phase 5:** [phase-5-user-experience.md](./phase-5-user-experience.md)

**Estimated time:** 3 hours
