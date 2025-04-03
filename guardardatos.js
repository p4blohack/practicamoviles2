const bcrypt = require('bcrypt');
const express = require('express');
const app = express();
app.use(express.json()); // Middleware para manejar JSON en las peticiones

// Supón que tienes una función que obtiene usuarios desde tu base de datos (en este caso simulado con un array)
async function getAllUsers() {
  // Aquí debes implementar la lógica para obtener todos los usuarios desde tu base de datos
  return []; // Este es un ejemplo vacío
}

// Función para actualizar la contraseña encriptada del usuario en la base de datos
async function updateUserPassword(identificacion, hashedPassword) {
  // Aquí debes implementar la lógica para actualizar la contraseña del usuario en tu base de datos
  // Asegúrate de actualizar la contraseña encriptada para el usuario correspondiente
  return; // Simulación de la actualización
}

// Ruta para actualizar contraseñas de usuarios ya registrados
app.post('/updatePasswords', async (req, res) => {
  try {
    const users = await getAllUsers();

    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'No hay usuarios registrados' });
    }

    // Recorrer todos los usuarios y encriptar sus contraseñas
    for (let user of users) {
      const hashedPassword = await bcrypt.hash(user.clave_original, 10); // Encriptamos la contraseña original
      await updateUserPassword(user.identificacion, hashedPassword); // Actualizamos la contraseña en la base de datos
    }

    res.json({
      success: true,
      message: 'Contraseñas de los usuarios actualizadas exitosamente'
    });

  } catch (error) {
    console.error('Error al actualizar contraseñas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta de Login
app.post('/login', async (req, res) => {
  try {
    const { identificacion, password } = req.body;

    // Buscar usuario
    const users = await getUserByIdentificacion(identificacion);

    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = users[0];

    // Verificar contraseña encriptada
    const isPasswordValid = await bcrypt.compare(password, user.clave_encriptada);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Eliminar campo sensible antes de responder
    const userData = { ...user };
    delete userData.clave_encriptada;

    res.json({
      success: true,
      user: userData,
      message: `Bienvenido ${user.nombre_usuario}`
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta de Registro
app.post('/register', async (req, res) => {
  try {
    const { identificacion, nombre, password, email, tipoUsuario } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await getUserByIdentificacion(identificacion);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10); // Hash de la contraseña con un salt de 10 rondas

    // Determinar tipo de usuario
    const userType = {
      normal: tipoUsuario === 'normal' ? 1 : 0,
      admin: tipoUsuario === 'admin' ? 1 : 0,
      superadmin: tipoUsuario === 'superadmin' ? 1 : 0
    };

    // Insertar nuevo usuario con contraseña encriptada
    const response = await fetch(`${SUPABASE_URL}/rest/v1/usuarios`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        identificacion,
        nombre_usuario: nombre,
        clave_encriptada: hashedPassword, // Guardar la contraseña encriptada
        email,
        usuario_normal: userType.normal,
        usuario_administrador: userType.admin,
        usuario_superadministrador: userType.superadmin
      })
    });

    const newUser = await response.json();

    res.json({
      success: true,
      user: newUser[0],
      message: 'Usuario registrado exitosamente'
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: error.message });
  }
});

// Inicia el servidor en el puerto 3000 (por ejemplo)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
