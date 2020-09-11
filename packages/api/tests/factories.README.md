## What are mock factories? 

A factory is a simple function that creates an _entity_ on the DB and returns it.
Mocks are just plain Objects that return the data of an _entity_.     

There are two types of functions in the `mock.factories` file
 * fakes, which return objects:  
```
// given an entity called User, with properties type, name, gender
function fakeUser(){
    return  {
        type: 'admin'
        name: 'Test User',
        gender: 'M'
    }
}
```
* factories, which return a promise of the insert DB operation
```
// using fakeUser
function userFactory(user = fakeUser()) {
    return knex('user').insert(user).returning('*');
} 
```


As you can see, factories make use of the fakes to supply the data needed to insert to the DB.
However, if you have data of your own, you can also set it yourself. If you look closely, we are 
defaulting the user to the fakeUser call only if the user didn't provide it.

so if you had your own user data you could use it like this: 

```
userFactory({type: 'manager', name: 'Linda', gender:'F'});
```  

Also, you could have the case where an entity depends on another to exist. 

Let's assume a user is linked to a house, a house can have only one owner, which holds the user id.

In this case we will create a `houseFactory` that will expect (or create) a user and then fake its data

```
function fakeHouse(){
    return { size: 20033.33, address: '1022 Fake Street'}
}

async function houseFactory({promisedUser = userfactory()}, house = fakeHouse()) {
    const {id} = await Promise.all([ promisedUser ]);
    return knex('house').insert({user_id: id, ...house}).returning('*');
}
```  

as you can see, in the case of an entity that depends on another, the factory
is expecting to receive an object containing a property (or N properties if it has multiple dependencies) called `promisedEntity`.

This `promisedEntity` can be 2 things: 
 *  if the user wants to supply an already created entity, then he can do so like
 ```
const [user] = userFactory({name: 'Kike'});
const house = await houseFactory({promisedUser: user})
```  
*  Or if he is just worried about the newly created entity he could supply no params (so promisedEntity is undefined) :
```
const house = await houseFactory();
```  
