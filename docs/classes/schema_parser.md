# SchemaParser

A parser for REST API responses following a provided schema.

## constructor

Creates a new instance of the `SchemaParser`.

```ts
constructor( { schema, dataKey, metaKey } ): SchemaParser
```

### Parameters

The `SchemaParser` `constructor` receives an hash parameter with the following properties:

| Name | Type | Description | Required | Default |
| ---- | ---- | ------ | ------ | ---- |
| schema | [SchemaEntity](../types.md#schemaEntity) | A `SchemaEntity` instance with the schema for entity that will be parsed. | yes | - |
| dataKey | `string` | The key for the response data. | yes | - |
| metaKey | `string` | The key for the response metadata. | yes | - |

### Return

Returns a new instance of the `SchemaParser`.

### Example

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

## parse

Parses the passed api response.

```ts
parse( responseToParse ): ParsedResponse
```

### Parameters

| Name | Type | Description | Required | Default |
| ---- | ---- | ------ | ------ | ---- |
| responseToParse | [JSONData](../types.md#jsondata) | The response to parse. | yes | - |


### Return

Returns the [parsed response](../types.md#parsedresponse).

### Example

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

# SchemaEntity

Defines the data schema for a response entity.

## constructor

Creates a new instance of the `SchemaEntity`.

```ts
constructor( { type, mapper, relations } ): SchemaEntity
```

### Parameters

The `SchemaParser` `constructor` receives an hash parameter with the following properties:

| Name | Type | Description | Required | Default |
| ---- | ---- | ------ | ------ | ---- |
| type | [EntityType](../types.md#entitytype) | The type for this entity. This type will be used later by the creator to know in which store to create the entity. | yes | - |
| mapper| [AttributesMapper](../types.md#attributesmapper) | An object defining how attributes for this entity are going to be mapped. | yes | - |
| relations | [SchemaRelations](../types.md#schemarelations) | An object defining the scheme entity for the relations nested in the response. | no | {} |

### Return

Returns a new instance of the [SchemaEntity](#schemaentity).

### Example

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

## map

Maps the attributes of the entity data using the passed mapper.

```ts
map( serialization ): Serialization
```

### Parameters

| Name | Type | Description | Required | Default |
| ---- | ---- | ------ | ------ | ---- |
| serialization | [Serialization](../types.md#serialization) | The data to map. | yes | - |


### Return

Returns the [mapped serialization](../types.md#serialization).

### Example

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