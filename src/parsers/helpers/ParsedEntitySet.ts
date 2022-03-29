import { ParsedEntity } from '../../types';

export default class ParsedEntitySet {
	private data: { [ key: string ]: ParsedEntity };

	constructor() {
		this.data = {};
	}

	add( entity: ParsedEntity ): ParsedEntitySet {
		this.data[ this.keyForEntity( entity ) ] = entity;
		return this;
	}

	merge( otherParsedEntitySet: ParsedEntitySet ): ParsedEntitySet {
		otherParsedEntitySet.values().forEach(
			this.add.bind( this )
		);
		return this;
	}

	values(): ParsedEntity[] {
		return Object.values( this.data );
	}

	// eslint-disable-next-line class-methods-use-this
	private keyForEntity( entity: ParsedEntity ): string {
		return `${entity.type}-${entity.attributes.id}`;
	}
}
