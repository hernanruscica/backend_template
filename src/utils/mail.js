//import { subset } from 'mathjs';
import nodemailer from 'nodemailer';

// Configurar el servicio de correo electrónico
let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {                
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        // No rechazar certificados autofirmados
        rejectUnauthorized: false
    }
}); 

export const sendMessage = async (alarm, variables, email, token, isTriggered) => {
    //console.log('token en sendmessage:', token);
    let emailContent = null;
    const baseURL = process.env.BASE_URL_FRONT;
    switch (alarm.alarm_type) {
        case "porcentage_on":
            emailContent = `
                <div style="font-size: 1rem">
                    <h1 style="color: ${isTriggered == 1 ? 'red' : 'green'};">Alarma ${isTriggered == 1 ? 'disparada' : 'reseteada'}</h1>
                    <p >Se registro un cambio en la alarma <strong>'${alarm.name}</strong>.'</p>
                    <p>La condicion de disparo es <strong>${alarm.condition_show}</strong> y el valor registrado fue ${variables.value}</p>
                    <p>El periodo de tiempo para promediar es de\
                        ${alarm.time_range < 60 ? alarm.time_range + ' minutos.' : alarm.time_range / 60 + " horas"} para atras</p>
                    <a href='${baseURL}/panel/verestadoalarma/${token}' style="font-size: 1.5rem; color: white; background-color: green; padding: 10px;">Ver alarma</a>
                    <p style="color: DodgerBlue"><strong>MDV SRL</strong> 2026 ©</p>
                </div>
                `;            
        break;
        case "comunication_failure":
            emailContent = `
                <div style="font-size: 1rem">
                    <h1 style="color: ${isTriggered == 1 ? 'red' : 'green'};">Alarma ${isTriggered == 1 ? 'disparada' : 'reseteada'}</h1>
                    <p >Se registro un cambio en la alarma <strong>'${alarm.name}</strong>.'</p>
                    <p>Los últimos datos recibidos desde el datalogger fueron hace ${variables.value} minutos .</p>                    
                    <a href='${baseURL}/panel/verestadoalarma/${token}' style="font-size: 1.5rem; color: white; background-color: green; padding: 10px;">Ver alarma</a>
                    <p style="color: DodgerBlue"><strong>MDV SRL</strong> 2026 ©</p>
                </div>
                `;            
        break;
    
        default:
            break;
    } 
    

    let mailOptions = {
        from: 'info@mdvsrl.com.ar',
        to: email,
        subject: `Alarma ${alarm.triggered == 1 ? 'disparada' : 'reseteada'} - ${alarm.name} - MDV Sensores`,
        html: emailContent
        };  

    const results = await transporter.sendMail(mailOptions);        
        if (results.rejected.length == 0){
            //console.log('Correo enviado correctamente!');
            return true;
        }else{
            return false;
        }

}

export const sendActivation = async (token, userData) => {
    const baseURL = process.env.BASE_URL_FRONT;       
    const activationLink =`${baseURL}/panel/ubicaciones/${userData?.businesses_roles[0]?.uuid}/usuarios/activar/${token}`;
    let mailOptions = {
        from: 'info@mdvsrl.com.ar',
        to: userData.email,
        subject: 'Reseteo de contraseña - MDV Sensores',
        html: `
                <div style="font-size: 1rem">
                    <h1 style="color: green">Configuraciones de seguridad</h1>
                    <p>Hola ${userData?.first_name} ${userData?.last_name}, para poder empezar o seguir usando <strong>MDV Sensores</strong> debemos confirmar su correo electrónico y deberá resetear su contraseña</p>
                    <p>Estas acciones son requerida para verificar su correo electrónico y mantener la seguridad, ya que este mismo será en el cual le llegarán las alarmas de los sensores</p>
                    <h2>Pasos a seguir:</h2>
                    <ol>
                        <li>Click en este enlace: <a href=${activationLink} target="_blank">ACTIVAR</a></li>
                        <li>Definir una contraseña, de acuerdo a nuestras medidas de seguridad. </li>
                        <li>Ingresar a MDV Sensores, en este enlace: <a href='${baseURL}/inicio'  target="_blank">INGRESAR</a></li>
                    <ol>
                    <p style="color: DodgerBlue"><strong>MDV SRL</strong> 2025 ©</p>
                </div>
                `
        };  

        const results = await transporter.sendMail(mailOptions);        
        if (results.rejected.length == 0){
            console.log('Correo enviado correctamente!');
            return true;
        }else{
            console.log('Error al enviar el correo', results);
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

        const results = await transporter.sendMail(mailOptions);        
        if (results.rejected.length == 0){
            console.log('Correo enviado correctamente!');
            return true;
        }else{
            return false;
        }
}