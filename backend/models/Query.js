import mongoose from 'mongoose';
import { getMongoConnectionStatus } from '../config/db.js';
import { readDb, writeDb } from '../utils/jsonDb.js';

const querySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved', 'closed'],
      default: 'open',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const MongooseQueryModel = mongoose.model('Query', querySchema);

const filterQueries = (list, filter) => {
  if (!list) return [];
  let result = list.filter((q) => !q.isDeleted);
  if (!filter) return result;

  if (filter.customerEmail) {
    result = result.filter((q) => q.customerEmail === filter.customerEmail);
  }
  if (filter.status) {
    result = result.filter((q) => q.status === filter.status);
  }
  if (filter.priority) {
    result = result.filter((q) => q.priority === filter.priority);
  }
  if (filter.$or) {
    result = result.filter((q) => {
      return filter.$or.some((cond) => {
        const [field, queryObj] = Object.entries(cond)[0];
        const val = q[field];
        if (!val) return false;
        if (queryObj instanceof RegExp) {
          return queryObj.test(val);
        }
        if (queryObj && typeof queryObj === 'object' && queryObj.$regex) {
          const regex = new RegExp(queryObj.$regex, queryObj.$options || 'i');
          return regex.test(val);
        }
        return val === queryObj;
      });
    });
  }

  return result;
};

class JSONQueryChain {
  constructor(results) {
    this.results = results;
  }

  sort(sortObj) {
    if (sortObj) {
      const [field, direction] = Object.entries(sortObj)[0];
      this.results.sort((a, b) => {
        const valA = new Date(a[field]).getTime() || a[field];
        const valB = new Date(b[field]).getTime() || b[field];
        const dir = direction === -1 || direction === 'desc' ? -1 : 1;
        if (valA < valB) return -1 * dir;
        if (valA > valB) return 1 * dir;
        return 0;
      });
    }
    return this;
  }

  skip(n) {
    this.results = this.results.slice(n);
    return this;
  }

  limit(n) {
    this.results = this.results.slice(0, n);
    return this;
  }

  then(resolve, reject) {
    resolve(this.results);
  }
}

class JSONQueryModel {
  static find(filter = {}) {
    const db = readDb();
    const list = filterQueries(db.queries, filter);
    return new JSONQueryChain(list);
  }

  static async countDocuments(filter = {}) {
    const db = readDb();
    const list = filterQueries(db.queries, filter);
    return list.length;
  }

  static async findById(id) {
    const db = readDb();
    const query = db.queries.find((q) => q._id === id);
    if (!query || query.isDeleted) return null;
    return query;
  }

  static async create(data) {
    const db = readDb();
    const newQuery = {
      _id: 'query_' + Date.now().toString(36),
      title: data.title,
      description: data.description,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      status: data.status || 'open',
      priority: data.priority || 'medium',
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.queries.push(newQuery);
    writeDb(db);
    return newQuery;
  }

  static async findByIdAndUpdate(id, updateData, options) {
    const db = readDb();
    const index = db.queries.findIndex((q) => q._id === id);
    if (index === -1 || db.queries[index].isDeleted) return null;
    const updated = {
      ...db.queries[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    db.queries[index] = updated;
    writeDb(db);
    return updated;
  }

  static async findByIdAndDelete(id) {
    const db = readDb();
    const index = db.queries.findIndex((q) => q._id === id);
    if (index === -1 || db.queries[index].isDeleted) return null;
    db.queries[index].isDeleted = true;
    db.queries[index].updatedAt = new Date().toISOString();
    writeDb(db);
    return db.queries[index];
  }

  static async aggregate(pipeline) {
    const db = readDb();
    const counts = { open: 0, 'in-progress': 0, resolved: 0, closed: 0 };
    db.queries.forEach((q) => {
      if (q.isDeleted) return;
      if (counts[q.status] !== undefined) {
        counts[q.status]++;
      } else {
        counts[q.status] = 1;
      }
    });
    return Object.entries(counts).map(([_id, count]) => ({ _id, count }));
  }
}

const QueryProxy = new Proxy(
  {},
  {
    get(target, prop) {
      const activeModel = getMongoConnectionStatus() ? MongooseQueryModel : JSONQueryModel;
      const val = activeModel[prop];
      if (typeof val === 'function') {
        return val.bind(activeModel);
      }
      return val;
    },
  }
);


export default QueryProxy;
