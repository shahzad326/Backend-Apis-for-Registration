const mongoose = require('mongoose');

exports.connectDatabase = () => {
  mongoose
    .connect(process.env.DB_URI)
    .then((con) => console.log(`Database connected: ${con.connection.host}`))
    .catch((err) => console.log(err));
};

// const mongoose = require('mongoose');

// const connectDB = () => {
//   mongoose
//     .connect(process.env.DB_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     })
//     .then((data) => {
//       console.log(`MongoDb Connected with Server: ${data.connection.host}`);
//     });
// };

// module.exports = connectDB;
