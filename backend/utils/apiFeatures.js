class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }
  search() {
    const keyword = this.queryStr.keyword
      ? {
          name: {
            $regex: this.queryStr.keyword,
            $options: 'i',
            // Small I means Case Insensitive
          },
        }
      : {};
    // console.log(keyword);

    this.query = this.query.find({ ...keyword });
    return this;
  }

  filter() {
    const queryCopy = { ...this.queryStr };
    // console.log(queryCopy);
    // Removing Some Fields for Category
    const removeFields = ['keyword', 'page', 'limit'];

    removeFields.forEach((key) => delete queryCopy[key]);
    // console.log(queryCopy);


    // Filter For Price And Rating 
    console.log(queryCopy);
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, key => `$${key}` );



    // this.query Means Product.find Method 

    this.query = this.query.find(JSON.parse(queryStr));
    console.log(queryStr);
    return this;
  }
  pagination(resultPerPage) {
    const currentPage = Number(this.queryStr.page)  || 1;
    const limit = this.queryStr.limit * 1 || 10;

    const skip = resultPerPage * (currentPage - 1) * limit;

    this.query = this.query.limit(resultPerPage).skip(skip);
    return this;
  }
}

module.exports = APIFeatures;
