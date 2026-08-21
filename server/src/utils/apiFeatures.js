class ApiFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    sort() {
        let sort = this.queryString.sort || "routeNumber";

        const allowedSortFields = [
            "name",
            "routeNumber",
            "createdAt",
        ];

        const sortField = sort.replace("-", "");

        if (!allowedSortFields.includes(sortField)) {
            sort = "routeNumber";
        }

        this.query = this.query.sort(sort);

        return this;
    }

    setPagination() {
        let page = Number(this.queryString.page) || 1;
        let limit = Number(this.queryString.limit) || 5;

        if (page < 1) {
            page = 1;
        }

        if (limit < 1) {
            limit = 5;
        }

        if (limit > 50) {
            limit = 50;
        }

        this.page = page;
        this.limit = limit;

        return this;
    }

    paginate(totalPages) {
        if (
            this.page > totalPages &&
            totalPages > 0
        ) {
            this.page = totalPages;
        }

        const skip =
            (this.page - 1) * this.limit;

        this.query = this.query
            .skip(skip)
            .limit(this.limit);

        return this;
    }
}

export default ApiFeatures;

// Hiểu nhanh đoạn này

// Ví dụ trong controller:

// BusRoute.find(filter)

// Đó chính là query.

// Còn:

// req.query

// Ví dụ:

// ?page=2&limit=5&sort=-name

// thì đó là queryString.