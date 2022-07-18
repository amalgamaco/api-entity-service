import { EntityType } from '../../types';
import { AttributesMapper, Serialization } from '../types';
import { mapAttributes } from './mappers';

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
		return mapAttributes( this.mapper, serialization );
	}
}
