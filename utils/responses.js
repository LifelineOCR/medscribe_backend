export const successResponse = (res, statusCode, message, data) => {
	res.status(statusCode).json({
		message: message || 'Success',
		data: data || null,
	});
}

export const errorResponse = (res, statusCode, message, error) => {
	res.status(statusCode).json({
		message: message || 'An error occurred',
		error: error || null,
	});
}