const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SuperAdminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  tokens: [
    {
      token: {
        type: String,
      },
    },
  ],
});

//for hiding sensitive data like password and token from response send back to user
SuperAdminSchema.methods.toJSON = function () {
  const user = this;
  const userobj = user.toObject();

  delete userobj.password;
  delete userobj.token;

  return userobj;
};
//generating jwt token(authentication) for login/signup
SuperAdminSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, "secret");
  user.tokens = user.tokens.concat({ token });

  await user.save();
  return token;
};
//login user
SuperAdminSchema.statics.findBylogin = async (email, password) => {
  const user = await SuperAdmin.findOne({ email });
  if (!user) {
    throw new Error("user unable to login");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("unable to login");
  }
  return user;
};

//for converting plain pass to hashed one
SuperAdminSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

const SuperAdmin = mongoose.model("SuperAdmin", SuperAdminSchema);

module.exports = SuperAdmin;
