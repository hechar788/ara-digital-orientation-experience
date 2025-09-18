# AI Assistant Implementation Guide

## Overview
This document outlines the simplified implementation plan for the AI assistant component of the University Digital Orientation VR Campus Tour application. The assistant's primary function is to navigate users to specific campus locations via API integration, while also providing general campus information and VR interface help.

## Architecture Decision
**Single Agent Approach** - One intelligent agent in Microsoft Copilot Studio that handles location navigation requests through API calls and provides campus information from knowledge sources.

## Core Features

### 1. Location Navigation (Primary Function)
- **Instant Navigation** - Users can ask "take me to the library" or "show me room X208"
- **API Integration** - Assistant makes HTTP POST requests to TanStack Start API
- **Real-time VR Control** - Camera immediately moves to requested location
- **Any Location Access** - No discovery restrictions, full campus navigation available

### 2. VR Interface Help
- **Camera Controls** - How to look around, zoom, reset view
- **Technical Troubleshooting** - Browser compatibility, performance issues
- **Navigation Tips** - Alternative ways to move around the tour

### 3. Campus Information
- **General Information** - Campus services, policies, hours, dining options
- **Knowledge-Based Only** - No API calls, information from uploaded documents
- **Source Citations** - Preserve official document references

## Technical Implementation

### Copilot Studio Architecture

#### Knowledge Sources (3 Total)
```
Knowledge Source 1: "Campus Locations Directory"
- Description: "Complete directory of all campus buildings, rooms, and locations with exact location IDs, descriptions, and context for VR navigation"
- Content: Room directory with location IDs, building layouts, navigation instructions
- Update Frequency: When new areas are added to VR tour

Knowledge Source 2: "VR Interface Help"
- Description: "User guide for VR tour controls, camera movement, zoom functions, troubleshooting, and browser compatibility"
- Content: Control instructions, technical troubleshooting, accessibility features
- Update Frequency: With each app release

Knowledge Source 3: "Campus Information"
- Description: "General campus services, policies, dining options, hours, student life information, and support services"
- Content: Student handbook, campus services, dining info, policies
- Update Frequency: Semester or as information changes
```

#### Topic Architecture (4 Total)
```
Core Topics:

1. "Location Navigation"
   - Triggers: "take me to", "go to", "show me", "find", "where is", "can't find", "I'm lost", "room X208", "library"
   - Purpose: Help users find and navigate to specific campus locations
   - Input Parameter: **locationRequested** (extracted from user query or prompted for)
   - Behavior:
     * If location mentioned: Extract location from user input ("library", "room X208", etc.)
     * If no location specified: Ask "Where are you trying to go?" to get the location
     * Provide location information using locationRequested parameter
     * Ask "Would you like me to take you there?" with Yes/No options
     * If Yes: Pass locationRequested to VR Navigation API Flow → HTTP POST to /api/vr/navigate
     * If No: "Good luck! Feel free to ask if you need anything else."
   - Sources: Campus Locations Directory

2. "VR Technical Help"
   - Triggers: "how do I move", "camera controls", "zoom", "not working", "browser issues"
   - Purpose: Help with VR interface and troubleshooting
   - No API Calls: Pure help documentation
   - Sources: VR Interface Help knowledge source

3. "Campus Services"
   - Triggers: "dining", "library hours", "services", "policies", "registration"
   - Purpose: General campus information and services
   - No API Calls: Knowledge source only
   - Sources: Campus Information knowledge source

4. "General Assistance"
   - Triggers: "hello", "help", unclear requests, fallback
   - Purpose: Greeting, clarification, general guidance
   - No API Calls: Conversation management
   - Includes: Help users understand what the assistant can do
```

#### Agent Flows (1 Total)

```
Flow 1: "VR Navigation API Flow"
- Trigger: Called when user selects "Yes" to navigation question in Location Navigation topic
- Purpose: Navigate user to specific campus location
- Input Parameter: **locationRequested** (passed from Location Navigation topic)
- Actions:
  * HTTP POST to /api/vr/navigate endpoint
  * Pass locationRequested as locationId in API call
  * Handle navigation confirmation/error
  * Return status to user
- API Parameters: locationId (from locationRequested), transitionType ("smooth")
- Output: navigationStatus, currentLocation, message
- Example Flow:
  * User: "where is the library" → locationRequested = "library"
  * Topic: provides library info → "Would you like me to take you there?"
  * User: "Yes" → Flow receives locationRequested = "library" → API call → navigation
```

## Three.js Integration

### Required API Endpoints

#### 1. Navigation Control API (Primary)
```javascript
// POST /api/vr/navigate
{
  "locationId": "library-main-entrance",
  "transitionType": "smooth"
}

// Response
{
  "status": "success",
  "currentLocation": "library-main-entrance",
  "message": "Navigation completed",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

#### 2. Optional Supporting APIs
```javascript
// GET /api/vr/locations
// Returns list of all available campus locations

// GET /api/vr/current-location
// Returns user's current position in tour
```

### JavaScript Integration Points

#### 1. Chat Widget Embedding
```javascript
// Embed Microsoft Copilot Studio chat widget in VR application
const chatConfig = {
  botId: 'campus-tour-assistant',
  container: 'chat-container',
  position: 'overlay',
  minimizable: true
};

window.Microsoft.Copilot.Chat.init(chatConfig);
```

#### 2. Navigation Event Handling
```javascript
// Listen for navigation requests from AI assistant
// When assistant calls the navigation API, frontend receives the response
// and updates the Three.js camera position accordingly

function handleNavigationResponse(navigationData) {
  const { locationId, status } = navigationData;

  if (status === 'success') {
    // Move Three.js camera to the specified location
    navigateToLocation(locationId);
  }
}
```

## Implementation Process

### Phase 1: TanStack Start API Setup (Week 1)
1. **Create API Endpoints**
   - Build `/api/vr/navigate` endpoint in TanStack Start
   - Add optional `/api/vr/locations` and `/api/vr/current-location` endpoints
   - Test API endpoints manually with Postman or curl
   - Ensure proper CORS handling for Copilot Studio requests

### Phase 2: Copilot Studio Configuration (Week 2)
1. **Agent Setup**
   - Create new Copilot Studio agent
   - Upload Campus Locations Directory knowledge source
   - Upload VR Interface Help and Campus Information knowledge sources
   - Configure the 4 core Topics (Location Navigation, VR Help, Campus Services, General)

2. **Navigation Flow Creation**
   - Build the single VR Navigation API Flow
   - Configure HTTP POST action to call `/api/vr/navigate`
   - Test flow with sample location requests
   - Validate error handling and response processing

### Phase 3: Integration & Testing (Week 3)
1. **Frontend Integration**
   - Embed Copilot Studio chat widget in VR application
   - Style chat interface for VR overlay experience
   - Test end-to-end navigation: user request → API call → camera movement

2. **Knowledge Base Testing**
   - Test location navigation with various requests ("library", "room X208", etc.)
   - Validate VR help responses and troubleshooting guidance
   - Ensure campus information retrieval with proper citations

### Phase 4: Refinement & Deployment (Week 4)
1. **Optimization**
   - Refine Topic trigger phrases for better recognition
   - Optimize knowledge source descriptions for accuracy
   - Test navigation flow with edge cases and error scenarios
   - Performance testing and response time optimization

## Quality Assurance

### Testing Scenarios
```
Navigation Tests:
- "Take me to the library" → Should call API and navigate to library
- "Show me room X208" → Should navigate to room X208 if it exists
- "Go to the dining hall" → Should call API with correct locationId

VR Help Tests:
- "How do I move around?" → Should explain camera controls
- "I can't see anything" → Should provide troubleshooting steps
- "How do I zoom?" → Should explain zoom controls

Campus Information Tests:
- "What dining options are available?" → Should provide dining info from knowledge source
- "When is registration?" → Should cite campus policies with source
- "Library hours?" → Should provide current library information

Error Handling Tests:
- "Take me to Mars" → Should explain location doesn't exist
- API endpoint failures → Should gracefully handle navigation errors
- Invalid location requests → Should provide helpful alternatives
```

### Success Metrics
- **Navigation Success**: >95% successful API calls for location requests
- **Response Accuracy**: >90% correct information with proper citations
- **Performance**: <2 second response time for navigation and information queries
- **User Satisfaction**: Measured through feedback on navigation ease and information quality

## Deployment Considerations

### Vercel Deployment
- **TanStack Start Compatibility**: API routes automatically deploy as Vercel serverless functions
- **CORS Configuration**: Ensure proper CORS headers for Copilot Studio requests
- **Environment Variables**: Secure any API keys or configuration in Vercel environment settings

### Scalability
- **Stateless Design**: API endpoints are stateless and scale automatically with Vercel
- **Copilot Studio Limits**: Monitor usage within Microsoft Copilot Studio quotas
- **Concurrent Users**: Vercel serverless functions handle multiple concurrent navigation requests

### Maintenance
- **Knowledge Source Updates**: Update campus location directory when new areas added to VR tour
- **Campus Information Updates**: Refresh campus services and policy information seasonally
- **VR Interface Updates**: Update help documentation when tour controls change

## Future Enhancements

### Advanced Features (Post-MVP)
- **Context Awareness**: Assistant knows user's current VR location for better guidance
- **Voice Commands**: "Hey assistant, take me to the library" voice navigation
- **Smart Suggestions**: "Students often visit the dining hall after the library" recommendations
- **Multi-language Support**: International student assistance in multiple languages

### Integration Opportunities
- **Campus Systems**: Connect to live dining hours, library occupancy, event schedules
- **Student Services**: Integration with registration, academic advising, support services
- **Mobile Companion**: Extend assistant to mobile devices for on-campus navigation

## Technical Requirements Summary

- **Platform**: Microsoft Copilot Studio (single agent architecture)
- **Integration**: Single REST API endpoint (`/api/vr/navigate`) for location navigation
- **Knowledge Management**: 3 knowledge sources (Campus Locations, VR Help, Campus Info)
- **Topics**: 4 core conversation Topics for specialized handling
- **Flows**: 1 Agent Flow for VR navigation API calls
- **Deployment**: TanStack Start API routes deploy as Vercel serverless functions

This simplified implementation provides a focused, efficient foundation for an AI assistant that can navigate users to specific campus locations while providing VR interface help and general campus information.