import { IEntityCreator, IResponseParser } from '../types';

export type Attributes = {
	[ key: string ]: unknown
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

export type ApiResponse = Promise<{ data: unknown }>;

export interface ApiMethodWithoutBody {
	( url: string ): ApiResponse
}

export interface ApiMethodWithBody {
	(
		url: string,
		body?: { [ key: string ]: unknown },
		config?: {
			headers?: Headers,
			transformRequest( data: Attributes, headers: Headers ): unknown
		}
	): ApiResponse
}

export interface IApi {
	get: ApiMethodWithoutBody,
	post: ApiMethodWithBody,
	patch: ApiMethodWithBody,
	put: ApiMethodWithBody,
	delete: ApiMethodWithoutBody
}

export enum HTTPMethod {
	POST = 'post',
	PATCH = 'patch',
	PUT = 'put',
	GET = 'get',
	DELETE = 'delete'
}

export interface InitParameters {
	api: IApi,
	basePath: string,
	parser: IResponseParser,
	creator: IEntityCreator,
	paths: { [ key: string ]: string }
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
