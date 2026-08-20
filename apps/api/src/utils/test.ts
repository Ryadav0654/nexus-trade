// use bcrypt
async function hashPassword(password: string) {
  const bcryptHash = await Bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: 4, // number between 4-31
  });
  console.log("password: ", password);
  console.log("hash: ", bcryptHash);
}

hashPassword("secret");
