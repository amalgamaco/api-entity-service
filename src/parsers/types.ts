export interface Serialization {
	[ key: string ]: unknown
}

export interface KeyToKeyAttributesMapper {
	[ key: string ]: string;
}

export type FunctionalAttributesMapper = (
	( serialization: Serialization ) => Serialization
);

export type AttributesMapper = KeyToKeyAttributesMapper | FunctionalAttributesMapper;
