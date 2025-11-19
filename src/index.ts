// Cloudflare Workers Serverless Proxy
// Allows proxying requests to any URL through your Cloudflare Workers instance
// Usage: https://your-worker.workers.dev/https://example.com

export default {
    async fetch(req: Request): Promise<Response> {
        const url = new URL(req.url);

        // Handle CORS preflight requests
        if (req.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Max-Age': '86400',
                },
            });
        }

        // Get the target URL from the path (everything after the first /)
        const targetUrl = url.pathname.slice(1) + url.search;

        // Handle root path - show hello world
        if (!targetUrl || targetUrl === '') {
            return new Response('Hello World', {
                headers: {
                    'Content-Type': 'text/plain; charset=utf-8',
                },
            });
        }

        // Validate that the target URL is valid
        let target: URL;
        try {
            target = new URL(targetUrl);
        } catch {
            return new Response(
                JSON.stringify({
                    error: 'Invalid URL',
                    message: 'Please provide a valid URL to proxy',
                    usage: `${url.origin}/https://example.com`,
                }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                }
            );
        }

        // Only allow http and https protocols
        if (!['http:', 'https:'].includes(target.protocol)) {
            return new Response(
                JSON.stringify({
                    error: 'Invalid Protocol',
                    message: 'Only HTTP and HTTPS protocols are supported',
                }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                }
            );
        }

        try {
            // Prepare headers for the proxied request
            const proxyHeaders = new Headers();

            // Copy relevant headers from the original request
            for (const [key, value] of req.headers.entries()) {
                // Skip host header and other headers that should not be forwarded
                if (!['host', 'connection', 'keep-alive', 'cf-connecting-ip', 'cf-ray', 'cf-visitor'].includes(key.toLowerCase())) {
                    proxyHeaders.set(key, value);
                }
            }

            // Set the host header to the target host
            proxyHeaders.set('Host', target.host);

            // Make the proxied request
            const proxyResponse = await fetch(target.href, {
                method: req.method,
                headers: proxyHeaders,
                body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : null,
                redirect: 'follow',
            });

            // Prepare response headers
            const responseHeaders = new Headers(proxyResponse.headers);

            // Add CORS headers
            responseHeaders.set('Access-Control-Allow-Origin', '*');
            responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
            responseHeaders.set('Access-Control-Allow-Headers', '*');

            // Add proxy information header
            responseHeaders.set('X-Proxied-By', 'Cloudflare-Workers-Proxy');
            responseHeaders.set('X-Target-URL', target.href);

            // Return the proxied response
            return new Response(proxyResponse.body, {
                status: proxyResponse.status,
                statusText: proxyResponse.statusText,
                headers: responseHeaders,
            });

        } catch (error) {
            console.error('Proxy error:', error);

            return new Response(
                JSON.stringify({
                    error: 'Proxy Error',
                    message: error instanceof Error ? error.message : 'Failed to proxy request',
                    target: target.href,
                }),
                {
                    status: 502,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                }
            );
        }
    },
};
