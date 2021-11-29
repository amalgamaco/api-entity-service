export type Attributes = {
	[ key: string ]: unknown
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

export interface Api {
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
