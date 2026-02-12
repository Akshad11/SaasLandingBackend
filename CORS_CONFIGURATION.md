# CORS Configuration Guide

## Overview

The backend is configured to handle Cross-Origin Resource Sharing (CORS) for both local development and production deployments on Vercel.

## How CORS Works in This Application

### Allowed Origins

The application allows requests from:

1. **Local Development**:
   - `http://localhost:5173` (Vite default)
   - `http://localhost:3000` (React/Next.js default)

2. **Production**:
   - Your main production frontend URL (set in `CLIENT_URL` environment variable)
   - Any Vercel preview URLs containing `aarvionservices` and `vercel.app`

3. **No Origin**:
   - Requests without an origin header (Postman, mobile apps, server-to-server)

### Dynamic Origin Validation

The CORS middleware uses a function to validate origins dynamically:

```javascript
origin: function (origin, callback) {
    // Allow requests with no origin
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
        return callback(null, true);
    }
    
    // Allow any Vercel preview URLs for aarvionservices
    if (origin.includes('aarvionservices') && origin.includes('vercel.app')) {
        return callback(null, true);
    }
    
    // Reject other origins
    return callback(new Error('CORS policy violation'), false);
}
```

## Configuration

### Environment Variables

Set the `CLIENT_URL` in your `.env` file:

**Local Development:**
```env
CLIENT_URL=http://localhost:5173
```

**Production (Vercel):**
```env
CLIENT_URL=https://your-frontend.vercel.app
```

### Vercel Environment Variables

When deploying to Vercel, make sure to set the `CLIENT_URL` environment variable in your Vercel project settings:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add `CLIENT_URL` with your frontend URL
4. Redeploy your backend

## CORS Settings

### Allowed Methods
- `GET`
- `POST`
- `PUT`
- `DELETE`
- `OPTIONS`
- `PATCH`

### Allowed Headers
- `Content-Type`
- `Authorization`
- `X-Requested-With`

### Exposed Headers
- `Content-Range`
- `X-Content-Range`

### Credentials
- **Enabled**: `credentials: true`
- This allows cookies and authorization headers to be sent with requests

### Preflight Cache
- **Max Age**: 86400 seconds (24 hours)
- Reduces the number of preflight OPTIONS requests

## Common CORS Errors and Solutions

### Error: "No 'Access-Control-Allow-Origin' header is present"

**Cause**: The frontend origin is not in the allowed list.

**Solution**:
1. Check that `CLIENT_URL` is set correctly in `.env`
2. Verify the frontend URL matches exactly (including protocol: `https://` vs `http://`)
3. For Vercel preview URLs, ensure they contain `aarvionservices` and `vercel.app`
4. Restart the backend server after changing `.env`

### Error: "CORS policy: credentials mode is 'include'"

**Cause**: Frontend is sending credentials but backend isn't configured to accept them.

**Solution**: Already configured with `credentials: true` in CORS settings.

### Error: "Method not allowed by CORS"

**Cause**: The HTTP method used is not in the allowed methods list.

**Solution**: Check that the method is in the allowed list. If you need to add a new method, update the `methods` array in `server.js`.

## Testing CORS

### Test with cURL

```bash
# Test preflight request
curl -X OPTIONS https://backend-omega-opal-72.vercel.app/api/analytics/event \
  -H "Origin: https://frontend-7xdc-git-main-aarvionservices-projects.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Test actual request
curl -X POST https://backend-omega-opal-72.vercel.app/api/analytics/event \
  -H "Origin: https://frontend-7xdc-git-main-aarvionservices-projects.vercel.app" \
  -H "Content-Type: application/json" \
  -d '{"event":"test"}' \
  -v
```

### Test in Browser Console

```javascript
fetch('https://backend-omega-opal-72.vercel.app/api/analytics/event', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({ event: 'test' })
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));
```

## Adding New Origins

To add a new allowed origin:

1. Open `src/server.js`
2. Add the origin to the `allowedOrigins` array:

```javascript
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://frontend-7xdc-git-main-aarvionservices-projects.vercel.app',
    'https://your-new-origin.com', // Add here
    process.env.CLIENT_URL
].filter(Boolean);
```

3. Restart the server

## Wildcard Pattern Matching

The current configuration uses pattern matching for Vercel preview URLs:

```javascript
if (origin.includes('aarvionservices') && origin.includes('vercel.app')) {
    return callback(null, true);
}
```

This allows any Vercel preview URL like:
- `https://frontend-abc123.vercel.app` (if it contains 'aarvionservices')
- `https://frontend-7xdc-git-main-aarvionservices-projects.vercel.app`
- `https://frontend-pr-42-aarvionservices.vercel.app`

## Security Considerations

1. **Don't use `origin: '*'`** - This disables CORS protection and is insecure
2. **Validate origins carefully** - Only allow trusted domains
3. **Use HTTPS in production** - Always use `https://` for production URLs
4. **Limit credentials** - Only enable `credentials: true` if you need to send cookies/auth headers
5. **Review allowed origins regularly** - Remove origins that are no longer needed

## Deployment Checklist

- [ ] Set `CLIENT_URL` environment variable in Vercel
- [ ] Verify frontend URL is correct (including protocol)
- [ ] Test CORS with a simple request
- [ ] Check browser console for CORS errors
- [ ] Verify credentials are working if needed
- [ ] Test with different HTTP methods (GET, POST, etc.)

## Troubleshooting

### CORS works locally but not in production

1. Check Vercel environment variables are set correctly
2. Verify the frontend URL matches exactly
3. Check Vercel deployment logs for errors
4. Test with the exact production URL, not a preview URL

### CORS works for some endpoints but not others

1. Check if there are route-specific CORS configurations
2. Verify all routes use the same CORS middleware
3. Check for conflicting CORS headers in route handlers

### Preflight requests failing

1. Ensure `OPTIONS` is in the allowed methods
2. Check that `Access-Control-Request-Method` header is allowed
3. Verify `maxAge` is set to cache preflight responses

## Additional Resources

- [MDN CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Express CORS Middleware](https://expressjs.com/en/resources/middleware/cors.html)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
