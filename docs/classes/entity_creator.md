### EntityCreator

Creates the entities included in a parsed response in their corresponding stores.

#### constructor

Creates a new instance of the `EntityCreator`.

```ts
constructor( { rootStore } ): EntityCreator
```

##### Parameters

The `EntityCreator` `constructor` receives an hash parameter with the following properties:

| Name | Type | Description | Required | Default |
| ---- | ---- | ------ | ------ | ---- |
| rootStore | [IRootStpre](../types.md#irootstore) | The root store containing the entity stores where the entities are going to be created. | yes | - |

##### Return

Returns a new instance of the `EntityCreator`.

##### Example

```ts
import RootStore from 'stores/RootStore';

const rootStore = new RootStore();
const creator = new EntityCreator( { rootStore } );
```

#### create

Creates all the entities included in the response in their corresponding entity stores.

```ts
create<T>( parsedResponse ): ( T | null | T[] )
```

##### Parameters

| Name | Type | Description | Required | Default |
| ---- | ---- | ------ | ------ | ---- |
| parsedResponse | [ParsedResponse](../types.md#parsedresponse) | The parsed response returned by the parser. | yes | - |

##### Return

Returns:
- `null` if the parsed response `data` key does not have any valid entity data.
- The created entity for responses including only one entity in the `data` key.
- The created entities for responses including a list of entities in the `data` key.

##### Example

```ts
import RootStore from 'stores/RootStore';

const rootStore = new RootStore();
const creator = new EntityCreator( { rootStore } );

const parsedResponse = {
	data: {
		type: 'user',
		attributes: {
			id: 1,
			firstName: 'Homer',
			lastName: 'Simpson',
			age: 36,
			cityId: 3
		}
	},
	included: [
		{
			type: 'city',
			attributes: {
				id: 3,
				name: 'Springfield',
				stateId: 8
			}
		},
		{
			type: 'state',
			attributes: {
				id: 8,
				name: 'Illinois'
			}
		}
	]
};

const user = creator.create<User>( parsedResponse );
// User( {
// 	id: 1,
// 	firstName: 'Homer',
// 	lastName: 'Simpson',
// 	age: 36,
// 	cityId: 3
// } )

// Setups the included relationships
const userCity = user.city;
// City( {
// 	id: 3,
// 	name: 'Springfield',
// 	stateId: 8
// } )

// Creates and saves also the entities in the included list
const cityFromStore = rootStore.citiesStore.get( 8 );
// City( {
// 	id: 3,
// 	name: 'Springfield',
// 	stateId: 8
// } )

const areEqual = userCity === cityFromStore
// true
```