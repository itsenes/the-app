// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
    production: false,
    api_url: 'http://api-vnext.incontrl.io',
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
  }
