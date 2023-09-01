const express = require('express');
const mysql = require('mysql');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const axios = require('axios'); // Importar el módulo 'axios'
const app = express();
const port = 3000;

// Configurar EJS como el motor de plantillas
app.set('view engine', 'ejs');
app.use('/styles', express.static(path.join(__dirname, 'css')));
app.use(express.json());


// Middleware para analizar los cuerpos de las solicitudes
app.use(bodyParser.urlencoded({ extended: false }));

// Configurar la conexión a la base de datos MySQL (asegúrate de llenar los datos correctos)
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nss'
});

// Conectar a la base de datos
connection.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Conectado a la base de datos MySQL');
});

// Ruta principal para el cliente, sirve el archivo index.ejs
app.get('/', (req, res) => {
    // Consulta SQL para obtener los nombres de proyectos
    const queryProyecto = 'SELECT nombre FROM proyecto';

    // Ejecutar las consultas
    connection.query(queryProyecto, (error, results) => {
        if (error) {
            console.error('Error al obtener los agentes:', error);
            // Manejar el error como desees
            return;
        }

            // Obtener los nombres de los proyectos
            const proyecto = results.map(row => row.nombre);
            

            // Renderizar la plantilla index.ejs y pasar los datos de agentes y centros de costo
            res.render('index', { proyecto: proyecto });
    });
});

app.get('/sitio', (req, res) => {
    res.render('sitio');
});

// Manejar el formulario para guardar latitud y longitud
app.post('/guardarSitio', (req, res) => {
    const nombre = req.body.nombre;
    const latitud = req.body.latitud;
    const longitud = req.body.longitud;
    const sistema = req.body.tipoSistema;
    // Crear una nueva Promesa para la consulta SQL
    const insertSql = `INSERT INTO proyecto (nombre, latitud, longitud, inversor, panel, bateria, genset, consumo, panelserie, panelparalelo, bateriaserie, bateriaparalelo, sistema, zonaHoraria) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    // Utilizar la función "new Promise" para crear una Promesa
    new Promise((resolve, reject) => {
        connection.query(insertSql, [nombre, latitud, longitud, "", "", "", "", "", "", "", "", "", sistema, ""], (err, result) => {
            if (err) {
                reject(err); // Rechazar la Promesa en caso de error
            } else {
                resolve(result); // Resolver la Promesa con el resultado de la consulta
            }
        });
    })
        .then(result => {
            console.log('Datos insertados en la base de datos');
            res.redirect('/'); // Redirigir al cliente nuevamente a la página principal
        })
        .catch(error => {
            console.error('Error al insertar datos en la base de datos:', error);
            // Manejar el error como desees
            // Por ejemplo, mostrar un mensaje de error en la página o redirigir a una página de error
        });
});

// Consulta a API
app.get('/obtenerRadiacion', (req, res) => {
    const lat = req.query.latitud;
    const long = req.query.longitud;
    console.log(lat);
    console.log(long);
    const raddatabase = "PVGIS-ERA5";
    const pvcalculation = "0";
    const angle = "0";
    const aspect = "0";
    const components = "1";
    const outputformat = "json";
    const url = `https://re.jrc.ec.europa.eu/api/v5_2/seriescalc?lat=${lat}&lon=${long}&raddatabase=${raddatabase}&startyear=2020&endyear=2020&pvcalculation=${pvcalculation}&angle=${angle}&aspect=${aspect}&components=${components}&outputformat=${outputformat}`;

    axios.get(url)
        .then(response => {
            // Obtener los datos relevantes de la respuesta de la API
            const data = response.data.outputs;
            //console.log(data);
            res.json(data);

        })
        .catch(error => {
            console.error("Error en la solicitud HTTP:", error);
            res.status(500).json({ error: 'Error en la solicitud HTTP' });
        });
});

// Ruta para eliminar un proyecto por su nombre
app.get('/eliminarProyecto', (req, res) => {
    const nombreProyecto = req.query.nombreProyecto; // Obtener el nombre del proyecto a eliminar

    // Consulta SQL para eliminar el proyecto por su nombre
    const deleteSql = 'DELETE FROM proyecto WHERE nombre = ?';

    // Consulta SQL para eliminar la tabla del proyecto
    const dropTableSql = `DROP TABLE IF EXISTS ${nombreProyecto}`;

    // Ejecutar la consulta de eliminación del proyecto
    connection.query(deleteSql, [nombreProyecto], (err, result) => {
        if (err) {
            console.error('Error al eliminar el proyecto:', err);
            // Manejar el error como desees
            // Por ejemplo, mostrar un mensaje de error en la página o enviar una respuesta con un código de error
            res.status(500).json({ error: 'Error al eliminar el proyecto' });
        } else {
            // Ejecutar la consulta de eliminación de la tabla del proyecto
            connection.query(dropTableSql, (err, result) => {
                if (err) {
                    console.error('Error al eliminar la tabla del proyecto:', err);
                    // Manejar el error como desees
                    // Por ejemplo, mostrar un mensaje de error en la página o enviar una respuesta con un código de error
                    res.status(500).json({ error: 'Error al eliminar la tabla del proyecto' });
                } else {
                    console.log('Proyecto eliminado:', nombreProyecto);
                    // Enviar una respuesta con un código de éxito (200) si se eliminó el proyecto y la tabla correctamente
                    res.status(200);
                    res.redirect('/');
                }
            });
        }
    });
});

// Importa datos de Irradiacion guardada en base de datos
app.get('/obtenerDatos', (req, res) => {
    const nombreProyecto = req.query.nombreProyecto;

    const queryData = `SELECT mes, Irr, Hsun, T2m, WS10m, generacion, almacenamiento, consumo, autoconsumo, venta, compra FROM ${nombreProyecto}`;

    connection.query(queryData, [nombreProyecto], (error, results) => {
        if (error) {
            console.error('Error al obtener los datos del proyecto:', error);
            res.status(500).json({ error: 'Error al obtener los datos del proyecto' });
        } else {
            if (results.length > 0) {
                //console.log(results);
                const data = results;
                const values = [];

                for (let i = 0; i < data.length; i++) {
                    const hourly = data[i];
                    values.push(hourly);
                }

                res.json(values);
            } else {
                res.status(404).json({ error: 'Proyecto no encontrado' });
            }
        }
    });
});

// Importa configuración del proyecto
app.get('/obtenerProyecto', (req, res) => {
    const nombreProyecto = req.query.nombreProyecto; // Obtener el nombre del proyecto seleccionado de los parámetros de la URL

    // Consulta SQL para obtener los datos del proyecto seleccionado por su nombre
    const queryProyecto = 'SELECT latitud, longitud, inversor, panel, bateria, genset, sistema FROM proyecto WHERE nombre = ?';
    

    // Ejecutar la consulta para obtener los datos del proyecto
    connection.query(queryProyecto, [nombreProyecto], (error, results) => {
        if (error) {
            console.error('Error al obtener los datos del proyecto:', error);
            // Manejar el error como desees
            // Por ejemplo, enviar una respuesta con un código de error
            res.status(500).json({ error: 'Error al obtener los datos del proyecto' });
        } else {
            // Si la consulta se ejecutó correctamente, devolver los datos del proyecto en formato JSON
            if (results.length > 0) {
                const proyectoData = results[0];
                res.json(proyectoData);
            } else {
                // Si no se encontró ningún proyecto con el nombre proporcionado, devolver un mensaje de error
                res.status(404).json({ error: 'Proyecto no encontrado' });
            }
        }
    });
});

// Ruta para almacenar los datos en una nueva tabla
app.post('/almacenarIrr', (req, res) => {
    const nombreTabla = req.query.nombre;
    const mes = req.body.mes;
    const Irr = req.body.Irr;
    const Hsun = req.body.Hsun;
    const T2m = req.body.T2m;
    const WS10m = req.body.WS10m;
    const generacion = req.body.generacion;
    const almacenamiento = req.body.almacenamiento;
    const consumo = req.body.consumo;
    const autoconsumo = req.body.autoconsumo;
    const venta = req.body.venta;
    const compra = req.body.compra;
    
    //console.log([mes, Irr, Hsun, T2m, WS10m]);

    // Crear una nueva tabla con el nombre proporcionado
    const createTableQuery = `CREATE TABLE IF NOT EXISTS ${nombreTabla} (id INT AUTO_INCREMENT PRIMARY KEY, mes VARCHAR(10), Irr VARCHAR(20), Hsun VARCHAR(20), T2m VARCHAR(20), WS10m VARCHAR(20), generacion FLOAT, almacenamiento FLOAT, consumo FLOAT, autoconsumo FLOAT, venta FLOAT, compra FLOAT)`;

    connection.query(createTableQuery, (err, result) => {
        if (err) {
            console.error('Error al crear la tabla:', err);
            res.status(500).send('Error al crear la tabla');
            return;
        }
        // Insertar los datos en la tabla
        const insertQuery = `INSERT INTO ${nombreTabla} (mes, Irr, Hsun, T2m, WS10m, generacion, almacenamiento, consumo, autoconsumo, venta, compra) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        connection.query(insertQuery, [mes, Irr, Hsun, T2m, WS10m, generacion, almacenamiento, consumo, autoconsumo, venta, compra], (err, result) => {
            if (err) {
                console.error('Error al insertar los datos:', err);
                res.status(500).send('Error al insertar los datos');
            } else {
                console.log('Datos almacenados correctamente');
                res.status(200).send('Datos almacenados correctamente');
            }
        });
    });
});


// Rutas para pagina de seleccion de modelo de inversor
app.get('/inversor', (req, res) => {
    // Consulta SQL para obtener los modelos
    const queryProyecto = 'SELECT modelo, potencia, maxpv, cantmppt, inputmppt, vmin, vmax, imppt, ioutput, ibat, eff FROM inversor';
    // Ejecutar las consultas
    connection.query(queryProyecto, (error, results) => {
        if (error) {
            console.error('Error al obtener los agentes:', error);
            // Manejar el error como desees
            return;
        }
            // Obtener los nombres de los inversores
            const modInv = results; 
            //console.log(modInv); 
            // Renderizar la plantilla inversor.ejs y pasar los modelos de inversores
            res.render('inversor', { modInv: modInv });
    });
});

app.post('/inversor', (req, res) => {
    const modelo = req.body.nombre;
    console.log(modelo);
    // Consulta SQL para obtener los modelos
    const insertQuery = 'UPDATE proyecto SET inversor = ?';
    // Ejecutar las consultas
    connection.query(insertQuery, modelo, (err, result) => {
        if (err) {
            console.error('Error al insertar los datos:', err);
            res.status(500).send('Error al insertar los datos');
        } else {
            console.log('Datos almacenados correctamente');
            res.status(200);
            res.redirect('/');
        }
    });
});

// Rutas para pagina de seleccion de modelo de panel
app.get('/panel', (req, res) => {
    // Consulta SQL para obtener los modelos
    const queryProyecto = 'SELECT modelo, potencia, voc, isc, coefv, coefi, eff, altura, ancho, espesor FROM panel';
    // Ejecutar las consultas
    connection.query(queryProyecto, (error, results) => {
        if (error) {
            console.error('Error al obtener los agentes:', error);
            // Manejar el error como desees
            return;
        }
            // Obtener los nombres de los inversores
            const modPanel = results; 
            //console.log(modInv); 
            // Renderizar la plantilla inversor.ejs y pasar los modelos de inversores
            res.render('panel', { modPanel: modPanel });
    });
});

app.post('/panel', (req, res) => {
    const modelo = req.body.nombre;
    console.log(modelo);
    // Consulta SQL para obtener los modelos
    const insertQuery = 'UPDATE proyecto SET panel = ?';
    // Ejecutar las consultas
    connection.query(insertQuery, modelo, (err, result) => {
        if (err) {
            console.error('Error al insertar los datos:', err);
            res.status(500).send('Error al insertar los datos');
        } else {
            console.log('Datos almacenados correctamente');
            res.status(200);
            res.redirect('/');
        }
    });
});

// Rutas para pagina de seleccion de modelo de bateria
app.get('/bateria', (req, res) => {
    // Consulta SQL para obtener los modelos
    const queryProyecto = 'SELECT modelo, tension, cap FROM bateria';
    // Ejecutar las consultas
    connection.query(queryProyecto, (error, results) => {
        if (error) {
            console.error('Error al obtener los agentes:', error);
            // Manejar el error como desees
            return;
        }
            // Obtener los nombres de los inversores
            const modBat = results; 
            //console.log(modInv); 
            // Renderizar la plantilla inversor.ejs y pasar los modelos de inversores
            res.render('bateria', { modBat: modBat });
    });
});

app.post('/bateria', (req, res) => {
    const modelo = req.body.nombre;
    console.log(modelo);
    // Consulta SQL para obtener los modelos
    const insertQuery = 'UPDATE proyecto SET bateria = ?';
    // Ejecutar las consultas
    connection.query(insertQuery, modelo, (err, result) => {
        if (err) {
            console.error('Error al insertar los datos:', err);
            res.status(500).send('Error al insertar los datos');
        } else {
            console.log('Datos almacenados correctamente');
            res.status(200);
            res.redirect('/');
        }
    });
});


// Ruta para la API RESTful (ejemplo)
app.get('/api/data', (req, res) => {
    // Puedes procesar aquí las solicitudes y respuestas de la API
    const data = {
        message: 'Hola desde la API RESTful',
        data: { example: 'Ejemplo de datos' }
    };
    res.json(data);
});

// Manejar el formulario para guardar latitud y longitud en la base de datos
app.post('/guardar', (req, res) => {
    const latitud = req.body.latitud;
    const longitud = req.body.longitud;

    // Ejemplo de consulta de inserción en la base de datos (modifica según tu esquema)
    const sql = `INSERT INTO coordenadas (latitud, longitud) VALUES ('${latitud}', '${longitud}')`;
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        console.log('Coordenadas guardadas en la base de datos');
    });

    res.redirect('/'); // Redirige al cliente nuevamente a la página principal
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});