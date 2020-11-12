/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (insights.js) is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import React from "react";

describe('Insights', () => {
  beforeEach(() => {
    cy.server();
    cy.route("/user/**", 'fx:user');
    cy.route("/farm/**", 'fx:farm');
    cy.route("**/field_crop/farm/**", 'fx:fieldCropByFarm');
    cy.route("**/field/**", 'fx:fields');
    cy.route("/insight/people_fed/**", 'fx:insights/peopleFed');
    cy.route("/insight/soil_om/**", 'fx:insights/soilOM');
    cy.route("/insight/prices/**", 'fx:insights/prices');

    cy.viewport(410, 730);
    cy.visit('http://localhost:3000');
    cy.login();

    cy.get('.bm-burger-button').click();
    cy.contains('Insights').should('be.visible').click();
    cy.wait(1000);
  });

  it('Renders Main Insights Page Correctly', () => {
    cy.get('.insightItem').its('length').should('eq', 7);
    cy.get('.insightItem:first div div').should('contain', '20');
    cy.get('.insightItem').eq(1).should('contain', 4);
  });

  it('People Fed Page is Correct', () => {
    const infoBox = 'We estimate the number of potential meals provided by your farm based on sales data, and crop composition databases. We assume that daily requirements are divided equally across three meals a day.';
    cy.get('.insightItem:first div:first').click();
    cy.get('.meals:first').should('contain', '40');
    cy.get('.meals').eq(1).should('contain', '10');
    cy.get('.meals').eq(2).should('contain', '6');
    cy.get('.meals').eq(3).should('contain', '30');
    cy.get('.meals').eq(4).should('contain', '2');

    cy.get('[class="glyphicon glyphicon-info-sign"]').click();
    cy.get('.modal-body').should('be.visible');
    cy.get('.modal-body').should('contain', infoBox)
  });

  it('Prices Page is Correct', () => {
    cy.get('.insightItem .itemButton').eq(4).click();
    const infoBox = 'We show you the trajectory of your sales prices against the sales prices for the same goods within a given distance of you, collected across the LiteFarm network.';
    cy.get('[class="glyphicon glyphicon-info-sign"]').click();
    cy.get('.modal-body').should('be.visible');
    cy.get('.modal-body').should('contain', infoBox);
  });
});