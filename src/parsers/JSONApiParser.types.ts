export interface AttributesMapper {
	[ key: string ]: string;
}

export interface AttributesMappers {
	[ key: string ]: AttributesMapper
}

export interface InitParameters {
	mappers: AttributesMappers;
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

export interface ParseParameters {
	data: JSONApiData;
	included: JSONApiData[]
}
