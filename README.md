# Cloudflare Workers Proxy

A lightweight, serverless proxy service running on Cloudflare Workers. This proxy allows you to route requests through your Cloudflare Workers instance to any URL, with built-in CORS support and security features.

## Features

- 🚀 **Serverless** - Runs on Cloudflare's global edge network
- 🌐 **CORS Enabled** - Full CORS support for cross-origin requests
- 🔒 **Secure** - Only allows HTTP/HTTPS protocols
- ⚡ **Fast** - Low latency with Cloudflare's global infrastructure
- 🛡️ **Error Handling** - Comprehensive error handling and validation
- 📝 **Request Headers** - Properly forwards headers to target URLs

## Usage

Once deployed, you can use the proxy by appending the target URL to your worker's URL:

```
https://your-worker.workers.dev/https://example.com
```

### Examples

**Basic GET request:**
```bash
curl https://your-worker.workers.dev/https://api.github.com/users/github
```

**With query parameters:**
```bash
curl https://your-worker.workers.dev/https://api.example.com/data?param1=value1&param2=value2
```

**POST request:**
```bash
curl -X POST https://your-worker.workers.dev/https://api.example.com/submit \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'
```

**From JavaScript:**
```javascript
fetch('https://your-worker.workers.dev/https://api.example.com/data')
  .then(response => response.json())
  .then(data => console.log(data));
```

## Installation & Deployment

### ⚡ Quick Deploy (Copy-Paste Method) - Recommended

This is the easiest way to deploy! No installation required.

**Step 1:** Go to [Cloudflare Workers Dashboard](https://dash.cloudflare.com/)

**Step 2:** Click "Create a Service" or "Create Worker"

**Step 3:** Give your worker a name (e.g., `my-proxy`)

**Step 4:** Copy the entire content of `worker.js` file

**Step 5:** Paste it into the Cloudflare Workers editor (replace all existing code)

**Step 6:** Click "Save and Deploy"

**Done!** Your proxy is now live at `https://your-worker-name.workers.dev` 🎉

### 🛠️ Alternative: Deploy via CLI (Advanced)

If you prefer using the command line:

#### Prerequisites

- Node.js (v16 or later)
- A Cloudflare account
- Wrangler CLI

#### Step 1: Install Dependencies

```bash
npm install
```

#### Step 2: Login to Cloudflare

```bash
npx wrangler login
```

#### Step 3: Deploy to Cloudflare Workers

```bash
npm run deploy
```

#### Step 4: Test Locally (Optional)

Before deploying, you can test the worker locally:

```bash
npm run dev
```

This will start a local development server at `http://localhost:8787`.

## Configuration

You can customize the worker by editing `wrangler.toml`:

```toml
name = "workers-proxy"           # Your worker name
main = "src/index.ts"            # Entry point
compatibility_date = "2024-01-01" # Compatibility date

# Optional: Configure CPU limits
# [limits]
# cpu_ms = 50

# Optional: Add environment variables
# [vars]
# ENVIRONMENT = "production"
# ALLOWED_DOMAINS = "example.com,api.example.com"
```

## API Response

### Success Response

When the proxy successfully forwards your request, you'll receive the response from the target URL with additional headers:

- `X-Proxied-By: Cloudflare-Workers-Proxy` - Indicates the response was proxied
- `X-Target-URL: <target-url>` - Shows the actual URL that was proxied
- `Access-Control-Allow-Origin: *` - CORS header for cross-origin access

### Error Responses

**Invalid URL (400):**
```json
{
  "error": "Invalid URL",
  "message": "Please provide a valid URL to proxy",
  "usage": "https://your-worker.workers.dev/https://example.com"
}
```

**Invalid Protocol (400):**
```json
{
  "error": "Invalid Protocol",
  "message": "Only HTTP and HTTPS protocols are supported"
}
```

**Proxy Error (502):**
```json
{
  "error": "Proxy Error",
  "message": "Failed to proxy request",
  "target": "https://example.com/path"
}
```

## Security Considerations

### Current Implementation

- ✅ Only HTTP and HTTPS protocols are allowed
- ✅ CORS headers are properly set
- ✅ Sensitive Cloudflare headers are stripped
- ✅ Host header is properly set for target requests

### Recommended Enhancements

For production use, consider adding:

1. **Rate Limiting** - Prevent abuse by limiting requests per IP
2. **Domain Whitelist** - Only allow proxying to specific domains
3. **Authentication** - Require API keys or tokens
4. **Request Size Limits** - Prevent large payload attacks
5. **Logging** - Track usage and potential abuse

### Example: Adding Domain Whitelist

You can modify the code to only allow specific domains:

```typescript
const ALLOWED_DOMAINS = ['api.example.com', 'example.org'];

// After URL validation
if (!ALLOWED_DOMAINS.includes(target.hostname)) {
  return new Response(
    JSON.stringify({
      error: 'Domain Not Allowed',
      message: 'This domain is not whitelisted for proxying',
    }),
    {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
```

## Use Cases

- **CORS Proxy** - Bypass CORS restrictions for development/testing
- **API Gateway** - Central point for API requests
- **Request Logging** - Monitor and log API requests
- **Header Injection** - Add authentication headers to requests
- **Content Transformation** - Modify responses before returning

## Development

### Project Structure

```
workers-proxy/
├── src/
│   └── index.ts          # Main worker code
├── wrangler.toml         # Cloudflare Workers configuration
├── package.json          # Node.js dependencies
└── README.md            # This file
```

### Local Development

Run the worker locally with hot reloading:

```bash
npm run dev
```

Then test with:

```bash
curl http://localhost:8787/https://example.com
```

### Debugging

View logs in the Cloudflare dashboard or use `wrangler tail`:

```bash
npx wrangler tail
```

## Costs

Cloudflare Workers offers a generous free tier:

- **Free Tier**: 100,000 requests/day
- **Paid Plan**: $5/month for up to 10 million requests

See [Cloudflare Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/) for details.

## Troubleshooting

### Issue: "Invalid URL" error

**Solution**: Make sure you're providing the full URL including the protocol (http:// or https://)

```bash
# ❌ Wrong
https://your-worker.workers.dev/example.com

# ✅ Correct
https://your-worker.workers.dev/https://example.com
```

### Issue: CORS errors in browser

**Solution**: The proxy automatically handles CORS. Make sure you're making requests to the proxy URL, not the target URL directly.

### Issue: Request timeout

**Solution**: Cloudflare Workers have a 50ms CPU time limit on the free plan. For heavy processing, consider upgrading to the paid plan.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this in your own projects.

## Acknowledgments

- Inspired by various CORS proxy implementations
- Built with [Cloudflare Workers](https://workers.cloudflare.com/)
- Converted from Deno Deploy implementation

## Support

If you encounter any issues or have questions:

1. Check the [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
2. Search for existing issues or create a new one
3. Join the [Cloudflare Discord](https://discord.gg/cloudflaredev)

---

**Note**: This proxy is for educational and development purposes. Be mindful of the rate limits and terms of service of the APIs you're proxying to. Always implement proper security measures for production use.
