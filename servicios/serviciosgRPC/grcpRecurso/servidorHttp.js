const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();

// Carpeta uploads pública
const uploadsPath = path.resolve(__dirname, '/app/uploads');
console.log(' Sirviendo carpeta:', uploadsPath);
app.use('/uploads', express.static(uploadsPath));

// Iniciar servidor
const PORT = process.env.HTTP_PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor HTTP sirviendo archivos en http://localhost:${PORT}/uploads`);
});
