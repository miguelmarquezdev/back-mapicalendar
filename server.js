import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

// 🔴 🚀 Desactivar la verificación SSL en todo el entorno de Node.js
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const app = express();
app.use(express.json());

// 🔒 Lista de dominios permitidos
const allowedOrigins = [
  "https://machupicchutickets.net",
  "https://enjoyperu.org",
  "https://machupicchu-andean.com",
  "https://bigfootmachupicchu.com",
  "https://sapadventures.org",
  "https://lostinperu.com",
  "https://www.cusco-explore.com",
  "https://www.machupicchuviews.com",
  "https://www.nickey-travel.com",
   // Para pruebas locales, puedes eliminarlo en producción
];

// Configuración de CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Acceso no permitido por CORS"));
      }
    },
    credentials: true,
  })
);

// URLs de la API de Machu Picchu
const AUTH_URL = "https://api-tuboleto.cultura.pe/auth/user/login";
const API_URL = "https://api-tuboleto.cultura.pe/recaudador/venta/getConsultaCupos";

// Credenciales de autenticación (usar .env en producción)
const USERNAME = process.env.API_USERNAME;
const PASSWORD = process.env.API_PASSWORD;

// 🔐 Función para obtener el token de autenticación
async function getAuthToken() {
  try {
    const response = await axios.post(
      AUTH_URL,
      { username: USERNAME, password: PASSWORD },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    return response.data.body.access_token;
  } catch (error) {
    console.error("❌ Error obteniendo token:", error.response?.data || error.message);
    return null;
  }
}

// 📌 Endpoint para obtener disponibilidad de espacios en el Camino Inca
app.post("/api/availability", async (req, res) => {
  try {
    const { route = "7", year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.body;

    // Obtener token de autenticación
    const token = await getAuthToken();
    if (!token) {
      return res.status(500).json({ message: "Error al obtener el token de autenticación" });
    }

    // Construir URL de consulta con los parámetros
    const url = `${API_URL}?idRuta=${route}&anio=${year}&mes=${month}&idLugar=1`;

    // Hacer solicitud a la API de disponibilidad
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    res.json({ message: "✅ Datos obtenidos correctamente", data: response.data });
  } catch (error) {
    console.error("❌ Error obteniendo disponibilidad:", error.response?.data || error.message);
    res.status(500).json({ message: "Error obteniendo disponibilidad", error: error.message });
  }
});

// 🚀 Iniciar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🟢 Servidor corriendo en http://localhost:${PORT}`);
});
