# JSONApiParser

A parser for JSON API responses. You can find more about the json api specification [here](https://jsonapi.org/).

## constructor

Creates a new instance of the `JSONApiParser`.

```ts
constructor( { mappers } ): JSONApiParser
```

### Parameters

The `JSONApiParse` `constructor` receives an hash parameter with the following properties:

| Name | Type | Description | Required | Default |
| ---- | ---- | ------ | ------ | ---- |
| mappers | [AttributesMappers](../types.md#attributesmappers) | An object defining how the entities attributes are going to be mapped for eacth entity `type` that can be returned in the api response. | yes | - |
| options | [JSONApiParserOptions](../types.md#jsonapiparseroptions) | A configuration object for the parser. Options included are: <br /> - `convertIDsToInt`: If all ids should be parsed as integers or should be left as they are (needed for supporting ids that are not numbers) | no | ```{ convertIDsToInt: true }``` |


### Return

Returns a new instance of the `JSONApiParser`.

### Example

```ts
// Attributes key to key mappers
const POST_MAPPER = {
	id: 'id',
	title: 'title',
	author_id: 'authorId',
	tags_ids: 'tagsIds',
	created_at: 'createdAt'
};

const TAG_MAPPER = {
	id: 'id',
	label: 'label'
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

const parser = new JSONApiParser( { post: POST_MAPPER, tag: TAG_MAPPER, user: USER_MAPPER } );
```

## parse

Parses the passed api response.

```ts
parse( responseToParse ): ParsedResponse
```

### Parameters

| Name | Type | Description | Required | Default |
| ---- | ---- | ------ | ------ | ---- |
| responseToParse | [JSONApiResponse](../types.md#jsonapiresponse) | The response to parse. | yes | - |


### Return

Returns the [parsed response](../types.md#parsedresponse).

### Example

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
			},
			tags: [
				{
					data: { id: 3 },
					type: 'tag'
				},
				{
					data: { id: 4 },
					type: 'tag'
				}
			]
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
		},
		{
			id: 3,
			type: 'tag',
			attributes: {
				label: 'TV Show'
			}
		},
		{
			id: 4,
			type: 'tag',
			attributes: {
				label: 'Fun'
			}
		},
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
// 			tagsIds: [ 3, 4 ],
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
// 		},
// 		{
// 			type: 'tag',
// 			attributes: {
// 				id: 3,
// 				label: 'TV Show'
// 			}
// 		},
// 		{
// 			type: 'tag',
// 			attributes: {
// 				id: 4,
// 				label: 'Fun'
// 			}
// 		}
// 	]
// }
```