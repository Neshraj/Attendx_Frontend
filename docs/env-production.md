# Production / deployment notes

## Frontend

Build with:

```bash
npm run build
```

Deploy `client/dist` to a static host such as Vercel or Netlify.

Set:

```text
VITE_API_URL=https://your-api.example.com/api
```

## Backend

Deploy the `server` directory to a Node host such as Render.

Set:

```text
NODE_ENV=production
PORT=5000
MONGODB_URI=...
JWT_SECRET=...
CLIENT_URL=https://your-frontend.example.com
```

Because authentication uses an HTTP-only cookie, the production server sets `secure=true` and `SameSite=None`. The frontend requests use `withCredentials: true`.

## Atlas

The MongoDB Atlas Free cluster is suitable for the assessment/demo workload. It is a small development-oriented shared tier, so production scaling should be evaluated separately. See MongoDB's current Atlas Free cluster documentation for limits and deployment steps.
