# API Entity Service

A set of services to provide an easy way to interact with a REST API resource and abstract common CRUD operations handling:

- The creation of the requests to the REST API service depending on the called method following REST conventions to decide which path and type of request to use.
- Parsing the REST API response using the provided attributes mappers.
- Creating the local entities in their corresponding stores. Taking care of setting up the relations between them correctly.

## Installation

Run the following command to add the `ApiEntityService` library to your project:

```bash
yarn add @amalgama/api-entity-service
```

## Usage

The main class of this package is the `ApiEntityService` class which provides an abstraction for an REST Api resource. This class depends on 3 other services:
- The api service in charge of making the http request to the remote REST API.
- The parser in charge of parsing the response received from the remote REST API.
- The creator in charge of creating the entities and their relationships in their corresponding stores.

Here you have an example of how these classes interact with each other when calling the `fetch` method in the `ApiEntityService`:

![sequence_diagram.jpg](docs/sequence_diagram.jpg)

This package provides implementations for:
- The [ApiEntityService](#apientityservice).
- A parser for JSON Api responses: [JSONAPIParser](#jsonapiparser).
- A parser for generic API responses providing the response schema: [SchemaParser](#schemaparser).
- An entity creator which creates the entities in their corresponding store providing a root store that contains them: [EntityCreator](#entitycreator).

### Complete Example

Here is a complete example using the `HTTPApiClient` from the [@amalgama/http-api-client package](https://git.amalgama.co/amalgama/packages/npm/http-api-client) as the `API` and the `StoreEntity` and `EntityStore` classes from the [@amalgama/entity-store package](https://git.amalgama.co/amalgama/packages/npm/entity-store) to define the entities stores for the root store.

__RootStore__
```ts
import { EntityStore } from '@amalgama/entity-store';
import type { IRootStore } from '@amalgama/api-entity-service';
import User from 'entities/User'; // class User extends StoreEntity
import City from 'entities/City'; // class City extends StoreEntity
import State from 'entities/State'; // class State extends StoreEntity

export default class RootStore implements IRootStore {
	usersStore: EntityStore<User>;
	postsStore: EntityStore<Post>;

	constructor() {
		this.usersStore = new EntityStore<User>();
		this.postsStore = new EntityStore<Post>();
	}

	getStore<T>( type: string ): IEntityStore<T> {
		const STORES_BY_TYPE = {
			user: this.usersStore,
			post: this.postsStore
		};

		const store = STORES_BY_TYPE[ type ];
		if ( !store ) { throw new Error( `There is not store defined for type ${type}` ); }

		return store as IEntityStore<T>;
	}
}
```

__PostsService__
```ts
import { Api } from '@amalgama/http-api-client';
import { EntityCreator, JSONApiParser, ApiEntityService } from '@amalgama/api-entity-service';

import RootStore from `stores/RootStore`;

const POST_MAPPER = {
	id: 'id',
	title: 'title',
	created_at: 'createdAt',
	author_id: 'authorId'
};

const USER_MAPPER = {
	id: 'id',
	first_name: 'firstName',
	last_name: 'lastName'
};

const api = new Api( 'https://test-api.amalgama.co' );
const basePath = 'v1/posts';
const rootStore = new RootStore();

const parser = new JSONApiParser( { post: POST_MAPPER, user: USER_MAPPER } );
const creator = new EntityCreator( { rootStore } );

const postsService = new ApiEntityService( {
	api,
	parser,
	creator,
	basePath
})

postsService.fetchAll( { page: 2, page_size: 3, order: 'created_at:desc' } );
// [
// 	Post( {
// 		id: 28,
// 		title: 'Other post',
// 		createdAt: '04/23/2022',
// 		authorId: 3
// 	} ),
// 	Post( {
// 		id: 13,
// 		title: 'My first post',
// 		createdAt: '02/29/2022',
// 		authorId: 3
// 	} ),
// 	Post( {
// 		id: 5,
// 		title: 'Awesome post',
// 		createdAt: '05/10/2019',
// 		authorId: 5
// 	} )
// ]
```

## Classes

### ApiEntityService

It is the main class of the package and provides an abstraction for an REST Api resource.

#### constructor

Creates a new instance of the `ApiEntityService` for the entity `T`.

```ts
constructor( api, basePath, parser, creator, paths, errorHandler ): ApiEntityService<T>
```

##### Parameters

| Name | Type | Description | Required | Default |
| ---- | ---- | ------ | ------ | ---- |
| api | [IApi](#iapi) | The api client to use to connect with the remote API | yes | - |
| basePath | `string` | The base path for the resource without the leading and ending slash. | yes | - |
| parser | [IResponseParser](#iresponseparser) | An object in charge of parsing the API responses | yes | - |
| creator | [IEntityCreator](#ientitycreator) | An object in charge of creating the fetched entities in the correct stores  | yes | - |
| paths | [ICustomPaths](#icustompaths) | A hash indicating custom paths for the CRUD methods  | no | `{}` |
| errorHandler | [IErrorHandler](#ierrorhandler) | An object in charge of handling the error responses | no | NullErrorHandler |

##### Return

Returns a new instance of the `ApiEntityService` that will:
- Use the `api` to make the requests to the remote REST API.
- Use the `parser` to parse the `api` responses before sending them to the `creator`.
- Use the `creator` to create the entities including in the parsed response in their corresponding entities stores.

#### create

Creates a new entity in the remote API.

```ts
create( attributes, params, config ): Promise<SingleEntityResponse<T>>
```

##### Parameters

| Name | Type | Description | Required | Default |
| ---- | ---- | ------ | ------ | ---- |
| attributes | [Attributes](#attributes) | The attributes for the new entity to create | yes | - |
| params | [Params](#params) | Additional query parameters to send with the request to the remote API | no | `{}` |
| config | [RequestWithBodyConfig](#requestwithbodyconfig) | Additional configuration for the request to the remote API | no | `{}` |

##### Return

Returns a promise that resolves to a [response object](#singleentityresponse) containing the created entity if the request to the API is successful.

#### update

Updates an existing entity in the remote API.

```ts
update( id, attributes, params, config ): Promise<SingleEntityResponse<T>>
```

##### Parameters

| Name | Type | Description | Required | Default |
| ---- | ---- | ------ | ------ | ---- |
| id | [EntityID](#entityid) | The ID of the entity to update | yes | - |
| attributes | [Attributes](#attributes) | The attributes to update | yes | - |
| params | [Params](#params) | Additional query parameters to send with the request to the remote API | no | `{}` |
| config | [RequestWithBodyConfig](#requestwithbodyconfig) | Additional configuration for the request to the remote API | no | `{}` |

##### Return

Returns a promise that resolves to a [response object](#singleentityresponse) containing the update entity if the request to the API is successful.

#### fetch

Fetches an existing entity in the remote API.

```ts
fetch( id, params ): Promise<SingleEntityResponse<T>>
```

##### Parameters

| Name | Type | Description | Required | Default |
| ---- | ---- | ------ | ------ | ---- |
| id | [EntityID](#entity-id) | The ID of the entity to fetch | yes | - |
| params | [Params](#params) | Additional query parameters to send with the request to the remote API | no | `{}` |

##### Return

Returns a promise that resolves to a [response object](#singleentityresponse) containing the fetched entity if the request to the API is successful.

#### fetchAll

Fetches a list of entities from the remote API.

```ts
fetchAll( params ): Promise<MultiEntityResponse<T>>
```

##### Parameters

| Name | Type | Description | Required | Default |
| ---- | ---- | ------ | ------ | ---- |
| params | [Params](#params) | Additional query parameters to send with the request to the remote API | no | `{}` |

##### Return

Returns a promise that resolves to a [response object](#multientityresponse) containing the fetched entities if the request to the API is successful.

#### delete

Deletes an existing entity in the remote API.

```ts
delete( id, params ): Promise<SingleEntityResponse<T>>
```

##### Parameters

| Name | Type | Description | Required | Default |
| ---- | ---- | ------ | ------ | ---- |
| id | [EntityID](#entityid) | The ID of the entity to delete | yes | - |
| params | [Params](#params)  | Additional query parameters to send with the request to the remote API | no | `{}` |

##### Return

Returns a promise that resolves to `null` if the request to the API is successful.


### JSONApiParser

A parser for JSON API responses. You can find more about the json api specification [here](https://jsonapi.org/).

#### constructor

Creates a new instance of the `JSONApiParser`.

```ts
constructor( { mappers } ): JSONApiParser
```

##### Parameters

The `JSONApiParse` `constructor` receives an hash parameter with the following properties:

| Name | Type | Description | Required | Default |
| ---- | ---- | ------ | ------ | ---- |
| mappers | [AttributesMappers](#attributesmappers) | An object defining how the entities attributes are going to be mapped for eacth entity `type` that can be returned in the api response. | yes | - |


##### Return

Returns a new instance of the `JSONApiParser`.

##### Example

```ts
// Attributes key to key mappers
const POST_MAPPER = {
	id: 'id',
	title: 'title',
	author_id: 'authorID',
	created_at: 'createdAt'
};

// Functional mapper, allows more flexibility
const USER_MAPPER = ( { id, first_name, last_name, address: { street, city_name } } ) => ( {
	id,
	firstName: first_name,
	lastName: last_name,
	address: new Address( {
		street,
		cityName: city_name
	} )
} );

const parser = new JSONApiParser( { post: POST_MAPPER, user: USER_MAPPER } );
```

#### parse

Parses the passed api response.

```ts
parse( responseToParse ): ParsedResponse
```

##### Parameters

| Name | Type | Description | Required | Default |
| ---- | ---- | ------ | ------ | ---- |
| responseToParse | [JSONApiResponse](#jsonapiresponse) | The response to parse. | yes | - |


##### Return

Returns the [parsed response](#parsedresponse).

##### Example

```ts
const response = {
	data: {
		id: 1,
		type: 'post',
		attributes: {
			title: 'Awesome Post',
			created_at: '02/10/2022 02:33 Z'
		},
		relationships: {
			author: {
				data: { id: 2 },
				type: 'user'
			}
		}
	},
	included: [
		{
			id: 2,
			type: 'user',
			attributes: {
				first_name: 'Homer',
				last_name: 'Simpson',
				address: {
					street: '742 Evergreen Terrace',
					city_name: 'Springfield'
				}
			}
		}
	]
};

const parser = new JSONApiParser( { post: POST_MAPPER, user: USER_MAPPER } );
const parsedResponse = parser.parse( response );
// {
// 	data: {
// 		type: 'post',
// 		attributes: {
// 			id: 1,
// 			title: 'Awesome Post',
// 			authorId: 2,
// 			createdAt: '02/10/2022 02:33 Z'
// 		}
// 	},
// 	included: [
// 		{
// 			type: 'user',
// 			attributes: {
// 				id: 2,
// 				firstName: 'Homer',
// 				lastName: 'Simpson',
// 				address: Address( {
// 					street: '742 Evergreen Terrace', cityName: 'Springfield'
// 				} )
// 			}
// 		}
// 	]
// }
```

### SchemaParser

A parser for REST API responses following a provided schema.

#### constructor

Creates a new instance of the `SchemaParser`.

```ts
constructor( { schema, dataKey, metaKey } ): SchemaParser
```

##### Parameters

The `SchemaParser` `constructor` receives an hash parameter with the following properties:

| Name | Type | Description | Required | Default |
| ---- | ---- | ------ | ------ | ---- |
| schema | [SchemaEntity](#schemaEntity) | A `SchemaEntity` instance with the schema for entity that will be parsed. | yes | - |
| dataKey | `string` | The key for the response data. | yes | - |
| metaKey | `string` | The key for the response metadata. | yes | - |

##### Return

Returns a new instance of the `SchemaParser`.

##### Example

```ts
const stateSchema = new SchemaEntity( {
	type: 'state',
	mapper: { id: 'id', name: 'name' }
} );

const citySchema = new SchemaEntity( {
	type: 'city',
	mapper: ( { id, name, state_id } ) => ( { id, name, stateId: state_id } ),
	relations: { state: stateSchema }
} );

const schema = new SchemaEntity( {
	type: 'user',
	mapper: {
		id: 'id',
		first_name: 'firstName',
		last_name: 'lastName',
		age: 'age',
		city_id: 'cityId',
		favorite_states_ids: 'favoriteStatesIds'
	},
	relations: {
		city: citySchema,
		favorite_states: stateSchema
	}
} );

const parser = new SchemaParser( { schema, dataKey: 'response', metaKey: 'meta' } );
```

#### parse

Parses the passed api response.

```ts
parse( responseToParse ): ParsedResponse
```

##### Parameters

| Name | Type | Description | Required | Default |
| ---- | ---- | ------ | ------ | ---- |
| responseToParse | [JSONData](#jsondata) | The response to parse. | yes | - |


##### Return

Returns the [parsed response](#parsedresponse).

##### Example

```ts
const response = {
	response: {
		id: '1',
		first_name: 'Homer',
		last_name: 'Simpson',
		age: 36,
		city: {
			id: 3,
			name: 'Springfield',
			state: {
				id: 8,
				name: 'Illinois'
			}
		},
		favorite_states: [
			{
				id: 7,
				name: 'Indiana'
			},
			{
				id: 8,
				name: 'Illinois'
			}
		]
	}
};

const parser = new SchemaParser( { schema, dataKey: 'response', metaKey: 'meta' } );
const parsedResponse = parser.parse( response );
// {
// 	data: {
// 		type: 'user',
// 		attributes: {
// 			id: 1,
// 			firstName: 'Homer',
// 			lastName: 'Simpson',
// 			age: 36,
// 			cityId: 3
// 		}
// 	},
// 	included: [
// 		{
// 			type: 'city',
// 			attributes: {
// 				id: 3,
// 				name: 'Springfield',
// 				stateId: 8
// 			}
// 		},
// 		{
// 			type: 'state',
// 			attributes: {
// 				id: 8,
// 				name: 'Illinois'
// 			}
// 		},
// 		{
// 			type: 'state',
// 			attributes: {
// 				id: 7,
// 				name: 'Indiana'
// 			}
// 		}
// 	]
// }
```

### SchemaEntity

Defines the data schema for a response entity.

#### constructor

Creates a new instance of the `SchemaEntity`.

```ts
constructor( { type, mapper, relations } ): SchemaEntity
```

##### Parameters

The `SchemaParser` `constructor` receives an hash parameter with the following properties:

| Name | Type | Description | Required | Default |
| ---- | ---- | ------ | ------ | ---- |
| type | [EntityType](#entitytype) | The type for this entity. This type will be used later by the creator to know in which store to create the entity. | yes | - |
| mapper| [AttributesMapper](#attributesmapper) | An object defining how attributes for this entity are going to be mapped. | yes | - |
| relations | [SchemaRelations](#schemarelations) | An object defining the scheme entity for the relations nested in the response. | no | {} |

##### Return

Returns a new instance of the `SchemaEntity`.

##### Example

```ts
const stateSchema = new SchemaEntity( {
	type: 'state',
	mapper: { id: 'id', name: 'name' }
} );

const citySchema = new SchemaEntity( {
	type: 'city',
	mapper: ( { id, name, state_id } ) => ( { id, name, stateId: state_id } ),
	relations: { state: stateSchema }
} );

const schema = new SchemaEntity( {
	type: 'user',
	mapper: {
		id: 'id',
		first_name: 'firstName',
		last_name: 'lastName',
		age: 'age',
		city_id: 'cityId',
		favorite_states_ids: 'favoriteStatesIds'
	},
	relations: {
		city: citySchema,
		favorite_states: stateSchema
	}
} );
```

#### map

Maps the attributes of the entity data using the passed mapper.

```ts
map( serialization ): Serialization
```

##### Parameters

| Name | Type | Description | Required | Default |
| ---- | ---- | ------ | ------ | ---- |
| serialization | [Serialization](#serialization) | The data to map. | yes | - |


##### Return

Returns the [mapped serialization](#serialization).

##### Example

```ts
const userData = {
	id: '1',
	first_name: 'Homer',
	last_name: 'Simpson',
	age: 36,
	cityId: 3
};

const mappedData = userSchemaEntity.map( userData );
// {
// 	id: 1,
// 	firstName: 'Homer',
// 	lastName: 'Simpson',
// 	age: 36,
// 	cityId: 3
// }
```

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
| rootStore | [IRootStpre](#irootstore) | The root store containing the entity stores where the entities are going to be created. | yes | - |

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
| parsedResponse | [ParsedResponse](#parsedresponse) | The parsed response returned by the parser. | yes | - |

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
		},
		{
			type: 'state',
			attributes: {
				id: 7,
				name: 'Indiana'
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


## Types

### IApi

```ts
interface IApi {
	request: ( config: ApiRequestConfig ) => ApiResponse
}
```

### IResponseParser

```ts
interface IResponseParser {
	parse( response: unknown ): ParsedResponse
}
```

### IEntityCreator

```ts
interface IEntityCreator {
	create<T>( parsedResponse: ParsedResponse ): ( null | T | T[] )
}
```

### ICustomPaths

```ts
interface ICustomPaths {
	create?: string
	list?: string
	update?: string
	delete?: string
}
```

### IErrorHandler

```ts
interface IErrorHandler {
	handleError( error: unknown ): unknown
}
```

### EntityID

```ts
type EntityID = number | string;
```

### Attributes

```ts
type Attributes = {
	[ key: string ]: JSONValue
}
```

### SerializableParam

```ts
type SerializableParam = string
	| number
	| SerializableParam[]
	| { [ key: string ]: SerializableParam }
```

### Params

```ts
type Params = {
	[ key: string ]: SerializableParam
}
```

### RequestWithBodyConfig

```ts
type RequestWithBodyConfig = {
	includesFiles?: boolean
}
```

### EntityResponse<Entity>

```ts
type EntityResponse<Entity> = {
	data: null | Entity | Entity[],
	meta: unknown
};
```

### SingleEntityResponse<Entity>

```ts
type SingleEntityResponse<Entity> = EntityResponse<Entity> & { data: Entity };
```

### MultiEntityResponse<Entity>

```ts
type MultiEntityResponse<Entity> = EntityResponse<Entity> & { data: Entity[] };
```

### Serialization

```ts
interface Serialization {
	[ key: string ]: unknown
}
```

### KeyToKeyAttributesMapper

```ts
interface KeyToKeyAttributesMapper {
	[ key: string ]: string;
}
```

### FunctionalAttributesMapper

```ts
type FunctionalAttributesMapper = (
	( serialization: Serialization ) => Serialization
);
```

### AttributesMapper

```ts
type AttributesMapper = KeyToKeyAttributesMapper | FunctionalAttributesMapper;
```

### AttributesMappers

```ts
interface AttributesMappers {
	[ key: string ]: AttributesMapper
}
```

### JSONApiAttributes

```ts
interface JSONApiAttributes {
	[ key: string ]: unknown;
}
```

### JSONApiRelationshipData

```ts
interface JSONApiRelationshipData {
	id: string;
	type: string;
}
```

### JSONApiRelationship

```ts
interface JSONApiRelationship {
	data: JSONApiRelationshipData;
}
```

### JSONApiRelationships

```ts
interface JSONApiRelationships {
	[ key: string ]: JSONApiRelationship;
}
```

### JSONApiData

```ts
interface JSONApiData {
	id: string;
	type: string;
	attributes: JSONApiAttributes;
	relationships: JSONApiRelationships;
}
```

### JSONApiResponse

```ts
interface JSONApiResponse {
	data: JSONApiData;
	included: JSONApiData[];
	meta?: JSONValue;
}
```

### EntityType

```ts
type EntityType = string;
```

### EntityAttributes

```ts
interface EntityAttributes {
	id: number;
	[ key: string ]: unknown;
}
```

### ParsedEntity

```ts
interface ParsedEntity {
	type: EntityType;
	attributes: EntityAttributes;
}
```

### ParsedResponse

```ts
interface ParsedResponse {
	data: ParsedEntity | ParsedEntity[];
	included: ParsedEntity[];
	meta: unknown;
}
```

### EntitySerialization

```ts
type EntitySerialization = { id: string, [ key: string ]: unknown };
```

### JSONData

```ts
type JSONData = EntitySerialization | (
	{ [ key: string ]: EntitySerialization | EntitySerialization[] | JSONData }
);
```

### SchemaRelations

```ts
type SchemaRelations = {
	[ key: string ]: SchemaEntity;
};
```

### IEntityStore

```ts
interface IEntityStore<T> {
	create( attributes: EntityAttributes ): T;
}
```

### IRootStore

```ts
interface IRootStore {
	getStore<T>( type: string ): IEntityStore<T>;
}
```
