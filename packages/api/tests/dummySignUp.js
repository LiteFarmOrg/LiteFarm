/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (dummySignUp.js) is part of LiteFarm.
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
const dummySignUp = {
    passwordInvalidUserNoLowercaseUppercase: {
        email : 'signuptest123@usertest.com',
        password : '1234+?4321!',
        user_metadata : {'first_name': 'Test', 'last_name' :'PasswordNoLetters'},
        app_metadata: { emailInvite: true },
        connection: 'Username-Password-Authentication',
    },
    passwordInvalidUserNoSpecialCharactersOrNumbers: {
        email : 'signuptest456@usertest.com',
        password : 'TESTpassword',
        user_metadata : {'first_name': 'Test', 'last_name' :'PasswordNoSpecialChar'},
        app_metadata: { emailInvite: true },
        connection: 'Username-Password-Authentication',
    },
    passwordBlankUser: {
        email : 'test123signup@usertest.com',
        password : '',
        user_metadata : {'first_name': 'Test', 'last_name' :'BlankPassword'},
        app_metadata: { emailInvite: true },
        connection: 'Username-Password-Authentication',
    },
    emailInvalidUser: {
        email : 'testmail.com',
        password : 'TEST123password?',
        user_metadata : {'first_name': 'Test', 'last_name' :'InvalidEmail'},
        app_metadata: { emailInvite: true },
        connection: 'Username-Password-Authentication',
    },
    emailBlankUser: {
        email : '',
        password : 'TEST123password?',
        user_metadata : {'first_name': 'Test', 'last_name' :'BlankEmail'},
        app_metadata: { emailInvite: true },
        connection: 'Username-Password-Authentication',
    },
    blankFirstNameUser :{
        email : 'blankFNametest1234signup@usertest.com',
        password : 'TEST123password?',
        user_metadata : {'last_name' :'TestLastName'},
        app_metadata: { emailInvite: true },
        connection: 'Username-Password-Authentication',
    },
    blankLastNameUser : {
        email : 'blankLNametest1234signup@usertest.com',
        password : 'TEST123password?',
        user_metadata : {'first_name': 'TestFirstName', 'last_name' :''},
        app_metadata: { emailInvite: true },
        connection: 'Username-Password-Authentication',
    },
    validSignupUser : {
        email : 'test1234_signup@usertest.com',
        password : 'TEST123password?',
        user_metadata : {'first_name': 'Test', 'last_name' :'ValidUser'},
        app_metadata: { emailInvite: true },
        connection: 'Username-Password-Authentication',
    },
    validUserAdd : {
        email: "test1234_signup@usertest.com",
        first_name: "Test",
        last_name: "ValidUser",
        profile_picture: "https://cdn.auth0.com/avatars/tv.png",
    },
}

module.exports = dummySignUp;