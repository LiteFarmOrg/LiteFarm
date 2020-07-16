## Consent Form Versioning 
Each word file begins with a string `Version <Version Number>:`, e.g. `Version 1.0:`

The app determines the document version by reading the string between positions of the first occurance of a **space character** and 
a **colon**. It does not matter how long the version number string is. 

When a user(not new) chooses a farm upon login, the verion number in the document is compared with the number recorded in database. Users 
will be redirected to `/consent` page if the numbers do not agree. Once agreed, the new version number is updated on the database.

The default initial version number is set to 1.0 in the database.

## How to
1. Update/Replace the terms in existing word documents 
2. Update the version number, we can use this [versioning system](https://semver.org/)
