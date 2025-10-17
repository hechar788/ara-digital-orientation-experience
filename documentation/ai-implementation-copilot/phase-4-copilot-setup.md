# Phase 4: Copilot Studio Setup

**Duration:** 2 hours
**Difficulty:** Easy
**Prerequisites:** Phase 3 complete, Copilot Studio access

---

## Objectives

1. ✅ Create campus location entity from JSON
2. ✅ Configure global variables (sessionId, currentLocation)
3. ✅ Create navigation topic with entity extraction
4. ✅ Create Power Automate flow
5. ✅ Integrate Web Chat SDK
6. ✅ Test end-to-end navigation from chat

---

## Step 4.1: Generate Entity CSV from Location Data

**Time:** 15 minutes

### 4.1.1 - Create Entity Generator Script

Create `scripts/generate-entity-csv.ts`:

```typescript
/**
 * Generate Copilot Studio Entity CSV
 *
 * Converts location-directory.json into CSV format for entity import.
 * This allows automatic synonym mapping without manual data entry.
 */

import { writeFileSync } from 'fs'
import locationDirectory from '../src/assets/location-directory.json'

function generateEntityCSV() {
  const rows = [
    ['Value', 'Synonyms'] // CSV header
  ]

  for (const location of locationDirectory.data) {
    // Value = photoId (this is what gets extracted)
    const value = location.photoId

    // Synonyms = all ways user might refer to this location
    const synonyms = [
      location.locationName,
      ...location.aliases
    ].join('; ')

    rows.push([value, synonyms])
  }

  const csv = rows.map(row => row.join(',')).join('\n')

  writeFileSync('copilot-entity-campus-locations.csv', csv, 'utf-8')

  console.log('✅ Entity CSV generated: copilot-entity-campus-locations.csv')
  console.log(`   ${rows.length - 1} locations exported`)
  console.log('\nSample entries:')
  console.log(rows.slice(1, 4).map(r => `   ${r[0]} → ${r[1]}`).join('\n'))
}

generateEntityCSV()
```

### 4.1.2 - Add Script to package.json

```json
{
  "scripts": {
    "generate:entity": "tsx scripts/generate-entity-csv.ts"
  }
}
```

### 4.1.3 - Generate CSV

```bash
npm run generate:entity
```

**Expected output:**
```
✅ Entity CSV generated: copilot-entity-campus-locations.csv
   23 locations exported

Sample entries:
   library-main-entrance → Library; Main Library; Books; Study Area; Reading Room
   w-gym-entry → Gym; Gymnasium; Sports Hall; W Block Gym; Recreation Center
   lounge-main → Student Lounge; Lounge; Common Room; Hangout Area
```

### 4.1.4 - Verify CSV File

Open `copilot-entity-campus-locations.csv`:

```csv
Value,Synonyms
library-main-entrance,Library; Main Library; Books; Study Area; Reading Room
w-gym-entry,Gym; Gymnasium; Sports Hall; W Block Gym; Recreation Center
lounge-main,Student Lounge; Lounge; Common Room; Hangout Area
a-f1-north-entrance,A Block; Academic Block A; Main Academic Building
n-sandy-office,Professor Sandy's Office; Sandy Office; N Block Office
```

**✅ Validation:** CSV file exists with all locations and synonyms

---

## Step 4.2: Create Entity in Copilot Studio

**Time:** 10 minutes

### 4.2.1 - Navigate to Entities

1. Go to https://copilotstudio.microsoft.com
2. Select your copilot (or create new one: "VR Campus Assistant")
3. Click **"Entities"** in left sidebar
4. Click **"+ New entity"**

### 4.2.2 - Configure Entity

**Entity settings:**
- **Name:** `CampusLocation`
- **Description:** "Campus locations for VR navigation"
- **Type:** List (closed list)

Click **"Save"**

### 4.2.3 - Import CSV

1. In entity editor, click **"Import"** button
2. Select **"Import from CSV"**
3. Choose `copilot-entity-campus-locations.csv`
4. Map columns:
   - Value column: `Value`
   - Synonyms column: `Synonyms`
   - Synonym delimiter: `;` (semicolon)
5. Click **"Import"**

**Expected:** "Successfully imported 23 values with synonyms"

### 4.2.4 - Verify Entity Values

In entity editor, you should see:

| Value | Synonyms |
|-------|----------|
| library-main-entrance | Library, Main Library, Books, Study Area, Reading Room |
| w-gym-entry | Gym, Gymnasium, Sports Hall, W Block Gym, Recreation Center |
| lounge-main | Student Lounge, Lounge, Common Room, Hangout Area |
| ... | ... |

Click **"Save"**

**✅ Validation:** Entity has 20+ values with multiple synonyms each

---

## Step 4.3: Configure Global Variables

**Time:** 10 minutes

### 4.3.1 - Create sessionId Variable

1. Click **"Topics" → "System" → "Variables"**
2. Click **"+ Add global variable"**
3. Configure:
   - **Name:** `sessionId`
   - **Type:** String
   - **Default value:** (leave empty)
4. Click **"Save"**

### 4.3.2 - Create currentLocation Variable

1. Click **"+ Add global variable"** again
2. Configure:
   - **Name:** `currentLocation`
   - **Type:** String
   - **Default value:** `a-f1-north-entrance`
3. Click **"Save"**

**Note:** These variables will be set by Web Chat SDK from browser.

**✅ Validation:** Both global variables exist in system variables

---

## Step 4.4: Create Navigation Topic

**Time:** 30 minutes

### 4.4.1 - Create Topic

1. Click **"Topics" → "+ New topic"**
2. Click **"From blank"**
3. Name: **"Navigate to Location"**
4. Description: "Helps users navigate to campus locations via VR"

### 4.4.2 - Add Trigger Phrases

In the trigger node, add:
- "take me to"
- "I can't find"
- "where is"
- "show me"
- "guide me to"
- "navigate to"
- "how do I get to"

### 4.4.3 - Build Topic Flow

**Step 1: Ask for location with entity extraction**

1. Add node: **"Ask a question"**
2. Configure:
   - Message: "Which location would you like to visit?"
   - Identify: Select **`CampusLocation`** entity
   - Save response as: `targetLocation`

**Step 2: Check if location was recognized**

1. Add node: **"Condition"**
2. Configure:
   - Condition: `targetLocation` is not blank
   - If yes → Continue
   - If no → Add message: "Sorry, I don't recognize that location. Try asking 'Where is the library?' or 'Take me to the gym'."

**Step 3: Confirmation (optional but recommended)**

1. Add node: **"Ask a question"** (after "yes" branch)
2. Configure:
   - Message: "Would you like me to take you to {targetLocation}?"
   - Options:
     - Yes
     - No
   - Save response as: `userConfirmed`

**Step 4: Call Power Automate Flow**

1. Add node: **"Call an action"** (after user confirms "Yes")
2. Configure:
   - Action: (We'll create this in Step 4.5)
   - Input mapping:
     - `sessionId` → `Global.sessionId`
     - `photoId` → `targetLocation` (this is the entity value = photoId!)
     - `currentLocation` → `Global.currentLocation`

**Step 5: Show result**

1. Add node: **"Condition"**
   - Check flow return value `status` = `"success"`

2. If success:
   - Add message: "Taking you there now! This will take about {flow.estimatedTime} seconds."

3. If error:
   - Add message: "Sorry, I couldn't find a route to that location. You might already be there, or it's not accessible from your current position."

### 4.4.4 - Topic Flow Diagram

```
Trigger: "take me to", "where is", etc.
              ↓
┌─────────────────────────────────────────────────────┐
│ Ask a question                                      │
│ "Which location would you like to visit?"          │
│ Identify: CampusLocation entity                     │
│ Save as: targetLocation                             │
└─────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────┐
│ Condition: targetLocation is not blank?             │
│                                                      │
│ No  → "Sorry, I don't recognize that location"      │
│ Yes → Continue                                       │
└─────────────────────────────────────────────────────┘
              ↓ (Yes)
┌─────────────────────────────────────────────────────┐
│ Ask a question                                      │
│ "Would you like me to take you to {targetLocation}?"│
│ Options: [Yes] [No]                                 │
└─────────────────────────────────────────────────────┘
              ↓ (Yes)
┌─────────────────────────────────────────────────────┐
│ Call Power Automate Flow                            │
│ Inputs:                                              │
│   sessionId: {Global.sessionId}                     │
│   photoId: {targetLocation}                         │
│   currentLocation: {Global.currentLocation}         │
└─────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────┐
│ Condition: flow.status = "success"?                 │
│                                                      │
│ Yes → "Taking you there now!"                       │
│ No  → "Sorry, couldn't find a route"                │
└─────────────────────────────────────────────────────┘
```

**Save topic**

**✅ Validation:** Topic saves without errors, entity extraction configured

---

## Step 4.5: Create Power Automate Flow

**Time:** 30 minutes

### 4.5.1 - Create Flow

1. In Copilot Studio, click **"Actions" → "+ Add an action"**
2. Click **"Create a new flow"**
3. Name: **"VR Campus Navigation"**
4. Description: "Triggers VR navigation to specified location"

### 4.5.2 - Configure Inputs

In the "Run a flow from Copilot" trigger:

1. Click **"+ Add an input"**
2. Add **Text** input:
   - Name: `sessionId`
   - Sample data: `test-123`

3. Click **"+ Add an input"**
4. Add **Text** input:
   - Name: `photoId`
   - Sample data: `library-main-entrance`

5. Click **"+ Add an input"**
6. Add **Text** input:
   - Name: `currentLocation`
   - Sample data: `a-f1-north-entrance`

### 4.5.3 - Add HTTP Request Step

1. Click **"+ New step"**
2. Search for **"HTTP"**
3. Select **"HTTP"** action

Configure HTTP request:
- **Method:** POST
- **URI:** `https://YOUR-VERCEL-DOMAIN.vercel.app/api/navigate-to/@{triggerBody()?['text']}`

  **WAIT - This is wrong! Fix URI:**
  ```
  https://YOUR-VERCEL-DOMAIN.vercel.app/api/navigate-to/@{triggerBody()?['photoId']}
  ```

- **Headers:**
  ```json
  Content-Type: application/json
  ```

- **Body:**
  ```json
  {
    "sessionId": "@{triggerBody()?['sessionId']}",
    "currentLocation": "@{triggerBody()?['currentLocation']}"
  }
  ```

**Replace `YOUR-VERCEL-DOMAIN` with your actual domain!**

### 4.5.4 - Parse JSON Response

1. Click **"+ New step"**
2. Search for **"Parse JSON"**
3. Configure:
   - **Content:** `@{body('HTTP')}`
   - **Schema:** Click "Generate from sample" and paste:

```json
{
  "success": true,
  "route": {
    "distance": 12,
    "steps": 12,
    "estimatedTime": 15
  }
}
```

### 4.5.5 - Add Response to Copilot

1. Click **"+ New step"**
2. Search for **"Respond to Copilot"**
3. Click **"+ Add an output"**
4. Add **Text** output:
   - Name: `status`
   - Value: (we'll use condition)

5. Add **Number** output:
   - Name: `estimatedTime`
   - Value: `@{body('Parse_JSON')?['route']?['estimatedTime']}`

### 4.5.6 - Add Condition for Success/Error

Before the "Respond to Copilot" step:

1. Click **"+ New step"** (before Respond)
2. Search for **"Condition"**
3. Configure condition:
   - Field: `@{body('Parse_JSON')?['success']}`
   - Operator: `is equal to`
   - Value: `true`

4. In **"If yes"** branch:
   - Move "Respond to Copilot" here
   - Set `status` output to: `success`
   - Set `estimatedTime` to: `@{body('Parse_JSON')?['route']?['estimatedTime']}`

5. In **"If no"** branch:
   - Add "Respond to Copilot"
   - Set `status` output to: `error`
   - Set `estimatedTime` to: `0`

### 4.5.7 - Save and Test Flow

1. Click **"Save"** in top-right
2. Click **"Test"** button
3. Select **"Manually"**
4. Click **"Test"**
5. Enter test inputs:
   - sessionId: `test-session-123`
   - photoId: `library-main-entrance`
   - currentLocation: `a-f1-north-entrance`
6. Click **"Run flow"**

**Expected:** Flow runs successfully (even if API 404s - we'll fix that in Phase 7)

**Save flow and return to Copilot Studio**

**✅ Validation:** Flow saves and test completes without errors

---

## Step 4.6: Connect Flow to Topic

**Time:** 5 minutes

1. Go back to **"Navigate to Location"** topic
2. In the **"Call an action"** node (Step 4 of flow), click to configure
3. Select your flow: **"VR Campus Navigation"**
4. Map inputs:
   - `sessionId` → `Global.sessionId`
   - `photoId` → `targetLocation`
   - `currentLocation` → `Global.currentLocation`
5. Click **"Save"**

**✅ Validation:** Action is connected, inputs mapped correctly

---

## Step 4.7: Secure Direct Line Tokens & Integrate Web Chat

**Time:** 25 minutes

### 4.7.1 - Store Copilot Direct Line Secret

Add your Copilot Studio Direct Line channel secret to environment configuration. In `.env.local`:

```bash
COPILOT_DIRECT_LINE_SECRET=dl_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Never commit this value. Provision the secret in Vercel/hosting environment variables before deploying.

### 4.7.2 - Create Direct Line Token Endpoint

Create `src/routes/api/copilot/directline-token.tsx`:

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'

const DIRECT_LINE_URL = 'https://directline.botframework.com/v3/directline/tokens/generate'

export const Route = createFileRoute('/api/copilot/directline-token')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { sessionId } = (await request.json()) as { sessionId?: string }

          if (!sessionId) {
            return json({ error: 'Missing sessionId' }, { status: 400 })
          }

          const secret = process.env.COPILOT_DIRECT_LINE_SECRET
          if (!secret) {
            console.error('[Copilot] COPILOT_DIRECT_LINE_SECRET not configured')
            return json({ error: 'Configuration error' }, { status: 500 })
          }

          const response = await fetch(DIRECT_LINE_URL, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${secret}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ User: { Id: sessionId } })
          })

          if (!response.ok) {
            const text = await response.text()
            console.error('[Copilot] Failed to generate Direct Line token', text)
            return json({ error: 'Token generation failed' }, { status: 502 })
          }

          const payload = (await response.json()) as { token: string; expires_in: number }
          return json({ token: payload.token, expiresIn: payload.expires_in })
        } catch (error) {
          console.error('[Copilot] Direct Line token error', error)
          return json({ error: 'Internal error' }, { status: 500 })
        }
      }
    }
  }
})
```

This endpoint keeps the Direct Line secret on the server and returns short-lived tokens to the browser.

### 4.7.3 - Integrate Web Chat on the Client

Update `src/routes/index.tsx`:

```typescript
import { useEffect, useMemo, useRef, useState } from 'react'
import { PanoramicViewer } from '../components/PanoramicViewer'
import { AblyNavigationProvider } from '../components/AblyNavigation.client'
import { getOrCreateSession } from '../lib/session'

export default function VRTourPage() {
  const sessionId = useMemo(() => getOrCreateSession(), [])
  const [currentPhotoId, setCurrentPhotoId] = useState('a-f1-north-entrance')
  const [chatLoaded, setChatLoaded] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement | null>(null)
  const directLineRef = useRef<any>(null)

  const handleNavigate = (photoId: string, direction?: string | null) => {
    console.info('[Navigation] AI command:', photoId, direction)
    setCurrentPhotoId(photoId)
  }

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    let disposed = false
    const initialLocation = currentPhotoId

    const initialiseChat = async () => {
      try {
        const response = await fetch('/api/copilot/directline-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        })

        if (!response.ok) {
          throw new Error(`Failed to generate Direct Line token (${response.status})`)
        }

        const { token } = (await response.json()) as { token: string }
        if (disposed || typeof window === 'undefined') {
          return
        }

        const directLine = (window as any).WebChat.createDirectLine({ token })
        directLineRef.current = directLine

        (window as any).WebChat.renderWebChat(
          {
            directLine,
            userID: sessionId,
            username: 'User',
            locale: 'en-NZ',
            styleOptions: {
              botAvatarInitials: 'AI',
              userAvatarInitials: 'U',
              backgroundColor: 'transparent'
            }
          },
          chatContainerRef.current ?? undefined
        )

        directLine
          .postActivity({
            type: 'event',
            name: 'setGlobalVariables',
            value: {
              sessionId,
              currentLocation: initialLocation
            }
          })
          .subscribe({
            complete: () => {
              if (!disposed) {
                setChatLoaded(true)
              }
            }
          })
      } catch (error) {
        console.error('[Copilot] Failed to initialise Web Chat', error)
        if (!disposed) {
          setChatLoaded(false)
        }
      }
    }

    const script = document.createElement('script')
    script.src = 'https://cdn.botframework.com/botframework-webchat/latest/webchat.js'
    script.async = true
    script.onload = () => {
      initialiseChat().catch(err => {
        console.error('[Copilot] Web Chat init error', err)
      })
    }

    document.body.appendChild(script)

    return () => {
      disposed = true
      document.body.removeChild(script)
      directLineRef.current = null
      setChatLoaded(false)
    }
  }, [sessionId])

  useEffect(() => {
    if (!chatLoaded || !directLineRef.current) {
      return
    }

    directLineRef.current
      .postActivity({
        type: 'event',
        name: 'setGlobalVariables',
        value: {
          currentLocation: currentPhotoId
        }
      })
      .subscribe()
  }, [chatLoaded, currentPhotoId])

  if (typeof window === 'undefined') {
    return (
      <PanoramicViewer
        currentPhotoId={currentPhotoId}
        onNavigate={setCurrentPhotoId}
      />
    )
  }

  return (
    <div className="h-full w-full">
      <AblyNavigationProvider
        sessionId={sessionId}
        onNavigate={handleNavigate}
      >
        <PanoramicViewer
          currentPhotoId={currentPhotoId}
          onNavigate={setCurrentPhotoId}
        />
        <div ref={chatContainerRef} className="fixed bottom-4 right-4 h-96 w-80 rounded-xl bg-white/90 shadow-xl" />
      </AblyNavigationProvider>
    </div>
  )
}
```

This implementation fetches a short-lived Direct Line token from your server, embeds the chat widget, and keeps the current location synchronised without exposing secrets to the browser.

**✅ Validation:** Chat widget loads, conversation works, and network tab shows `/api/copilot/directline-token` returning HTTP 200.

## Step 4.8: Test Topic in Copilot Test Chat

**Time:** 10 minutes

1. In Copilot Studio, click **"Test"** button (top-right)
2. Type: **"Take me to the library"**

**Expected flow:**
```
You: Take me to the library
Bot: Which location would you like to visit?
You: library
Bot: Would you like me to take you to library-main-entrance?
You: Yes
Bot: Taking you there now! This will take about X seconds.
```

**Note:** The actual navigation won't work yet (API not deployed), but the topic flow should work.

**✅ Validation:** Topic recognizes "library" and extracts entity value

---

## Step 4.9: End-to-End Test (When API is Ready)

**Time:** 10 minutes

**After deploying API in Phase 7:**

1. Open VR tour in browser: http://localhost:3000
2. Wait for "🟢 AI Navigation Ready" indicator
3. In chat widget, type: **"Take me to the library"**
4. Copilot asks: "Which location would you like to visit?"
5. Type: **"library"**
6. Copilot asks: "Would you like me to take you to library-main-entrance?"
7. Click **"Yes"**
8. **VR viewport should navigate automatically!**

**Expected:**
- Entity extraction works
- Power Automate flow triggers
- API receives correct photoId
- Ably messages arrive
- Viewport navigates through route

**✅ Validation:** Full end-to-end navigation works

---

## Phase 4 Complete! 🎉

### Checklist Review

- [x] 4.1 - Generate entity CSV from location data
- [x] 4.2 - Create CampusLocation entity in Copilot Studio
- [x] 4.3 - Configure global variables (sessionId, currentLocation)
- [x] 4.4 - Create navigation topic with entity extraction
- [x] 4.5 - Create Power Automate flow
- [x] 4.6 - Connect flow to topic
- [x] 4.7 - Secure Direct Line tokens & embed Web Chat
- [x] 4.8 - Test topic in Copilot test chat
- [x] 4.9 - End-to-end test (after API deployment)

### Key Achievements

✅ **Entity-based extraction** - photoId comes directly from entity value
✅ **Single API call** - Only /api/navigate-to (no resolver needed)
✅ **Automatic synonyms** - All aliases work without manual mapping
✅ **Scalable** - Add locations by updating JSON and regenerating CSV

### Troubleshooting

**Entity not recognizing location:**
- Check entity has correct synonyms
- Try exact synonym (e.g., "Library" instead of "library")
- Verify entity is saved and published

**Chat widget doesn't appear:**
- Check browser console for errors
- Verify DirectLine token is correct
- Check Copilot channel is enabled

**Flow fails with 404:**
- API not deployed yet (normal at this stage)
- Will work after Phase 7 deployment

**Global variables not updating:**
- Check `setGlobalVariables` event in code
- Verify variable names match exactly
- Check Web Chat SDK version (use latest)

---

## Next Steps

**Proceed to Phase 5:** [phase-5-user-experience.md](./phase-5-user-experience.md)

You'll implement:
- Navigation controls (pause/resume/cancel)
- Speed preferences
- Progress indicators
- User notifications

**Estimated time:** 3 hours