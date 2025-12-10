import bcrypt from "bcrypt";

const password = "lipo6494";
const saltRounds = 10;

bcrypt.hash(password, saltRounds, function (err, hash) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log("Hashed password:", hash);
  process.exit(0);
});
