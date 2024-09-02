export default class ApiFeature {
  public query!: any;
  readonly queryString!: any;

  constructor(query: any, queryString: any) {
    this.query = query;
    this.queryString = queryString;
  }

  sort(order: number) {
    this.query = this.query.sort({
      createdAt: order,
    });
    return this;
  }

  search(fieldName: string) {
    function getFieldPairs(key: any, value: any) {
      var item: any = {};
      item[key] = {
        $regex: value,
      };
      return item;
    }

    const keyword = this.queryString.keyword;

    const field = getFieldPairs(fieldName, new RegExp(keyword, 'i'));

    this.query = this.query.find(field);

    return this;
  }

  filter() {
    const copyQueryStr = { ...this.queryString };
    const removeFileds = ['keyword', 'limit', 'page'];

    // advance filter for mathemetical filters
    let queryStr = JSON.stringify(copyQueryStr);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
    removeFileds.forEach((el: any) => delete copyQueryStr[el]);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  pagination(limit: number) {
    const currentPage: number = this.queryString.page || 1;
    const _limit: number = this.queryString.limit
      ? this.queryString.limit
      : limit;
    const skip: number = _limit * (currentPage - 1);
    this.query = this.query.limit(_limit).skip(skip);

    return this;
  }
}
