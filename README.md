# Quimbolitos - Aplicación Web

Una aplicación web para parejas que permite crear temas de conversación, compartir recuerdos y mantener viva la conexión emocional.

## Arquitectura

- **Backend**: Spring Boot con Java 21, MySQL, JWT Authentication
- **Frontend**: Angular 18 con TypeScript

## Requisitos Previos

- Java 21
- Node.js 18+
- MySQL Server
- Maven

## Configuración

### 1. Backend (Spring Boot)

1. Navega al directorio del backend:
   ```bash
   cd Back_quimbolito/quimbolito
   ```

2. Configura la base de datos en `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/quimbolitos?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
   spring.datasource.username=tu_usuario_mysql
   spring.datasource.password=tu_password_mysql
   ```

3. Ejecuta el backend:
   ```bash
   mvn spring-boot:run
   ```
   El backend estará disponible en `http://localhost:8081`

### 2. Frontend (Angular)

1. Navega al directorio del frontend:
   ```bash
   cd Client_Quimbolitos/Client_Quimbolitos
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Ejecuta el frontend:
   ```bash
   npm start
   ```
   El frontend estará disponible en `http://localhost:4200`

## Uso de la Aplicación

### Registro y Autenticación
1. Accede a `http://localhost:4200`
2. Regístrate con email y contraseña
3. Inicia sesión

### Gestión de Parejas
1. Después del login, crea una invitación de pareja
2. Comparte el código de invitación con tu pareja
3. La pareja debe aceptar la invitación para activar la relación

### Creación de Temas
1. Una vez tengas una pareja activa, puedes crear temas
2. Los temas sirven para organizar conversaciones y recuerdos
3. Cada tema puede tener subtemas y preguntas

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login de usuario

### Temas
- `GET /api/temas` - Obtener todos los temas
- `POST /api/temas` - Crear nuevo tema
- `GET /api/temas/{id}` - Obtener tema específico
- `PUT /api/temas/{id}` - Actualizar tema
- `DELETE /api/temas/{id}` - Eliminar tema

### Parejas
- `POST /api/parejas` - Crear invitación de pareja
- `GET /api/parejas/me` - Obtener mis parejas
- `POST /api/parejas/{id}/aceptar` - Aceptar invitación
- `POST /api/parejas/{id}/rechazar` - Rechazar invitación

## Tecnologías Utilizadas

### Backend
- Spring Boot 3.x
- Spring Security con JWT
- Spring Data JPA
- MySQL
- Maven

### Frontend
- Angular 18
- TypeScript
- RxJS
- Angular Router
- Angular Forms

## Desarrollo

### Estructura del Proyecto

```
Quimbolitos/
├── Back_quimbolito/          # Backend Spring Boot
│   └── quimbolito/
│       ├── src/main/java/com/example/quimbolitos/quimbolito/
│       │   ├── controller/   # Controladores REST
│       │   ├── service/      # Lógica de negocio
│       │   ├── entity/       # Entidades JPA
│       │   ├── dto/          # Objetos de transferencia
│       │   ├── security/     # Configuración de seguridad
│       │   └── exception/    # Manejo de excepciones
│       └── src/main/resources/
│           └── application.properties
└── Client_Quimbolitos/       # Frontend Angular
    └── Client_Quimbolitos/
        └── src/app/
            ├── service/      # Servicios Angular
            ├── guards/       # Guards de autenticación
            ├── interceptors/ # Interceptores HTTP
            └── components/   # Componentes
```

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT.