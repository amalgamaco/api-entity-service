export type JSONApiErrorItem = {
	status: number,
	title: string,
	code: string,
	detail: string,
	source: {
		pointer: string
	}
}

export type JSONApiError = {
	data: {
		errors?: JSONApiErrorItem[]
	},
	status: number
};
