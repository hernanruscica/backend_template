import nodemailer from 'nodemailer';

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

// --- HELPER: PLANTILLA HTML MEJORADA ---
const getTemplate = ({ title, type, bodyContent, actionLink, btnText, footerYear }) => {
    
    // Configuración de Estilos según el tipo de correo
    let headerColor = '#2ecc71'; // Default: Verde
    let iconUrl = '';

    // Iconos (URLs públicas - idealmente alójalas en tu propio servidor)
    const icons = {
        alert: "https://cdn-icons-png.flaticon.com/512/564/564619.png", // Rojo
        check: "https://cdn-icons-png.flaticon.com/512/190/190411.png", // Verde
        security: "https://cdn-icons-png.flaticon.com/512/2919/2919600.png" // Candado/Escudo Azul
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

// --- FUNCIÓN DE ALARMAS (Actualizada con el nuevo template) ---
export const sendMessage = async (alarm, variables, email, token, isTriggered) => {    
    const baseURL = process.env.BASE_URL_FRONT;
    
    // Determinar tipo para la plantilla
    const templateType = isTriggered == 1 ? 'alarm_trigger' : 'alarm_reset';
    const titleText = isTriggered == 1 ? 'ALARMA DETECTADA' : 'ALARMA NORMALIZADA';
    
    // Asunto consistente para agrupación en Gmail
    const emailSubject = `[Alerta MDV] Monitor: ${alarm.name}`; 

    let bodySpecifics = '';
    // (Aquí va tu lógica switch de alarmas igual que antes, simplificada para el ejemplo)
    switch (alarm.alarm_type) {
        case "porcentage_on":
             bodySpecifics = `<p>El sensor registró un valor de <strong>${variables.value}</strong> fuera del rango permitido.</p>`;
            break;
        case "comunication_failure":
            bodySpecifics = `<p>Pérdida de comunicación detectada hace <strong>${variables.value} minutos</strong>.</p>`;
            break;
        case "simultaneous_on":
            bodySpecifics = `<p>Se detectaron ambos canales encendidos simultáneamente.</p>`;
            break;
        default:
            bodySpecifics = `<p>Evento registrado en el sensor.</p>`;
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

    // Enviar (Manejo de errores simplificado)
    try {
        const results = await transporter.sendMail(mailOptions);        
        return results.rejected.length === 0;
    } catch (error) {
        return false;
    }
}

// --- FUNCIÓN DE ACTIVACIÓN (NUEVO ESTILO) ---
export const sendActivation = async (token, userData) => {
    const baseURL = process.env.BASE_URL_FRONT;       
    const activationLink = `${baseURL}/panel/ubicaciones/${userData?.businesses_roles?.[0]?.uuid}/usuarios/activar/${token}`;
    
    // Contenido del cuerpo limpio y organizado
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
        type: 'security', // Usamos el modo azul
        bodyContent: bodyContent,
        actionLink: activationLink,
        btnText: 'ACTIVAR MI CUENTA', // Texto claro en el botón
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
            console.log('Correo de activación enviado!');
            return true;
        }
        return false;
    } catch (e) {
        console.log('Error enviando activación:', e);
        return false;
    }
}

export const testMessage = async (text, email) => {
    // Puedes mantener esta simple o usar el template también
    // ... tu código existente ...
    return true; 
}