type EntityType = string;
interface EntityAttributes {
	id: number;
	[ key: string ]: unknown;
}

interface EntityStore<T> {
	create( attributes: EntityAttributes ): T;
}

interface RootStore {
	getStore<T>( type: string ): EntityStore<T>;
}

interface EntityCreationParameters {
	type: EntityType;
	attributes: EntityAttributes;
}

interface InitParameters {
	rootStore: RootStore;
}

interface CreateParameters {
	data: EntityCreationParameters | EntityCreationParameters[];
	included?: EntityCreationParameters[];
}

export default class EntityCreator {
	private rootStore: RootStore;

	constructor( { rootStore }: InitParameters ) {
		this.rootStore = rootStore;
	}

	create<T>( { data, included = [] }: CreateParameters ) : ( T | null | T[] ) {
		included.forEach( this.createEntity.bind( this ) );

		return Array.isArray( data )
			? this.createEntities( data )
			: this.createEntity( data );
	}

	private createEntities<T>( data: EntityCreationParameters[] ): T[] {
		return data
			.map( item => this.createEntity( item ) )
			.filter( ( item ): item is T => !!item );
	}

	private createEntity<T>( { type, attributes }: EntityCreationParameters ): T | null {
		const store: EntityStore<T> = this.storeForType( type );
		if ( !store ) { return null; }

		return store.create( attributes );
	}

	private storeForType<T>( type: EntityType ): EntityStore<T> {
		return this.rootStore.getStore( type );
	}
}
