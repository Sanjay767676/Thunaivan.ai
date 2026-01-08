# Disable Ollama for Faster Responses

If Ollama is too slow on your system, you can disable it to use cloud APIs instead.

## Quick Disable

Add to your `.env` file:

```env
USE_OLLAMA=false
```

This will skip Ollama entirely and use cloud APIs (OpenRouter, OpenAI, Gemini) which are much faster.

## Why Disable Ollama?

Ollama can be slow if:
- Running on CPU only (no GPU)
- Limited RAM
- Model is too large for your system
- First request (model loading)

## Current Status

Your system is timing out with Ollama even after 3 minutes, which means:
- Ollama is too slow for your hardware
- Cloud APIs will be much faster
- You'll get instant responses

## Recommendation

**Disable Ollama** by adding `USE_OLLAMA=false` to your `.env` file, then restart the server.

The system will automatically use cloud APIs which are:
- ✅ Much faster (seconds vs minutes)
- ✅ More reliable
- ✅ Better quality responses
- ⚠️ Requires API credits (but you already have them set up)

## Alternative: Keep Ollama but with Shorter Timeout

The system now has a 30-second timeout for Ollama. If it doesn't respond in 30 seconds, it automatically falls back to cloud APIs.

This gives you:
- Fast responses (cloud APIs)
- Free option (Ollama) if it's fast enough
- Best of both worlds

