import { bootstrap } from './bootstrap.js'

// Bootstrap the application and obtain the server URL.
const url = await bootstrap()

// Displays ASCII art representing the application's startup.
console.log(`__      ___ _    _ ___               
\\ \\    / (_) |__| |   \\ _ _ ___ _ __ 
 \\ \\/\\/ /| | / _\` | |) | '_/ _ \\ '_ \\
  \\_/\\_/ |_|_\\__,_|___/|_| \\___/ .__/
                               |_|`)

// Log the URL where the server is started.
console.log(`Server started at ${url}`)
