# Todo Application

A full-stack todo application built with Node.js, Express, MongoDB, and EJS templating. Features user authentication, CRUD operations for todos, and a clean, responsive interface.

## Features

- **User Authentication**: Secure registration and login system with JWT tokens
- **Password Security**: Bcrypt hashing for password protection
- **Todo Management**: Create, read, update, and delete todos
- **User-specific Todos**: Each user has their own private todo list
- **Responsive Design**: Clean and modern UI that works on all devices
- **Real-time Updates**: Dynamic todo management without page refreshes

## Tech Stack

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **Bcryptjs** - Password hashing

### Frontend

- **EJS** - Template engine
- **HTML5/CSS3** - Markup and styling
- **JavaScript** - Client-side functionality

### Development

- **Nodemon** - Development server with auto-restart
- **dotenv** - Environment variable management

## API Endpoints

### Authentication

- `POST /api/register` - Register a new user
- `POST /api/login` - User login

### Todos

- `GET /api/get-todos` - Get user's todos (authenticated)
- `POST /api/add-todo` - Create a new todo (authenticated)
- `PUT /api/update-todo/:id` - Update a todo (authenticated)
- `DELETE /api/delete-todo/:id` - Delete a todo (authenticated)

### Views

- `GET /` - Landing page
- `GET /login` - Login/Register page
- `GET /dashboard` - Todo dashboard (authenticated)

## Usage

1. **Registration**: Create a new account with a username and password
2. **Login**: Sign in with your credentials
3. **Dashboard**: View your personal todo list
4. **Add Todos**: Create new tasks using the input form
5. **Manage Todos**: Mark as complete, edit, or delete existing todos

## Security Features

- Passwords are hashed using bcrypt
- JWT tokens for secure authentication
- Input validation for credentials
- Protected routes requiring authentication
- User-specific data isolation

## Development

The application uses nodemon for development, which automatically restarts the server when files change. MongoDB must be running locally for the application to function.

To stop the development server, press `Ctrl+C` in the terminal.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
