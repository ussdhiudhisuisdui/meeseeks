# meeseeks-proxy

A single serverless function that sits between the Meeseeks Box (Roblox)
and the Anthropic API. Roblox's `HttpService` can't hold a secret safely,
so this proxy holds the API key and Roblox only ever sees a shared secret
it sends along with each request.

## Files

- `api/meeseeks.js` — the function Vercel deploys. Checks `secret`,
  forwards the conversation to Claude, returns `{ text }`.

## Setup

1. `vercel env add ANTHROPIC_API_KEY`
2. `vercel env add SHARED_SECRET`
3. `vercel --prod`

Your endpoint will be `https://<project>.vercel.app/api/meeseeks`.
Put that URL and the same `SHARED_SECRET` into `MeeseeksBrain.lua`'s
`ENDPOINT` and `SHARED_SECRET` constants.

## Request shape

```json
{
  "secret": "...",
  "system": "...",
  "context": { "owner": "PlayerName", "nearby": ["Player1", "Player2"] },
  "history": [{ "role": "user", "content": "..." }]
}
```

## Response shape

```json
{ "text": "<raw model output>" }
```
