const { registerUser } = require('./db');

(async () => {
  const result = await registerUser('Usuario Nuevo', 'nuevousuario@example.com', '123456');
  console.log(JSON.stringify(result));
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
