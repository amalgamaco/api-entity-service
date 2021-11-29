import { EntityType } from '../../types';

interface AttributesMapper {
	[ key: string ]: string;
}

interface Serialization {
	[ key: string ]: unknown
}

type SchemaRelations = {
	// eslint-disable-next-line no-use-before-define
	[ key: string ]: SchemaEntity;
};

interface InitParameters {
	type: EntityType;
	mapper: AttributesMapper;
	relations: SchemaRelations;
}

export default class SchemaEntity {
	type: EntityType;
	mapper: AttributesMapper;
	relations: SchemaRelations;

	constructor( { type, mapper, relations = {} }: InitParameters ) {
		this.type = type;
		this.mapper = mapper;
		this.relations = relations;
	}

	map( serialization: Serialization ): Serialization {
		return Object
			.entries( this.mapper )
			.reduce(
				( result, [ serializationKey, entityKey ] ) => {
					result[ entityKey ] = serialization[ serializationKey ];
					return result;
				},
				<Serialization>{}
			);
	}
}
