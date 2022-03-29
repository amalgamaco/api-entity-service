import SchemaEntity from './helpers/SchemaEntity';
import { ParsedEntity } from '../types';
import ParsedEntitySet from './helpers/ParsedEntitySet';

export type EntitySerialization = { id: string, [ key: string ]: unknown };

export type JSONData = EntitySerialization | (
	{ [ key: string ]: EntitySerialization | EntitySerialization[] | JSONData }
);

export interface InitParameters {
	schema: SchemaEntity,
	dataKey: string
}

export interface ParsedItem {
	data: ParsedEntity,
	included: ParsedEntitySet
}

export interface ParsedItems {
	data: ParsedEntity[],
	included: ParsedEntitySet
}

export interface ParsedRelations {
	related: { [ key: string ]: number | number[] },
	included: ParsedEntitySet
}