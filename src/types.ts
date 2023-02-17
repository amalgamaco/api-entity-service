export type EntityID = number | string;
export type EntityType = string;

export interface EntityAttributes {
	id: EntityID;
	[ key: string ]: unknown;
}

export interface ParsedEntity {
	type: EntityType;
	attributes: EntityAttributes;
}

export interface ParsedResponse {
	data: ParsedEntity | ParsedEntity[];
	included: ParsedEntity[];
	meta: unknown;
}

export interface IResponseParser {
	parse( response: unknown ): ParsedResponse
}

export interface IEntityCreator {
	create<T>( parsedResponse: ParsedResponse ): ( null | T | T[] )
}

export interface IErrorParser {
	parse( error: unknown ): unknown
}

export type JSONValue =
	| string
	| number
	| boolean
	| null
	| { [ key: string ]: JSONValue }
	| Array<JSONValue>;
