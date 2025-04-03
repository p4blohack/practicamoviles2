// Importamos las librerías necesarias
const express = require('express');
const fetch = require('node-fetch');

// Configuración
const app = express();
const PORT = 3000;

const SUPABASE_URL = 'https://flnyhuhbhkbbalwrouer.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsbnlodWhiaGtiYmFsd3JvdWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5NDA1ODEsImV4cCI6MjA1ODUxNjU4MX0.ZHfR3eBg6I0z4rHoewzdNl6G1307ovn_qAoxLFj4HhM';

// Middleware para permitir peticiones desde el frontend
app.use(express.json());
app.use(express.static('public'));

// Endpoint para obtener los datos de los usuarios
app.get('/get-users', async (req, res) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/usuarios?select=*`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const users = await response.json();
    res.json(users); // Enviar los datos al frontend
  } catch (error) {
    console.error('❌ Error al obtener los usuarios:', error.message);
    res.status(500).json({ error: 'Error al obtener los datos de usuarios' });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
