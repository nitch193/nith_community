const mogoose = require("mongoose");
const config = require("config");

const connectToDb = async () => {
  try {
    await mogoose.connect(config.get("mongoURI"), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex:true,
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
module.exports = connectToDb;
