# Phase 1: Setup & Dependencies

**Duration:** 15 minutes
**Difficulty:** Easy
**Prerequisites:** None

---

## Objectives

By the end of this phase, you will have:

1. ✅ OpenAI account created
2. ✅ API key generated
3. ✅ OpenAI SDK installed
4. ✅ Environment variables configured
5. ✅ Basic connection tested

---

## Step 1.1: Create OpenAI Account

**Time:** 5 minutes

### Create Account

1. Go to https://platform.openai.com/signup
2. Sign up with email or Google/Microsoft account
3. Verify your email address

### Add Credit

OpenAI requires a minimum payment to use the API:

1. Go to https://platform.openai.com/settings/organization/billing/overview
2. Click **"Add payment method"**
3. Add credit card
4. **Add $5-10 credit** (should last months for development/testing)

**Pricing:**
- GPT-4 Turbo: ~$0.01 per 1,000 input tokens, ~$0.03 per 1,000 output tokens
- Average chat: ~280 tokens = **$0.005 per conversation**

### Generate API Key

1. Go to https://platform.openai.com/api-keys
2. Click **"Create new secret key"**
3. Name it: `ara-campus-chat`
4. **Copy the key immediately** (you can't see it again!)
5. Store it somewhere safe temporarily (we'll add to `.env` next)

**Example key format:** `sk-proj-abc123xyz...` (starts with `sk-`)

✅ **Validation:** You should have an API key that starts with `sk-`

---

## Step 1.2: Install OpenAI SDK

**Time:** 2 minutes

### Install Package

```bash
npm install openai
```

**Expected output:**
```
added 1 package, and audited 489 packages in 3s
```

### Verify Installation

Check `package.json`:

```json
{
  "dependencies": {
    "openai": "^4.82.0",
    ...
  }
}
```

✅ **Validation:** `openai` package appears in `package.json` dependencies

---

## Step 1.3: Configure Environment Variables

**Time:** 3 minutes

### Create `.env.local` File

Create a file called `.env.local` in your project root:

```bash
# In project root (same level as package.json)
touch .env.local
```

**On Windows:**
```bash
echo. > .env.local
```

### Add OpenAI API Key

Add this line to `.env.local`:

```bash
OPENAI_API_KEY=sk-proj-your-actual-key-here
```

**Replace `sk-proj-your-actual-key-here` with your actual key from Step 1.1!**

### Verify `.gitignore`

**IMPORTANT:** Ensure `.env.local` is in `.gitignore` so your API key is never committed to git.

Check your `.gitignore` file contains:

```bash
# Local env files
.env*.local
.env
```

If not, add it now!

✅ **Validation:**
- `.env.local` exists with your API key
- `.env.local` is listed in `.gitignore`

---

## Step 1.4: Test OpenAI Connection

**Time:** 5 minutes

### Create Test File

Create a temporary test file to verify OpenAI connection:

```bash
# Create test file
touch test-openai.ts
```

**On Windows:**
```bash
echo. > test-openai.ts
```

### Add Test Code

Add this code to `test-openai.ts`:

```typescript
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

async function testConnection() {
  try {
    console.log('Testing OpenAI connection...')

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant."
        },
        {
          role: "user",
          content: "Say hello!"
        }
      ],
      max_tokens: 50
    })

    console.log('✅ Connection successful!')
    console.log('AI response:', response.choices[0].message.content)
    console.log('Tokens used:', response.usage?.total_tokens)

  } catch (error: any) {
    console.error('❌ Connection failed:', error.message)

    if (error.status === 401) {
      console.error('Invalid API key. Check your .env.local file.')
    } else if (error.status === 429) {
      console.error('Rate limit exceeded or no credit. Check your OpenAI billing.')
    } else {
      console.error('Full error:', error)
    }
  }
}

testConnection()
```

### Run Test

```bash
npx tsx test-openai.ts
```

**Expected output:**
```
Testing OpenAI connection...
✅ Connection successful!
AI response: Hello! How can I assist you today?
Tokens used: 28
```

**If you see an error:**

**Error: "Invalid API key"**
- Check `.env.local` has correct key format: `OPENAI_API_KEY=sk-proj-...`
- Ensure no quotes around the key value
- Restart your terminal to load new environment variables

**Error: "Rate limit exceeded" or "Insufficient quota"**
- Go to https://platform.openai.com/settings/organization/billing/overview
- Verify you have credit remaining
- Add more credit if balance is $0

**Error: "Network error" or "ENOTFOUND"**
- Check your internet connection
- Verify you can access https://api.openai.com in your browser

### Clean Up Test File

Once the test passes, delete the test file:

```bash
rm test-openai.ts
```

**On Windows:**
```bash
del test-openai.ts
```

✅ **Validation:** Test successfully connected to OpenAI and received a response

---

## Step 1.5: Verify TanStack Start Configuration

**Time:** 2 minutes

### Check Server Function Support

TanStack Start has built-in support for `'use server'` directives. Verify your project is using TanStack Start:

Check `package.json`:

```json
{
  "dependencies": {
    "@tanstack/react-router": "^1.x.x",
    "@tanstack/react-start": "^1.x.x",
    ...
  }
}
```

✅ **Validation:** Both `@tanstack/react-router` and `@tanstack/react-start` are in dependencies

### Check TypeScript Configuration

Verify `tsconfig.json` has path aliases configured:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

This allows imports like `import { getChatResponse } from '@/lib/ai'`

✅ **Validation:** Path aliases are configured

---

## Phase 1 Complete! 🎉

### Checklist Review

- [x] 1.1 - OpenAI account created with credit
- [x] 1.2 - OpenAI SDK installed (`npm install openai`)
- [x] 1.3 - API key added to `.env.local`
- [x] 1.4 - Connection test passed
- [x] 1.5 - TanStack Start configuration verified

### What You Accomplished

✅ **Environment ready for AI development**
✅ **OpenAI API verified working**
✅ **Security configured** (API key in `.env.local`, gitignored)
✅ **Cost tracking enabled** (can monitor usage in OpenAI dashboard)

### Cost Incurred So Far

**$0** - Test connection used ~28 tokens = $0.0003

---

## Troubleshooting

### "Cannot find module 'openai'"

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### "OPENAI_API_KEY is not defined"

**Solution:**
1. Verify `.env.local` exists in project root
2. Restart your terminal/dev server
3. In TanStack Start, environment variables are loaded automatically

### "This model is not available for your account"

**Solution:**
- You need to have made at least one successful payment to access GPT-4
- Alternative: Use `gpt-3.5-turbo` instead (cheaper, but less capable)

Update test to use GPT-3.5:
```typescript
model: "gpt-3.5-turbo",  // Instead of gpt-4-turbo-preview
```

---

## Next Steps

**Proceed to Phase 2:** [Phase 2 - Server Function](./phase-2-server-function.md)

You'll implement:
- AI server function with OpenAI function calling
- Navigation command schema
- Error handling and type safety

**Estimated time:** 20 minutes
