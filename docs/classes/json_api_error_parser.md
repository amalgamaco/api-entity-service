# JSONApiErrorParser

Parses error responses in JSON Api format.

## constructor

Creates a new instance of the `JSONApiErrorParser`.

```ts
constructor(): JSONApiErrorParser
```

### Return

Returns a new instance of the `JSONApiErrorParser`.

### Example

```ts
import { JSONApiErrorParser, ApiEntityService, ... } from '@amalgama/api-entity-service';

const errorParser = new JSONApiErrorParser();

const service = new ApiEntityService( {
	...,
	errorParser
} );
```

## parse

Parses a JSON Api format response error. If the passed error can't be parsed then that same error is returned.

```ts
parse( error: unkown ): NotAllowedError | EntityNotFoundError | UnprocessableEntityError | unkonwn
```

### Parameters

| Name | Type | Description | Required | Default |
| ---- | ---- | ------ | ------ | ---- |
| error | `unkown` | The error received from the api. | yes | - |


### Return

Returns the parsed error.

### Example

```ts
const errorParser = new JSONApiErrorParser();

// Not found error
const notFoundErrorResponse = new FailedApiResponseError( status: 404, data: {
	'errors': [
		{
			'title': 'Not Found Error',
			'code': 'not_found',
			'detail': "Couldn't find User with 'id'=133",
			'source': {
				'pointer': '/User/id'
			}
		}
	]
} );

const parsedError = errorParser.parse( notFoundErrorResponse );
console.log( parsedError );
// EntityNotFoundError: Couldn't find User with 'id'=133

//Unprocessable error
const unprocessableErrorResponse = new FailedApiResponseError( status: 422, data: {
	'errors': [
		{
			'status': 422,
			'title': 'Unprocessable entity',
			'detail': 'Email taken',
			'code': 'invalid.email_taken',
			'source': {
				'pointer': '/email'
			}
		},
		{
			'status': 422,
			'title': 'Unprocessable entity',
			'code': 'invalid.blank',
			'detail': 'Can\'t be blank',
			'source': {
				'pointer': '/content'
			}
		},
		{
			'status': 422,
			'title': 'Unprocessable entity',
			'code': 'invalid.invalid_format',
			'detail': 'URL format is not valid',
			'source': {
				'pointer': '/photo/url'
			}
		}
	]
} );

const parsedError = errorParser.parse( unprocessableErrorResponse );
console.log( parsedError );
// UnprocessableEntityError: There was an error trying to process the entity
console.log( parsedError.errors );
// {
//  	email: {
//  		code: 'invalid.email_taken',
//  		detail: 'Email taken'
//  	},
//  	content: {
//  		code: 'invalid.blank',
//  		detail: 'Can\'t be blank'
//  	},
//  	photo: {
//  		url: {
//  			code: 'invalid.invalid_format',
//  			detail: 'URL format is not valid'
//  		}
//  	}
// }
```