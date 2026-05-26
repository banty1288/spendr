
  # Design Spendr Mobile App UI

  This is a code bundle for Design Spendr Mobile App UI. The original project is available at https://www.figma.com/design/oKN131gbYKd6PRyz4Gsydb/Design-Spendr-Mobile-App-UI.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  The Vite dev server is pinned to `http://localhost:5173`.

  ## Firebase Auth setup

  `VITE_FIREBASE_AUTH_DOMAIN` must stay set to the Firebase project auth domain,
  usually `<project-id>.firebaseapp.com`. Do not set it to localhost or a URL
  with a port.

  For local Google sign-in, open Firebase Console > Authentication > Settings >
  Authorized domains and add:

  - `localhost` for `http://localhost:5173`
  - `127.0.0.1` only if you intentionally run Vite on `http://127.0.0.1:5173`

  Firebase Authorized domains stores the domain only, not the port. For
  deployment, add each production preview/custom domain before shipping, for
  example `your-app.web.app`, `your-app.firebaseapp.com`, or your custom domain.
  
