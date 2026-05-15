import nodemailer from 'nodemailer';
import logger from '../services/loggerService.js';

// Configuración del transporte
let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {                
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: { rejectUnauthorized: false }
}); 

// --- HELPER: FORMATEAR FECHA ---
// Convierte "2026-01-20 16:10:04" a "El martes 20 de Enero de 2026, a las 16:10"
const formatDate = (dateString) => {
    const date = dateString ? new Date(dateString) : new Date(); // Si no hay fecha, usa la actual
    
    // --- NUEVA LÍNEA: Restar 3 horas ---
    // Esto modifica el objeto 'date' y maneja automáticamente el cambio de día/mes/año si es necesario.
    date.setHours(date.getHours() - 3);
    // -----------------------------------

    // Arrays para nombres en español
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const dayName = days[date.getDay()];
    const dayNum = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `El ${dayName} ${dayNum} de ${monthName} de ${year}, a las ${hours}:${minutes}`;
};

// --- HELPER: PLANTILLA HTML MEJORADA ---
const getTemplate = ({ title, type, bodyContent, actionLink, btnText, footerYear }) => {
    
    // Configuración de Estilos según el tipo de correo
    let headerColor = '#2ecc71'; // Default: Verde
    let iconUrl = '';

    const icons = {
        alert: "https://cdn-icons-png.flaticon.com/512/564/564619.png", 
        check: "https://cdn-icons-png.flaticon.com/512/190/190411.png", 
        security: "https://cdn-icons-png.flaticon.com/512/2919/2919600.png" 
    };

    switch (type) {
        case 'alarm_trigger':
            headerColor = '#e74c3c'; // Rojo Alarma
            iconUrl = icons.alert;
            break;
        case 'alarm_reset':
            headerColor = '#2ecc71'; // Verde Ok
            iconUrl = icons.check;
            break;
        case 'security':
            headerColor = '#0056b3'; // Azul Corporativo MDV
            iconUrl = icons.security;
            break;
        default:
            headerColor = '#0056b3';
            iconUrl = icons.security;
    }

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f7; color: #51545e; }
            .container { width: 100%; max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { background-color: ${headerColor}; padding: 30px 20px; text-align: center; }
            .header h1 { margin: 10px 0 0; color: white; font-size: 22px; text-transform: uppercase; letter-spacing: 1px; }
            .content { padding: 40px 30px; line-height: 1.6; }
            .btn { display: inline-block; background-color: ${headerColor}; color: #ffffff !important; text-decoration: none; padding: 12px 30px; border-radius: 5px; font-weight: bold; margin-top: 20px; text-align: center; }
            .step-list { background-color: #f8f9fa; border-radius: 5px; padding: 20px 30px; margin: 20px 0; border: 1px solid #e1e1e1; }
            .step-list li { margin-bottom: 10px; padding-left: 5px; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #999; background-color: #f4f4f7; border-top: 1px solid #eaeaea; }
            .icon-img { width: 50px; height: 50px; vertical-align: middle; background-color: rgba(255,255,255,0.2); border-radius: 50%; padding: 10px; }
            .date-label { font-size: 14px; color: #888; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="${iconUrl}" alt="Icono" class="icon-img">
                <h1>${title}</h1>
            </div>
            
            <div class="content">
                ${bodyContent}
                
                <div style="text-align: center; margin-top: 30px;">
                    <a href="${actionLink}" class="btn" target="_blank">${btnText}</a>
                </div>
                
                <p style="font-size: 12px; margin-top: 30px; color: #999; text-align: center;">
                    Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                    <a href="${actionLink}" style="color: #0056b3;">${actionLink}</a>
                </p>
            </div>

            <div class="footer">
                <p><strong>MDV SRL</strong> - Tecnología Médica</p>
                <p>${footerYear} © Todos los derechos reservados.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// --- FUNCIÓN DE ALARMAS MODIFICADA ---
export const sendMessage = async (alarm, variables, email, token, isTriggered) => {    
    const baseURL = process.env.BASE_URL_FRONT;
    
    // Determinar tipo para la plantilla
    const templateType = isTriggered == 1 ? 'alarm_trigger' : 'alarm_reset';
    const titleText = isTriggered == 1 ? 'ALARMA DETECTADA' : 'ALARMA NORMALIZADA';
    
    // Asunto consistente
    const emailSubject = `[Alerta MDV] Monitor: ${alarm.name}`; 

    // Formatear la fecha (Usamos alarm.updated_at si existe, sino la actual)
    // Asumo que alarm.updated_at viene en el formato string que mencionaste o timestamp
    const dateString = formatDate(alarm.updated_at || new Date());

    let bodySpecifics = '';
    
    // Agregamos la fecha formateada al inicio de cada mensaje
    switch (alarm.alarm_type) {
        case "porcentage_on":
             bodySpecifics = `
                <div class="date-label">${dateString}</div>
                <p><strong>Ubicación:</strong> ${variables.location || 'N/A'}</p>
                <p><strong>Datalogger:</strong> ${variables.datalogger || 'N/A'}</p>
                <p><strong>Canal:</strong> ${variables.channel || 'N/A'}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;">
                <p>El sensor registró un valor de <strong>${variables.value}</strong> fuera del rango permitido.</p>
             `;
            break;
        case "comunication_failure":
            bodySpecifics = `
                <div class="date-label">${dateString}</div>
                <p><strong>Ubicación:</strong> ${variables.location || 'N/A'}</p>
                <p><strong>Datalogger:</strong> ${variables.datalogger || 'N/A'}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;">
                <p>Se detectaron <strong>${variables.value} minutos</strong> sin envío de datos al servidor.</p>
            `;
            break;
        case "simultaneous_on":
            bodySpecifics = `
                <div class="date-label">${dateString}</div>
                <p>Se detectaron ambos canales encendidos simultáneamente durante el monitoreo.</p>
            `;
            break;
        case "maintenance_alert":
            bodySpecifics = `
                <div class="date-label">${dateString}</div>
                <p><strong>Ubicación:</strong> ${variables.location || 'N/A'}</p>
                <p><strong>Datalogger:</strong> ${variables.datalogger || 'N/A'}</p>
                <p><strong>Canal:</strong> ${variables.channel || 'N/A'}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;">
                <p><strong>Título:</strong> ${variables.title || 'N/A'}</p>
                <p><strong>Descripción:</strong> ${variables.description || 'N/A'}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;">
                <p><strong>Fecha agendada:</strong> ${variables.scheduled_date ? formatDate(variables.scheduled_date) : 'N/A'}</p>
                <p><strong>Horas de uso actuales:</strong> ${variables.current_hours || 0} horas</p>
                <p><strong>Horas requeridas:</strong> ${variables.required_hours || 0} horas</p>
            `;
            break;
        default:
            bodySpecifics = `
                <div class="date-label">${dateString}</div>
                <p>Evento registrado en el sensor.</p>
            `;
    }

    const emailHtml = getTemplate({
        title: titleText,
        type: templateType,
        bodyContent: bodySpecifics,
        actionLink: `${baseURL}/panel/verestadoalarma/${token}`,
        btnText: 'VER ALARMA EN PANEL',
        footerYear: new Date().getFullYear()
    });

    let mailOptions = {
        from: '"MDV Alertas" <info@mdvsrl.com.ar>',
        to: email,
        subject: emailSubject,
        html: emailHtml
    };  

    try {
        const results = await transporter.sendMail(mailOptions);        
        return results.rejected.length === 0;
    } catch (error) {
        logger.error('system', `Error enviando notificación de alarma a ${email}`, {
            error: error.message,
            alarm_name: alarm?.name,
            email
        });
        return false;
    }
}

// ... (sendActivation y testMessage quedan igual, o puedes importarlas si están en otro lado)
export const sendActivation = async (token, userData) => {
    // ... Código anterior de sendActivation
    // Solo por brevedad no lo repito aquí si ya lo tienes, 
    // pero si copias y pegas todo el archivo asegúrate de incluirlo.
    const baseURL = process.env.BASE_URL_FRONT;       
    const activationLink = `${baseURL}/panel/ubicaciones/${userData?.businesses_roles?.[0]?.uuid}/usuarios/activar/${token}`;
    
    const bodyContent = `
        <h2 style="color: #333; margin-top: 0;">Hola, ${userData?.first_name} ${userData?.last_name}</h2>
        <p>Bienvenido a <strong>MDV Sensores</strong>. Para comenzar a monitorear sus equipos, necesitamos verificar su identidad y configurar su acceso seguro.</p>
        
        <div class="step-list">
            <strong>Pasos a seguir:</strong>
            <ol style="margin-top: 10px; padding-left: 20px;">
                <li>Haga clic en el botón de abajo para validar este correo.</li>
                <li>Defina una contraseña segura en la pantalla que se abrirá.</li>
                <li>Ingrese al panel con sus nuevas credenciales.</li>
            </ol>
        </div>
        
        <p>Esta medida es vital para asegurar que las alertas críticas lleguen a la persona correcta.</p>
    `;

    const emailHtml = getTemplate({
        title: 'ACTIVACIÓN DE CUENTA',
        type: 'security',
        bodyContent: bodyContent,
        actionLink: activationLink,
        btnText: 'ACTIVAR MI CUENTA',
        footerYear: new Date().getFullYear()
    });

    let mailOptions = {
        from: '"MDV Seguridad" <info@mdvsrl.com.ar>',
        to: userData.email,
        subject: 'Bienvenido a MDV - Active su cuenta',
        html: emailHtml
    };  

    try {
        const results = await transporter.sendMail(mailOptions);        
        if (results.rejected.length == 0){
            //console.log('Correo de activación enviado!');
            return true;
        }
        return false;
    } catch (error) {
        logger.error('system', `Error enviando activación a ${userData?.email}`, {
            error: error.message,
            email: userData?.email
        });
        return false;
    }
}

export const testMessage = async (text, email) => {
    let mailOptions = {
        from: 'info@mdvsrl.com.ar',
        to: email,
        subject: `testing hostinger with nodemailer`,
        html: text
    };  
    try {
        const results = await transporter.sendMail(mailOptions);        
        if (results.rejected.length == 0){
            return true;
        }
        return false;
    } catch (error) {
        logger.error('system', `Error en testMessage a ${email}`, {
            error: error.message,
            email
        });
        return false;
    }
}