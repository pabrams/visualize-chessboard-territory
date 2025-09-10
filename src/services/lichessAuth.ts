import pkceChallenge from 'pkce-challenge';

const LICHESS_HOST = 'https://lichess.org';
const CLIENT_ID = 'visualize-chessboard-territory'; // Replace with your client ID

const pkce = pkceChallenge();
const CODE_VERIFIER = pkce.code_verifier;
const CODE_CHALLENGE = pkce.code_challenge;

export const login = () => {
  const redirectUri = window.location.origin;
  const authUrl = new URL(`${LICHESS_HOST}/oauth`);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', 'read:prefs'); // Request necessary scopes
  authUrl.searchParams.set('code_challenge_method', 'S256');
  authUrl.searchParams.set('code_challenge', CODE_CHALLENGE);

  // Store verifier in session storage
  sessionStorage.setItem('codeVerifier', CODE_VERIFIER);

  window.location.href = authUrl.toString();
};

export const handleRedirect = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const codeVerifier = sessionStorage.getItem('codeVerifier');

  if (code && codeVerifier) {
    const redirectUri = window.location.origin;
    const tokenUrl = `${LICHESS_HOST}/api/token`;

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: CLIENT_ID,
        code_verifier: codeVerifier,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      // Clean up the URL and session storage
      window.history.replaceState({}, document.title, window.location.pathname);
      sessionStorage.removeItem('codeVerifier');
      return data.access_token;
    } else {
      console.error('Failed to exchange authorization code for access token');
      // Clean up the URL and session storage
      window.history.replaceState({}, document.title, window.location.pathname);
      sessionStorage.removeItem('codeVerifier');
      return null;
    }
  }
  return null;
};
