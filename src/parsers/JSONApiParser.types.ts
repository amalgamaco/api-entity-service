import { JSONValue } from '../types';
import { AttributesMapper } from './types';

export interface AttributesMappers {
	[ key: string ]: AttributesMapper
}

export interface JSONApiParserOptions {
	convertIDsToInt: boolean
}

export interface InitParameters {
	mappers: AttributesMappers;
	options?: JSONApiParserOptions;
}

export interface JSONApiAttributes {
	[ key: string ]: unknown;
}

export interface JSONApiRelationshipData {
	id: string;
	type: string;
}

export interface JSONApiRelationship {
	data: JSONApiRelationshipData;
}

export interface JSONApiRelationships {
	[ key: string ]: JSONApiRelationship;
}

export interface JSONApiData {
	id: string;
	type: string;
	attributes: JSONApiAttributes;
	relationships: JSONApiRelationships;
}

export interface JSONApiResponse {
	data: JSONApiData;
	included: JSONApiData[];
	meta?: JSONValue;
}
