const bcrypt = require("bcrypt");

bcrypt.hash("tani@2005", 10).then((hash) => {
  console.log("HASHED PASSWORD:", hash);
});