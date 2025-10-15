# Phase 7: Testing & Deployment

**Duration:** 3 hours
**Difficulty:** Medium
**Prerequisites:** Phase 6 complete

---

## Objectives

1. ✅ Unit tests passing
2. ✅ Integration tests passing
3. ✅ Manual testing complete
4. ✅ Load testing performed
5. ✅ Deploy to preview environment
6. ✅ Deploy to production
7. ✅ Monitor for 24 hours

---

## Step 7.1: Run Unit Tests

**Time:** 15 minutes

Run all unit tests:

```bash
npm test
```

**Expected output:**
```
✓ tests/unit/navigationGraph.test.ts (12 tests)
✓ tests/unit/session.test.ts (6 tests)
✓ tests/unit/rateLimit.test.ts (4 tests)

Test Files  3 passed (3)
     Tests  22 passed (22)
  Start at  10:30:00
  Duration  2.34s
```

**If tests fail:**
1. Check error messages carefully
2. Fix implementation
3. Re-run tests
4. Don't proceed until all pass

**✅ Validation:** All unit tests pass

---

## Step 7.2: Integration Testing

**Time:** 30 minutes

### Test 7.2.1: Token Authentication

```bash
# Should succeed with valid token
curl -X POST http://localhost:3000/api/navigate-to/library-main \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-123",
    "sessionToken": "valid-token-here",
    "currentLocation": "a-f1-north-entrance"
  }'

# Should fail with invalid token
curl -X POST http://localhost:3000/api/navigate-to/library-main \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-123",
    "sessionToken": "invalid-token",
    "currentLocation": "a-f1-north-entrance"
  }'
```

**Expected:** First succeeds, second returns 403

### Test 7.2.2: Rate Limiting

```bash
# Run 15 times quickly (should hit limit at 10)
for i in {1..15}; do
  curl -X POST http://localhost:3000/api/navigate-to/library-main \
    -H "Content-Type: application/json" \
    -d "{\"sessionId\":\"test-123\",\"sessionToken\":\"valid-token\",\"currentLocation\":\"a-f1-north-entrance\"}"
  echo ""
done
```

**Expected:** First 10 succeed, remaining return 429

### Test 7.2.3: Ably Message Delivery

Open browser dev tools console:

```javascript
// Subscribe to test channel
const ably = new Ably.Realtime({
  authUrl: '/api/ably-token',
  authMethod: 'POST',
  authParams: { sessionId: 'test-123' }
})

const channel = ably.channels.get('session:test-123')
channel.subscribe('navigation', (message) => {
  console.log('Received:', message.data)
})

// Trigger navigation from another tab/terminal
// Should see messages in console
```

**Expected:** Messages arrive within 200ms

**✅ Validation:** All integration tests pass

---

## Step 7.3: Manual Testing Checklist

**Time:** 60 minutes

Complete this comprehensive checklist:

### Connection & Setup
- [ ] Page loads without errors
- [ ] Session ID persists across refresh
- [ ] Ably connection establishes (green indicator)
- [ ] Copilot chat widget appears
- [ ] Web Chat SDK initializes correctly

### Basic Navigation
- [ ] Can navigate manually by clicking viewport
- [ ] Current location updates correctly
- [ ] Can navigate to adjacent photos
- [ ] Can use elevator/stairs
- [ ] Can navigate across floors

### AI Navigation - Basic
- [ ] Can ask "Take me to library"
- [ ] Copilot recognizes request
- [ ] Confirmation prompt appears
- [ ] Clicking "Yes" triggers navigation
- [ ] Viewport starts moving automatically
- [ ] Progress indicator shows correctly
- [ ] Navigation completes at destination

### AI Navigation - Controls
- [ ] Pause button stops navigation
- [ ] Resume button continues navigation
- [ ] Cancel button stops navigation
- [ ] Spacebar toggles pause
- [ ] Escape key cancels
- [ ] Progress bar updates accurately

### AI Navigation - Advanced
- [ ] Speed selector changes timing
- [ ] Slow speed is noticeably slower
- [ ] Fast speed is noticeably faster
- [ ] Can navigate to 5+ different locations
- [ ] Routes are shortest path (no detours)
- [ ] Handles multi-floor routes correctly

### Error Handling
- [ ] Invalid location returns error message
- [ ] No route found shows error
- [ ] Rate limit shows retry message
- [ ] Connection loss shows reconnecting status
- [ ] Reconnection resumes navigation

### User Experience
- [ ] Notifications appear for events
- [ ] Connection status updates correctly
- [ ] UI is responsive on desktop
- [ ] UI is responsive on mobile
- [ ] Text is readable
- [ ] Controls are accessible

### Cross-Browser Testing
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works in Edge

### Mobile Testing
- [ ] Works on iOS Safari
- [ ] Works on Android Chrome
- [ ] Touch controls work
- [ ] Chat widget usable on mobile

**✅ Validation:** 30+ manual tests passing

---

## Step 7.4: Load Testing

**Time:** 20 minutes

Create `scripts/load-test.ts`:

```typescript
/**
 * Simple load test for navigation API
 * Simulates 50 concurrent users making navigation requests
 */

async function simulateUser(userId: number) {
  const sessionId = `load-test-${userId}`

  try {
    const response = await fetch('http://localhost:3000/api/navigate-to/library-main', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        sessionToken: 'test-token',
        currentLocation: 'a-f1-north-entrance'
      })
    })

    const data = await response.json()
    console.log(`User ${userId}: ${response.status} - ${data.success ? 'success' : data.error}`)
  } catch (error) {
    console.error(`User ${userId}: Error -`, error.message)
  }
}

async function runLoadTest(concurrentUsers: number) {
  console.log(`Starting load test with ${concurrentUsers} concurrent users...`)
  const start = Date.now()

  const promises = []
  for (let i = 0; i < concurrentUsers; i++) {
    promises.push(simulateUser(i))
  }

  await Promise.all(promises)

  const duration = Date.now() - start
  console.log(`\nCompleted in ${duration}ms`)
  console.log(`Average: ${(duration / concurrentUsers).toFixed(2)}ms per request`)
}

runLoadTest(50)
```

Run test:

```bash
tsx scripts/load-test.ts
```

**Expected output:**
```
Starting load test with 50 concurrent users...
User 0: 200 - success
User 1: 200 - success
User 2: 200 - success
...
User 49: 200 - success

Completed in 3456ms
Average: 69.12ms per request
```

**Acceptable thresholds:**
- Average response time: <200ms
- Success rate: >95%
- No crashes or timeouts

**✅ Validation:** System handles 50 concurrent requests successfully

---

## Step 7.5: Deploy to Preview

**Time:** 15 minutes

### Push to development branch:

```bash
git add .
git commit -m "Implement AI navigation system v3 with Ably integration"
git push origin development
```

### Vercel automatically creates preview deployment

1. Go to https://vercel.com/your-username/your-project
2. Find preview deployment for your branch
3. Click on deployment URL
4. **Test full flow on preview:**
   - Open preview URL
   - Verify Ably connects
   - Test navigation with Copilot
   - Check all features work

### Update Copilot webhook URL:

1. Go to Power Automate
2. Edit "VR Campus Navigation" flow
3. Update HTTP step URL to preview deployment:
   ```
   https://your-preview-deployment.vercel.app/api/navigate-to/@{photoId}
   ```
4. Save flow
5. Test in Copilot Studio test chat

**✅ Validation:** Preview deployment works end-to-end

---

## Step 7.6: Deploy to Production

**Time:** 10 minutes

### Merge to master:

```bash
git checkout master
git merge development
git push origin master
```

### Vercel automatically deploys to production

### Update Copilot webhook to production:

1. Update Power Automate flow HTTP URL:
   ```
   https://your-production-domain.vercel.app/api/navigate-to/@{photoId}
   ```
2. Save and publish flow

### Final production test:

1. Open production URL
2. Test navigation: "Take me to library"
3. Verify full end-to-end flow
4. Check browser console for errors
5. Check Vercel logs for API errors

**✅ Validation:** Production deployment successful, no errors

---

## Step 7.7: Post-Deployment Monitoring

**Time:** 24 hours (recurring checks)

### Immediate checks (first hour):

```bash
# Check Vercel logs
vercel logs --follow

# Check error rate
vercel logs --since=1h | grep ERROR | wc -l

# Check Ably dashboard
# https://ably.com/accounts/[your-account]/apps/[your-app]/stats
# Verify: Connections, Messages, Channels
```

### Monitor for 24 hours:

**Every 4 hours, check:**
- [ ] Vercel error rate (<1%)
- [ ] Ably connection count
- [ ] Ably message delivery rate (>99.9%)
- [ ] API response times (<200ms average)
- [ ] User reports (Discord/Slack/Email)

**Red flags to watch for:**
- Sudden spike in errors
- Ably connections dropping
- API timeouts increasing
- User complaints about navigation failing

### Create monitoring dashboard:

**Vercel Analytics:**
- Enable in Vercel project settings
- Monitor page load times
- Track API endpoint performance

**Ably Dashboard:**
- Check "Stats" tab daily
- Monitor connection count
- Check message delivery success rate

**Custom analytics query:**

```typescript
// Create endpoint to view analytics
export const Route = createFileRoute('/api/admin/analytics')({
  server: {
    handlers: {
      GET: async () => {
        const today = new Date().toISOString().split('T')[0]

        const navRequests = await kv.llen(`analytics:nav:${today}`)
        const completions = await kv.llen(`analytics:complete:${today}`)
        const errors = await kv.llen(`analytics:errors:${today}`)

        return json({
          date: today,
          navigationRequests: navRequests,
          completions,
          errors,
          completionRate: (completions / navRequests * 100).toFixed(2) + '%'
        })
      }
    }
  }
})
```

**✅ Validation:** No critical issues in first 24 hours

---

## Step 7.8: Post-Launch Checklist

**Complete after 24 hours:**

- [ ] No critical errors in logs
- [ ] Ably connection success rate >99%
- [ ] API response times acceptable
- [ ] User feedback positive
- [ ] Analytics show real usage
- [ ] No performance degradation
- [ ] Feature flag can disable if needed
- [ ] Documentation updated
- [ ] Team trained on system
- [ ] Support procedures documented

---

## Rollback Procedure

**If critical issues occur:**

### Immediate (disable feature):

```bash
# Set environment variable in Vercel
vercel env add ENABLE_AI_NAVIGATION false production

# Trigger redeployment
vercel --prod
```

### Complete rollback (revert code):

```bash
# Revert commit
git revert HEAD
git push origin master

# Vercel redeploys automatically
```

### Notify users:

```
Update chat widget message:
"AI navigation is temporarily unavailable. We're working on a fix."
```

---

## Success Criteria

After Phase 7 completion, verify:

✅ **Functionality:**
- Users can navigate via AI commands
- All UI controls work
- Error handling is graceful

✅ **Performance:**
- Messages arrive in <200ms
- API responds in <200ms average
- No timeout errors

✅ **Reliability:**
- 99%+ message delivery
- Connection success >99%
- Error rate <1%

✅ **Scale:**
- Handles 50 concurrent users
- Free tier limits not exceeded
- Room for growth

✅ **User Experience:**
- Controls are intuitive
- Speed preferences work
- Mobile compatible
- Accessible

---

## Phase 7 Complete! 🎉🎉🎉

### All Phases Complete!

Go back to [overview.md](./overview.md) and verify all checkboxes are complete.

### Final Statistics

**Total implementation time:** ~21 hours (3 days)
**Lines of code added:** ~2,000
**Tests written:** 20+
**Features delivered:** 15+

### What You Built

✅ Real-time AI navigation system
✅ Natural language interface via Copilot
✅ Instant message delivery via Ably
✅ User controls (pause/resume/cancel)
✅ Speed preferences
✅ Security (tokens, rate limiting, CORS)
✅ Analytics and monitoring
✅ Mobile-responsive UI
✅ Accessibility features
✅ Production-ready deployment

### Next Steps

**Enhancements to consider:**
1. Route preview (show path before navigation)
2. Voice commands
3. Multi-waypoint routes
4. Weighted pathfinding (prefer elevators)
5. Analytics dashboard
6. Admin controls

**Celebrate your achievement! 🎊**

You've built a production-ready AI navigation system from scratch.

---

## Support & Maintenance

**Regular tasks:**
- Monitor Vercel logs weekly
- Check Ably dashboard weekly
- Review analytics monthly
- Update Copilot knowledge base as campus changes
- Rebuild navigation graph when photo data changes

**Troubleshooting resources:**
- [Ably Documentation](https://ably.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [TanStack Start Documentation](https://tanstack.com/start)
- [Copilot Studio Documentation](https://learn.microsoft.com/en-us/microsoft-copilot-studio/)

**Emergency contacts:**
- Ably Support: support@ably.com
- Vercel Support: https://vercel.com/support
- Your team's on-call rotation

---

**Implementation complete. System is production-ready. Congratulations!** 🚀
