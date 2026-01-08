# Ollama Setup Guide - Unlimited Free AI ✅

**Status**: Ollama is installed and configured with `qwen2.5:7b` model!

Ollama allows you to run AI models locally on your machine, giving you **unlimited tokens** without any API costs or credit limits!

## Why Ollama?

- ✅ **Unlimited tokens** - No API limits or credit restrictions
- ✅ **100% Free** - No costs, no subscriptions
- ✅ **Privacy** - All processing happens locally
- ✅ **Fast** - No network latency
- ✅ **Offline capable** - Works without internet

## Installation

### Windows

1. Download Ollama from: https://ollama.ai/download
2. Run the installer
3. Ollama will start automatically

### macOS

```bash
brew install ollama
```

### Linux

```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

## Quick Start

1. **Start Ollama** (usually runs automatically after installation)

2. **Pull a model** (download it locally):
   ```bash
   # Lightweight model (3B parameters, ~2GB RAM, fast)
   ollama pull llama3.2:3b
   
   # Medium model (8B parameters, ~8GB RAM, better quality)
   ollama pull llama3.2:8b
   
   # Large model (70B parameters, ~40GB RAM, best quality)
   ollama pull llama3.2:70b
   ```

3. **Test it works**:
   ```bash
   ollama run llama3.2:3b "Hello, how are you?"
   ```

## Recommended Models

### For Development/Testing (Low RAM)
- `llama3.2:3b` - Fast, uses ~2GB RAM
- `phi3:mini` - Very fast, uses ~2GB RAM

### For Production (Medium RAM)
- `llama3.2:8b` - Good balance, uses ~8GB RAM
- `mistral:7b` - Great quality, uses ~7GB RAM

### For Best Quality (High RAM)
- `llama3.2:70b` - Best quality, uses ~40GB RAM
- `mistral:large` - Excellent quality, uses ~24GB RAM

## Configuration ✅

**Your Current Setup**: 
- ✅ Ollama is running on `http://localhost:11434`
- ✅ Model `qwen2.5:7b` is installed and configured
- ✅ Application will automatically use Ollama for unlimited tokens!

The application will automatically detect Ollama and use `qwen2.5:7b` by default.

**Optional**: You can customize settings in your `.env` file (not required):

```env
# Optional: Change Ollama URL (default: http://localhost:11434)
OLLAMA_BASE_URL=http://localhost:11434

# Optional: Change default model (default: qwen2.5:7b)
OLLAMA_MODEL=qwen2.5:7b
```

## How It Works

1. **Primary**: The app tries Ollama first (unlimited tokens)
2. **Fallback**: If Ollama is not available, it falls back to cloud APIs (OpenAI, Gemini, etc.)

This means:
- If Ollama is running → Unlimited free usage ✅
- If Ollama is not running → Uses cloud APIs (with credit limits) ⚠️

## Troubleshooting

### Ollama not detected?

1. Check if Ollama is running:
   ```bash
   curl http://localhost:11434/api/tags
   ```

2. If not running, start Ollama:
   - Windows: Check system tray or start menu
   - macOS/Linux: `ollama serve`

### Model not found?

Pull the model first:
```bash
ollama pull llama3.2:3b
```

### Out of memory?

Use a smaller model:
- `llama3.2:3b` (2GB RAM)
- `phi3:mini` (2GB RAM)

### Slow responses?

1. Use a smaller model (3b instead of 8b)
2. Ensure you have enough RAM
3. Close other applications

## Performance Tips

1. **For PDFs (10-150 pages)**: Use `llama3.2:8b` or larger for better context understanding
2. **For quick responses**: Use `llama3.2:3b` or `phi3:mini`
3. **For best quality**: Use `llama3.2:70b` if you have 40GB+ RAM

## Next Steps

1. Install Ollama
2. Pull a model: `ollama pull llama3.2:3b`
3. Restart your application
4. Enjoy unlimited free AI! 🎉

The application will automatically use Ollama when available, giving you unlimited tokens without any API costs!

