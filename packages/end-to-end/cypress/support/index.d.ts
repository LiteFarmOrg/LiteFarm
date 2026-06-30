declare namespace Cypress {
  interface Chainable {
    createUser(overrides?: object): Chainable<any>;

    apiLogin(email: string): Chainable<any>;

    createUserAndLogin(overrides?: object): Chainable<any>;
    injectTokenToUI(token: string): Chainable<any>;
  }
}
