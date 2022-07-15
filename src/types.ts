export type EntityType = string;

export interface EntityAttributes {
	id: number;
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
