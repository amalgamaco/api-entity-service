import {
	EntityAttributes, ParsedEntity
} from '../types';

export interface IEntityStore<T> {
	create( attributes: EntityAttributes ): T;
}

export interface IRootStore {
	getStore<T>( type: string ): IEntityStore<T>;
}

export interface InitParameters {
	rootStore: IRootStore;
}

export interface CreateParameters {
	data: ParsedEntity | ParsedEntity[];
	included?: ParsedEntity[];
}
