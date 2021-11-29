import {
	EntityType, EntityAttributes, ParsedEntity, IEntityCreator
} from '../types';

interface EntityStore<T> {
	create( attributes: EntityAttributes ): T;
}

interface RootStore {
	getStore<T>( type: string ): EntityStore<T>;
}

interface InitParameters {
	rootStore: RootStore;
}

interface CreateParameters {
	data: ParsedEntity | ParsedEntity[];
	included?: ParsedEntity[];
}

export default class EntityCreator implements IEntityCreator {
	private rootStore: RootStore;

	constructor( { rootStore }: InitParameters ) {
		this.rootStore = rootStore;
	}

	create<T>( { data, included = [] }: CreateParameters ): ( T | null | T[] ) {
		included.forEach( this.createEntity.bind( this ) );

		return Array.isArray( data )
			? this.createEntities( data )
			: this.createEntity( data );
	}

	private createEntities<T>( data: ParsedEntity[] ): T[] {
		return data
			.map( item => this.createEntity( item ) )
			.filter( ( item ): item is T => !!item );
	}

	private createEntity<T>( { type, attributes }: ParsedEntity ): T | null {
		const store: EntityStore<T> = this.storeForType( type );
		if ( !store ) { return null; }

		return store.create( attributes );
	}

	private storeForType<T>( type: EntityType ): EntityStore<T> {
		return this.rootStore.getStore( type );
	}
}
