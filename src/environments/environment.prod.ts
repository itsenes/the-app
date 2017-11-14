export const environment = {
  production: true,
  api_url: 'https://api.incontrl.io',
  auth_settings: {
    authority: 'https://incontrl.io/',
    client_id: 'spa',
    redirect_uri: 'https://app.incontrl.io/auth-callback',
    post_logout_redirect_uri: 'https://app.incontrl.io/logged-out',
    response_type: 'id_token token',
    scope: 'openid profile email core',
    filterProtocolClaims: true,
    loadUserInfo: true
  }
};
