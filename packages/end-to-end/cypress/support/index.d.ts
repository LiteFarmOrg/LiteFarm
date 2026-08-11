declare namespace Cypress {
  interface Chainable {
    createUser(overrides?: object): Chainable<any>;

    apiLogin(email: string): Chainable<any>;

    createUserAndLogin(overrides?: object): Chainable<any>;
    injectTokensToUI(user: string, token: string): Chainable<any>;
  }
}
