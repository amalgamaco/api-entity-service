# Errors

## NotAllowedError
This error is thrown when the client is not allowed to perform an action.


### Properties

| Name | Type | Description |
| ---- | ---- | ------ |
| message | `string` | Human readable description of what caused the error. |

## EntityNotFoundError
This error is thrown when the entity you were trying to access was not found.

### Properties

| Name | Type | Description |
| ---- | ---- | ------ |
| message | `string` | Human readable description of what caused the error. |

## UnprocessableEntityError
This error is thrown when there was a problem processing changes for one or more entities, commonly due to one or more attributes not being valid.

### Properties

| Name | Type | Description |
| ---- | ---- | ------ |
| errors | [AttributesErrors](#attributeserrors) | A map of the attributes that are not valid. |

#### Example attribute errors
```ts
{
 	email: {
 		code: 'invalid.email_taken',
 		detail: 'Email taken'
 	},
 	content: {
 		code: 'invalid.blank',
 		detail: 'Can\'t be blank'
 	},
 	photo: {
 		url: {
 			code: 'invalid.invalid_format',
 			detail: 'URL format is not valid'
 		}
 	}
}
```

