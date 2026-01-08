# Ollama Performance Optimization Guide

## Why Ollama is Slow

Ollama can be slow for several reasons:
1. **Model Size**: Larger models (7B, 8B) are slower than smaller ones (3B, 1.5B)
2. **Context Length**: Longer contexts take more time to process
3. **Hardware**: CPU-only inference is slower than GPU
4. **Token Limits**: Higher max_tokens means longer generation time

## Current Optimizations Applied

✅ **Model Changed**: `qwen2.5:7b` → `qwen2.5:3b` (3x faster)
✅ **Reduced Max Tokens**: 4096 → 1500 (faster generation)
✅ **Lower Temperature**: 0.7 → 0.5 (faster, more focused)
✅ **Smaller Contexts**: 30k → 15k chars (faster processing)
✅ **Shorter Timeouts**: 2min → 1min (faster failure detection)

## Faster Model Options

### Option 1: Use Smaller Model (Recommended)
```bash
# Pull a faster 3B model
ollama pull qwen2.5:3b

# Or even faster 1.5B model
ollama pull phi3:mini
```

### Option 2: Use GPU (If Available)
If you have an NVIDIA GPU:
```bash
# Ollama will automatically use GPU if available
# Check with: ollama ps
```

### Option 3: Use Cloud APIs for Speed
The system automatically falls back to cloud APIs (OpenAI, Gemini) if Ollama is slow or unavailable.

## Configuration

Edit `.env` to use a faster model:
```env
OLLAMA_MODEL=qwen2.5:3b  # Fast, good quality
# OR
OLLAMA_MODEL=phi3:mini   # Very fast, smaller
```

## Performance Comparison

| Model | Speed | Quality | RAM Usage |
|-------|-------|---------|-----------|
| `qwen2.5:3b` | ⚡⚡⚡ Fast | ⭐⭐⭐ Good | ~2GB |
| `phi3:mini` | ⚡⚡⚡⚡ Very Fast | ⭐⭐ Decent | ~1.5GB |
| `qwen2.5:7b` | ⚡ Slow | ⭐⭐⭐⭐ Better | ~4GB |
| `llama3.2:8b` | ⚡⚡ Medium | ⭐⭐⭐⭐ Better | ~5GB |

## Recommendations

1. **For Speed**: Use `qwen2.5:3b` or `phi3:mini`
2. **For Quality**: Use `qwen2.5:7b` (current, but slower)
3. **For Best Balance**: Use `qwen2.5:3b` (recommended)

## Quick Fix

Run this to switch to a faster model:
```bash
ollama pull qwen2.5:3b
```

Then restart your server. The system will automatically use the faster model!

