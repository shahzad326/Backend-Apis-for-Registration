const app = require('./app.js');
// const connectDB = require('./config/database.js');
const { connectDatabase } = require('./config/database.js');

connectDatabase();
// connectDB;

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});
