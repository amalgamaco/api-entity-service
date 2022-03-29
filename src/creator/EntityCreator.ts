import {
	EntityType, ParsedEntity, IEntityCreator
} from '../types';
import {
	InitParameters, CreateParameters,
	IRootStore, IEntityStore
} from './EntityCreator.types';

export default class EntityCreator implements IEntityCreator {
	private rootStore: IRootStore;

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
		const store: IEntityStore<T> = this.storeForType( type );
		if ( !store ) { return null; }

		return store.create( attributes );
	}

	private storeForType<T>( type: EntityType ): IEntityStore<T> {
		return this.rootStore.getStore( type );
	}
}
