export default class EntitySet {
	constructor() {
		this.__data = {};
	}

	add( entity ) {
		this.__data[ this.__keyForEntity( entity ) ] = entity;
		return this;
	}

	merge( otherEntitySet ) {
		otherEntitySet.values().forEach(
			this.add.bind( this )
		);
		return this;
	}

	values() {
		return Object.values( this.__data );
	}

	// eslint-disable-next-line class-methods-use-this
	__keyForEntity( entity ) {
		return `${entity.type}-${entity.attributes.id}`;
	}
}
