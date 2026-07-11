"""
main.py — API de contacto para Vlog Space
Autor: Gabriel Alejandro Rojas González

¿Qué hace este archivo?
Crea un servidor web pequeño con FastAPI que recibe
los datos del formulario de contacto y los envía
como email al correo del portafolio.

Flujo:
1. El formulario HTML hace una petición POST a /contacto
2. FastAPI valida que los datos estén completos
3. Python arma el email y lo envía via la API HTTPS de Resend
4. La API responde si fue exitoso o hubo error

Nota: este archivo usaba antes Gmail SMTP (aiosmtplib) para
enviar el correo. Railway bloquea las conexiones salientes por
los puertos SMTP (25, 465, 587, 2525) en los planes Free/Trial/
Hobby, así que el envío nunca llegaba a completarse (fallaba
tras 60s de timeout). Por eso ahora se usa la API de Resend
sobre HTTPS, que no depende de ningún puerto bloqueado.
"""

# ── IMPORTACIONES ────────────────────────────────────
# FastAPI: el framework para crear la API
from fastapi import FastAPI, HTTPException

# BaseModel: para definir la estructura de los datos
# que llegan del formulario
from pydantic import BaseModel, EmailStr

# CORSMiddleware: permite que tu página web (en otro dominio)
# pueda hablar con esta API sin que el navegador lo bloquee
from fastapi.middleware.cors import CORSMiddleware

# httpx: cliente HTTP asíncrono — lo usamos para llamar a la
# API de Resend por HTTPS en vez de hablar SMTP directamente
import httpx

# os y dotenv: para leer las credenciales del archivo .env
# sin escribirlas directamente en el código
import os
from dotenv import load_dotenv

# ── CARGAR VARIABLES DE ENTORNO ──────────────────────
# Lee el archivo .env y carga las variables en el sistema
# Si .env no existe, busca las variables directamente
# en el entorno del servidor (útil en Railway)
load_dotenv()

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
EMAIL_DESTINO  = os.getenv("EMAIL_DESTINO")
ALLOWED_ORIGIN = os.getenv("ALLOWED_ORIGIN", "*")

# ── CREAR LA APLICACIÓN FASTAPI ──────────────────────
# app es la instancia principal — todo gira alrededor de esto
app = FastAPI(
    title="Vlog Space — API de Contacto",
    description="API que procesa el formulario de contacto del portfolio",
    version="1.0.0"
)

# ── CONFIGURAR CORS ──────────────────────────────────
# CORS (Cross-Origin Resource Sharing) es una política
# de seguridad del navegador. Sin esto, cuando tu página
# intente hablar con la API, el navegador lo bloqueará.
# Aquí le decimos a la API quién tiene permiso de hablarle.
app.add_middleware(
    CORSMiddleware,
    # Solo tu página de GitHub Pages puede usar esta API
    allow_origins=[ALLOWED_ORIGIN],
    allow_methods=["POST"],   # Solo permitimos enviar datos
    allow_headers=["Content-Type"],
)

# ── MODELO DE DATOS DEL FORMULARIO ───────────────────
# Define exactamente qué campos espera recibir la API
# del formulario HTML. Si falta alguno, FastAPI
# automáticamente rechaza la petición con error 422.
class FormularioContacto(BaseModel):
    nombre:  str        # Nombre de quien escribe
    email:   EmailStr   # Email (validado automáticamente)
    mensaje: str        # Mensaje de contacto

# ── UTILIDAD — sanitizar texto para headers de email ─
# Un salto de línea dentro de un header (ej. el Subject)
# podría usarse para inyectar headers adicionales en el
# email (CRLF injection). Lo quitamos antes de usarlo.
def sanitizar_header(valor: str) -> str:
    return valor.replace("\r", "").replace("\n", "")

# ── RUTA RAÍZ — health check ─────────────────────────
# Ruta simple para verificar que la API está viva.
# Útil para Railway y para debuggear.
@app.get("/")
async def raiz():
    return {
        "estado": "activo",
        "mensaje": "API de contacto Vlog Space funcionando"
    }

# ── RUTA PRINCIPAL — recibir formulario ──────────────
# Esta es la ruta que llama el JavaScript del formulario.
# Recibe los datos, arma el email y lo envía vía Resend.
@app.post("/contacto")
async def recibir_contacto(datos: FormularioContacto):
    """
    Recibe nombre, email y mensaje del formulario,
    y los envía como email a Gabriel via la API de Resend.
    """

    # Verificar que las credenciales estén configuradas
    # Si no están, la API no puede enviar emails
    if not all([RESEND_API_KEY, EMAIL_DESTINO]):
        raise HTTPException(
            status_code=500,
            detail="Error de configuración: credenciales de email no encontradas"
        )

    # Sanitizar el nombre antes de usarlo en el Subject,
    # para que no pueda inyectar headers de email
    nombre_seguro = sanitizar_header(datos.nombre)

    # Cuerpo del email — lo que verás en tu bandeja de entrada
    cuerpo = f"""
Nuevo mensaje recibido desde tu portfolio:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nombre:  {datos.nombre}
Email:   {datos.email}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Mensaje:
{datos.mensaje}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Enviado desde garojas22.github.io/Vlog-space
    """

    # Intentar enviar el email via la API HTTPS de Resend
    # (reemplaza a Gmail SMTP, bloqueado en Railway Free/Trial/Hobby)
    try:
        async with httpx.AsyncClient() as client:
            respuesta = await client.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {RESEND_API_KEY}"},
                json={
                    "from": "Vlog Space <onboarding@resend.dev>",
                    "to": [EMAIL_DESTINO],
                    "reply_to": datos.email,
                    "subject": f"[Vlog Space] Nuevo mensaje de {nombre_seguro}",
                    "text": cuerpo,
                },
                timeout=10,  # segundos — falla rápido en vez de colgar la petición
            )
            respuesta.raise_for_status()

        # Si llegamos aquí, el email se envió correctamente
        return {
            "exito": True,
            "mensaje": f"Gracias {datos.nombre}, tu mensaje fue enviado."
        }

    except Exception as error:
        # Si algo falla al enviar, registramos el error
        # y avisamos al frontend sin exponer detalles internos
        print(f"Error al enviar email: {error}")
        raise HTTPException(
            status_code=500,
            detail="No se pudo enviar el mensaje. Intenta de nuevo."
        )
