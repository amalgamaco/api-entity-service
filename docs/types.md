# Types

## IApi

```ts
interface IApi {
	request: ( config: ApiRequestConfig ) => ApiResponse
}
```

## IResponseParser

```ts
interface IResponseParser {
	parse( response: unknown ): ParsedResponse
}
```

## IEntityCreator

```ts
interface IEntityCreator {
	create<T>( parsedResponse: ParsedResponse ): ( null | T | T[] )
}
```

## ICustomPaths

```ts
interface ICustomPaths {
	create?: string
	list?: string
	update?: string
	delete?: string
}
```

## IErrorParser

```ts
interface IErrorParser {
	parse( error: unknown ): UnkownError | EntityNotFoundError | UnprocessableEntityError
}
```

## EntityID

```ts
type EntityID = number | string;
```

## Attributes

```ts
type Attributes = {
	[ key: string ]: JSONValue
}
```

## SerializableParam

```ts
type SerializableParam = string
	| number
	| SerializableParam[]
	| { [ key: string ]: SerializableParam }
```

## HTTPMethod

```ts
enum HTTPMethod {
	POST = 'post',
	PATCH = 'patch',
	PUT = 'put',
	GET = 'get',
	DELETE = 'delete'
}
```

## Params

```ts
type Params = {
	[ key: string ]: SerializableParam
}
```

## RequestWithBodyConfig

```ts
type RequestWithBodyConfig = {
	includesFiles?: boolean
}
```

## EntityResponse<Entity>

```ts
type EntityResponse<Entity> = {
	data: null | Entity | Entity[],
	meta: unknown
};
```

## SingleEntityResponse<Entity>

```ts
type SingleEntityResponse<Entity> = EntityResponse<Entity> & { data: Entity };
```

## MultiEntityResponse<Entity>

```ts
type MultiEntityResponse<Entity> = EntityResponse<Entity> & { data: Entity[] };
```

## Serialization

```ts
interface Serialization {
	[ key: string ]: unknown
}
```

## KeyToKeyAttributesMapper

```ts
interface KeyToKeyAttributesMapper {
	[ key: string ]: string;
}
```

## FunctionalAttributesMapper

```ts
type FunctionalAttributesMapper = (
	( serialization: Serialization ) => Serialization
);
```

## AttributesMapper

```ts
type AttributesMapper = KeyToKeyAttributesMapper | FunctionalAttributesMapper;
```

## AttributesMappers

```ts
interface AttributesMappers {
	[ key: string ]: AttributesMapper
}
```

## JSONApiAttributes

```ts
interface JSONApiAttributes {
	[ key: string ]: unknown;
}
```

## JSONApiRelationshipData

```ts
interface JSONApiRelationshipData {
	id: string;
	type: string;
}
```

## JSONApiRelationship

```ts
interface JSONApiRelationship {
	data: JSONApiRelationshipData;
}
```

## JSONApiRelationships

```ts
interface JSONApiRelationships {
	[ key: string ]: JSONApiRelationship;
}
```

## JSONApiData

```ts
interface JSONApiData {
	id: string;
	type: string;
	attributes: JSONApiAttributes;
	relationships: JSONApiRelationships;
}
```

## JSONApiResponse

```ts
interface JSONApiResponse {
	data: JSONApiData;
	included: JSONApiData[];
	meta?: JSONValue;
}
```

## EntityID

```ts
type EntityID = number | string
```

## EntityType

```ts
type EntityType = string;
```

## EntityAttributes

```ts
interface EntityAttributes {
	id: EntityID;
	[ key: string ]: unknown;
}
```

## ParsedEntity

```ts
interface ParsedEntity {
	type: EntityType;
	attributes: EntityAttributes;
}
```

## ParsedResponse

```ts
interface ParsedResponse {
	data: ParsedEntity | ParsedEntity[];
	included: ParsedEntity[];
	meta: unknown;
}
```

## EntitySerialization

```ts
type EntitySerialization = { id: string, [ key: string ]: unknown };
```

## JSONData

```ts
type JSONData = EntitySerialization | (
	{ [ key: string ]: EntitySerialization | EntitySerialization[] | JSONData }
);
```

## SchemaRelations

```ts
type SchemaRelations = {
	[ key: string ]: SchemaEntity;
};
```

## IEntityStore

```ts
interface IEntityStore<T> {
	create( attributes: EntityAttributes ): T;
}
```

## IRootStore

```ts
interface IRootStore {
	getStore<T>( type: string ): IEntityStore<T>;
}
```

## JSONApiParserOptions

```ts
interface JSONApiParserOptions {
	convertIDsToInt: boolean
}
```

## AttributeName

```ts
type AttributeName = string;
```

## AttributeError

```ts
type AttributeError = {
	code: string,
	detail: string
};
```
## AttributeErrorOrNestedErrors

```ts
type AttributeErrorOrNestedErrors = AttributeError | Record<AttributeName, AttributeError>;
```

## AttributesErrors
```ts
export type AttributesErrors = Record<AttributeName, AttributeErrorOrNestedErrors>;
```
