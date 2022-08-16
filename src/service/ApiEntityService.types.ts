import {
	IEntityCreator, IErrorHandler, IResponseParser, JSONValue
} from '../types';

export type Attributes = {
	[ key: string ]: JSONValue
}

export type SerializableParam = string
	| number
	| SerializableParam[]
	| { [ key: string ]: SerializableParam }

export type Params = {
	[ key: string ]: SerializableParam
}

export type Headers = {
	[ key: string ]: string
}

export type ApiResponse = Promise<unknown>;

export type EntityResponse<Entity> = {
	data: null | Entity | Entity[],
	meta: unknown
};

export type SingleEntityResponse<Entity> = EntityResponse<Entity> & { data: Entity };

export type MultiEntityResponse<Entity> = EntityResponse<Entity> & { data: Entity[] };

export enum HTTPMethod {
	POST = 'post',
	PATCH = 'patch',
	PUT = 'put',
	GET = 'get',
	DELETE = 'delete'
}

export interface ApiRequestConfig {
	method: HTTPMethod,
	path: string,
	params?: Params,
	data?: JSONValue,
	sendAsFormData: boolean
}

export interface IApi {
	request: ( config: ApiRequestConfig ) => ApiResponse
}

export interface InitParameters {
	api: IApi,
	basePath: string,
	parser: IResponseParser,
	creator: IEntityCreator,
	paths?: { [ key: string ]: string },
	errorHandler?: IErrorHandler
}

export type RequestWithBodyConfig = {
	includesFiles?: boolean
}

export type RequestParameters = {
	method: HTTPMethod,
	url: string,
	attributes?: Attributes,
	params: Params,
	config: RequestWithBodyConfig
}

export type MakeRequestParameters = {
	method: HTTPMethod,
	url: string,
	attributes?: Attributes,
	params: Params,
	includesFiles?: boolean
}

export type EntityID = number | string;
