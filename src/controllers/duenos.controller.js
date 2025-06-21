import Dueno from '../models/duenos.model.js';

// Traer todos los dueños
export const TraerDuenos = (req, res) => {
  Dueno.traer((err, duenos) => {
    if (err) {
      return res.status(500).json({ error: 'Error al traer los dueños', detalle: err });
    }
    res.status(200).json(duenos);
  });
};

// Crear un dueño
export const CrearDueno = (req, res) => {
  const datos = req.body;
  console.log('Datos recibidos:', datos);
  Dueno.crear(datos, (err, result) => {
    if (err) {
      console.error('Error específico al crear dueño:', err);
      return res.status(500).json({ error: 'Error al crear el dueño', detalle: err });
    }
    res.status(201).json({ mensaje: 'Dueño creado exitosamente', id: result.insertId });
  });
};

// Actualizar un dueño - SOLUCIÓN MEJORADA
export const ActualizarDueno = (req, res) => {
  const { rut } = req.params;
  const datos = req.body;

  // Validar que todos los campos requeridos estén presentes
  const camposRequeridos = ['nombre', 'apellido', 'email', 'password'];
  const camposFaltantes = camposRequeridos.filter(campo => !datos[campo]);
  
  if (camposFaltantes.length > 0) {
    return res.status(400).json({ 
      error: 'Faltan campos requeridos', 
      camposFaltantes 
    });
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(datos.email)) {
    return res.status(400).json({ 
      error: 'El formato del email no es válido' 
    });
  }

  // Validar teléfono si se proporciona
  if (datos.telefono && datos.telefono.trim()) {
    const phoneRegex = /^\d{8,12}$/;
    if (!phoneRegex.test(datos.telefono.replace(/\s/g, ''))) {
      return res.status(400).json({ 
        error: 'El teléfono debe contener entre 8 y 12 dígitos' 
      });
    }
  }

  // Validar contraseña solo si parece ser una nueva contraseña
  // (asumiendo que las contraseñas hasheadas o existentes son más largas)
  if (datos.password && datos.password.length < 6 && datos.password.length > 0) {
    // Si es una contraseña corta, validar longitud mínima
    return res.status(400).json({ 
      error: 'La contraseña debe tener al menos 6 caracteres' 
    });
  }

  Dueno.update(rut, datos, (err, result) => {
    if (err) {
      console.error('Error al actualizar dueño:', err);
      return res.status(500).json({ error: 'Error al actualizar el dueño', detalle: err });
    }
    
    // Verificar si se actualizó algún registro
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Dueño no encontrado' });
    }
    
    res.status(200).json({ mensaje: 'Dueño actualizado correctamente' });
  });
};

// Desactivar un dueño
export const DesactivarDueno = (req, res) => {
  const { rut } = req.params;

  Dueno.desactivar(rut, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error al desactivar el dueño', detalle: err });
    }
    res.status(200).json({ mensaje: 'Dueño desactivado' });
  });
};

// Activar un dueño

export const activarDueno = (req, res) => {
  const { rut } = req.params;

  Dueno.activar(rut, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error al activar al dueño', detalle: err });
    }
    res.status(200).json({ mensaje: 'Dueño activado exitosamente' });
  });
};


// Traer un dueño específico por rut
export const TraerDuenoPorRut = (req, res) => {
  const { rut } = req.params;

  Dueno.buscarDatosPorRut(rut, (err, dueno) => {
    if (err) {
      return res.status(500).json({ error: 'Error al buscar el dueño', detalle: err });
    }
    if (!dueno) {
      return res.status(404).json({ error: 'Dueño no encontrado' });
    }
    res.status(200).json(dueno);
  });


};

export const loginDueno = (req, res) => {
  const { rut, password } = req.body;
  Dueno.buscarPorRut(rut, (err, dueno) => {
    if (err) {
      return res.status(500).json({ error: 'Error en el servidor', detalle: err });
    }

    if (!dueno) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (dueno.password !== password) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    if (dueno.activo !== 1) {
      return res.status(403).json({ error: 'Usuario inactivo' });
    }

    // Traer todos los datos del dueño (nombre, apellido, email, etc)
    // Usar buscarDatosPorRut en vez de buscarPorRut
    Dueno.buscarDatosPorRut(rut, (err2, datosDueno) => {
      if (err2) {
        return res.status(500).json({ error: 'Error al obtener datos del dueño', detalle: err2 });
      }
      if (!datosDueno) {
        return res.status(404).json({ error: 'Datos del dueño no encontrados' });
      }
      res.status(200).json(datosDueno);
    });
  });
};


