class APIFeatures {
	constructor(query, queryString) {
		this.query = query;
		this.queryString = queryString;
	}

	filter() {
		// Filtering - exact matching
		const queryObj = { ...this.queryString };
		const excludedFields = ['page', 'sort', 'limit', 'fields'];
		excludedFields.forEach(el => delete queryObj[el]);

		// Advanced filtering - for greater and less than (gte and lte)
		let queryStr = JSON.stringify(queryObj);
		queryStr = queryStr.replace(/\b(gte|lte)\b/g, match => `$${match}`);

		// Find all using the built query
		this.query = this.query.find(JSON.parse(queryStr));

		return this;
	}

	sort() {
		if (this.queryString.sort) {
			this.query = this.query.sort(this.queryString.sort);
		} else {
			this.query = this.query.sort('date'); // Default sort (newest shifts first)
		}
		return this;
	}

	limitFields() {
		if (this.queryString.fields) {
			const fields = this.queryString.fields.split(',').join(' ');
			this.query = this.query.select(fields);
		} else {
			this.query = this.query.select('-__v'); // Exclude the __v field by default
		}

		return this;
	}

	paginate() {
		const page = this.queryString.page * 1 || 1; // Default page is 1
		const limit = this.queryString.limit * 1 || 8; // Limit 10 documents
		const skip = (page - 1) * limit; // (page - 1) is the previous page, so skip the results of the previous page

		this.query = this.query.skip(skip).limit(limit);

		return this;
	}
}

module.exports = APIFeatures;
