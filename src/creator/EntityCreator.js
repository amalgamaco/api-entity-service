export default class EntityCreator {
	constructor( { rootStore } ) {
		this.rootStore = rootStore;
	}

	create = ( { data, included = [] } = {} ) => {
		included.forEach( this.#createEntity );

		return Array.isArray( data )
			? data.map( item => this.#createEntity( item ) )
			: this.#createEntity( data );
	};

	#createEntity = ( { type, attributes } ) => {
		const store = this.#storeForType( type );
		if ( !store ) { return null; }

		return store.create( attributes );
	};

	#storeForType = type => (
		this.rootStore.getStore( type )
	);
}
