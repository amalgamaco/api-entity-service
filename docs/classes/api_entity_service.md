# ApiEntityService

It is the main class of the package and provides an abstraction for an REST Api resource.

## Methods

- [constructor](#constructor)
- [create](#create)
- [update](#update)
- [fetch](#fetch)
- [fetchall](#fetchall)
- [delete](#delete)
- [request](#request)

### constructor

Creates a new instance of the `ApiEntityService` for the entity `T`.

```ts
constructor( { api, basePath, parser, creator, errorParser, paths } ): ApiEntityService<T>
```

#### Parameters

| Name | Type | Description | Required | Default |
| ---- | ---- | ------ | ------ | ---- |
| api | [IApi](../types.md#iapi) | The api client to use to connect with the remote API | yes | - |
| basePath | `string` | The base path for the resource without the leading and ending slash. | yes | - |
| parser | [IResponseParser](../types.md#iresponseparser) | An object in charge of parsing the API responses | yes | - |
| creator | [IEntityCreator](../types.md#ientitycreator) | An object in charge of creating the fetched entities in the correct stores  | yes | - |
| errorParser | [IErrorParser](../types.md#ierrorparser) | An object in charge of parsing the error responses | no |`NullErrorParser` |
| paths | [ICustomPaths](../types.md#icustompaths) | A hash indicating custom paths for the CRUD methods  | no | `{}` |

#### Return

Returns a new instance of the `ApiEntityService` that will:
- Use the `api` to make the requests to the remote REST API.
- Use the `parser` to parse the `api` responses before sending them to the `creator`.
- Use the `creator` to create the entities including in the parsed response in their corresponding entities stores.
- Use the `errorParser` to parse the `api` errors before throwing them.

### create

Creates a new entity in the remote API.

```ts
create( attributes, params, config ): Promise<SingleEntityResponse<T>>
```

#### Parameters

| Name | Type | Description | Required | Default |
| ---- | ---- | ------ | ------ | ---- |
| attributes | [Attributes](../types.md#attributes) | The attributes for the new entity to create | yes | - |
| params | [Params](../types.md#params) | Additional query parameters to send with the request to the remote API | no | `{}` |
| config | [RequestWithBodyConfig](../types.md#requestwithbodyconfig) | Additional configuration for the request to the remote API | no | `{}` |

#### Return

Returns a promise that resolves to a [response object](../types.md#singleentityresponse) containing the created entity if the request to the API is successful.

### update

Updates an existing entity in the remote API.

```ts
update( id, attributes, params, config ): Promise<SingleEntityResponse<T>>
```

#### Parameters

| Name | Type | Description | Required | Default |
| ---- | ---- | ------ | ------ | ---- |
| id | [EntityID](../types.md#entityid) | The ID of the entity to update | yes | - |
| attributes | [Attributes](../types.md#attributes) | The attributes to update | yes | - |
| params | [Params](../types.md#params) | Additional query parameters to send with the request to the remote API | no | `{}` |
| config | [RequestWithBodyConfig](../types.md#requestwithbodyconfig) | Additional configuration for the request to the remote API | no | `{}` |

#### Return

Returns a promise that resolves to a [response object](../types.md#singleentityresponse) containing the update entity if the request to the API is successful.

### fetch

Fetches an existing entity in the remote API.

```ts
fetch( id, params ): Promise<SingleEntityResponse<T>>
```

#### Parameters

| Name | Type | Description | Required | Default |
| ---- | ---- | ------ | ------ | ---- |
| id | [EntityID](../types.md#entity-id) | The ID of the entity to fetch | yes | - |
| params | [Params](../types.md#params) | Additional query parameters to send with the request to the remote API | no | `{}` |

#### Return

Returns a promise that resolves to a [response object](../types.md#singleentityresponse) containing the fetched entity if the request to the API is successful.

### fetchAll

Fetches a list of entities from the remote API.

```ts
fetchAll( params ): Promise<MultiEntityResponse<T>>
```

#### Parameters

| Name | Type | Description | Required | Default |
| ---- | ---- | ------ | ------ | ---- |
| params | [Params](../types.md#params) | Additional query parameters to send with the request to the remote API | no | `{}` |

#### Return

Returns a promise that resolves to a [response object](../types.md#multientityresponse) containing the fetched entities if the request to the API is successful.

### delete

Deletes an existing entity in the remote API.

```ts
delete( id, params ): Promise<SingleEntityResponse<T>>
```

#### Parameters

| Name | Type | Description | Required | Default |
| ---- | ---- | ------ | ------ | ---- |
| id | [EntityID](../types.md#entityid) | The ID of the entity to delete | yes | - |
| params | [Params](../types.md#params)  | Additional query parameters to send with the request to the remote API | no | `{}` |

#### Return

Returns a promise that resolves to `null` if the request to the API is successful.

### request
Makes a custom request to the remote API. It comes handy when you have to make a custom request that not respects the traditional CRUD methods.

```ts
request( { method, url, attributes, params, config } ): Promise<EntityResponse<T> | null>
```

#### Parameters

| Name | Type | Description | Required | Default |
| ---- | ---- | ------ | ------ | ---- |
| method | [HTTPMethod](../types.md#httpmethod) | The HTTP method to use in the request. | no | `HTTPMethod.GET` |
| url | `string` | The api path to call. Note that this method does not use the base path to make the request so if you want a URL relative to the base path you have to do it yourself and pass it here.  | no | `HTTPMethod.GET` |
| attributes | [Attributes](../types.md#attributes) | Attributes to send as the body of the request. | no | `null` |
| params | [Params](../types.md#params) | Query parameters to send with the request to the remote API. | no | `{}` |
| config | [RequestWithBodyConfig](../types.md#requestwithbodyconfig) | Additional configuration for the request to the remote API. | no | `{}` |

#### Return

Returns a promise that resolves to a [response object](../types.md#multientityresponse) containing the fetched entities if the request to the API is successful.