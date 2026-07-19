const { authenticateUser, registerUser } = require('./db');

async function testAuth() {
  console.log('🧪 Iniciando pruebas de autenticación...\n');

  // Test 1: Autenticación demo exitosa
  console.log('📝 Test 1: Login con demo@example.com / 123456');
  const user1 = await authenticateUser('demo@example.com', '123456');
  console.log('Resultado:', user1 ? '✅ ÉXITO' : '❌ FALLO');
  console.log('Usuario:', user1);

  // Test 2: Autenticación demo fallida
  console.log('\n📝 Test 2: Login con contraseña incorrecta');
  const user2 = await authenticateUser('demo@example.com', 'wrongpassword');
  console.log('Resultado:', user2 ? '❌ FALLO (debería fallar)' : '✅ ÉXITO (falló correctamente)');

  // Test 3: Usuario inexistente
  console.log('\n📝 Test 3: Login con usuario inexistente');
  const user3 = await authenticateUser('notexist@example.com', '123456');
  console.log('Resultado:', user3 ? '❌ FALLO (debería fallar)' : '✅ ÉXITO (falló correctamente)');

  // Test 4: Registrar nuevo usuario
  console.log('\n📝 Test 4: Registrar nuevo usuario');
  const newUser = await registerUser('Nuevo Usuario', 'nuevo@example.com', 'password123');
  console.log('Resultado:', newUser && !newUser.error ? '✅ ÉXITO' : '❌ FALLO');
  console.log('Usuario:', newUser);

  // Test 5: Verificar que se puede logear el nuevo usuario
  console.log('\n📝 Test 5: Login con usuario recién registrado');
  const user5 = await authenticateUser('nuevo@example.com', 'password123');
  console.log('Resultado:', user5 ? '✅ ÉXITO' : '❌ FALLO');
  console.log('Usuario:', user5);

  console.log('\n✅ Pruebas completadas\n');
}

testAuth().catch(console.error);
