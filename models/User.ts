import mongoose, { Model } from 'mongoose';

export interface IUser {
  _id?: string;
  email: string;
  name: string;
  passwordHash: string;
  blendCode?: string;
  friends?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: [200, 'Email cannot be more than 200 characters'],
    },
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    blendCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    friends: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  {
    timestamps: true,
  }
);

function getModel(): Model<IUser> {
  if (mongoose.models && mongoose.models.User) {
    return mongoose.models.User as Model<IUser>;
  }
  try {
    return mongoose.model<IUser>('User');
  } catch {
    return mongoose.model<IUser>('User', userSchema);
  }
}

const User = getModel();

export default User;
