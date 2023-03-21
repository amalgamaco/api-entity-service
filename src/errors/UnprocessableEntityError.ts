export type AttributeName = string;
export type AttributeError = {
	code: string,
	detail: string
};

export type AttributeErrorOrNestedErrors = AttributeError | Record<AttributeName, AttributeError>;

export type AttributesErrors = Record<AttributeName, AttributeErrorOrNestedErrors>;

export default class UnprocessableEntityError extends Error {
	errors: AttributesErrors;

	constructor( errors: AttributesErrors ) {
		super( 'There was an error trying to process the entity' );

		this.name = 'UnprocessableEntityError';
		this.errors = errors;
	}
}
