import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { getMongoConnectionStatus } from '../config/db.js';
import { readDb, writeDb } from '../utils/jsonDb.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'customer' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const MongooseUserModel = mongoose.model('User', userSchema);

class JSONUserModel {
  static async findOne({ email, username }) {
    // Return mock admin from env if matching
    if (username === process.env.ADMIN_USERNAME || email === 'admin@queryflow.com') {
      const adminUsername = process.env.ADMIN_USERNAME || 'admin';
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
      return {
        _id: 'admin_id',
        name: 'Staff Administrator',
        email: 'admin@queryflow.com',
        username: adminUsername,
        role: 'admin',
        password: hashedAdminPassword,
        comparePassword: async function (candidatePassword) {
          return candidatePassword === adminPassword || bcrypt.compare(candidatePassword, this.password);
        },
      };
    }

    const db = readDb();
    const user = db.users.find((u) => u.email === email || u.username === username);
    if (!user) return null;

    return {
      ...user,
      comparePassword: async function (candidatePassword) {
        return bcrypt.compare(candidatePassword, this.password);
      },
    };
  }

  static async findById(id) {
    if (id === 'admin_id') {
      return {
        _id: 'admin_id',
        name: 'Staff Administrator',
        email: 'admin@queryflow.com',
        role: 'admin',
        select: function () {
          return this;
        },
      };
    }

    const db = readDb();
    const user = db.users.find((u) => u._id === id);
    if (!user) return null;

    return {
      ...user,
      select: function () {
        return this;
      },
    };
  }

  static async create(data) {
    const db = readDb();
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newUser = {
      _id: 'user_' + Date.now().toString(36),
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role || 'customer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    writeDb(db);

    return {
      ...newUser,
      comparePassword: async function (candidatePassword) {
        return bcrypt.compare(candidatePassword, this.password);
      },
    };
  }
}

const UserProxy = new Proxy(
  {},
  {
    get(target, prop) {
      const activeModel = getMongoConnectionStatus() ? MongooseUserModel : JSONUserModel;
      const val = activeModel[prop];
      if (typeof val === 'function') {
        return val.bind(activeModel);
      }
      return val;
    },
  }
);


export default UserProxy;
