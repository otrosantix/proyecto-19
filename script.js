const btnAdd = document.getElementById("btn-add");
const board = document.getElementById("board");
let carrilesGuardados = JSON.parse(localStorage.getItem("carriles")) || [];

btnAdd.addEventListener("click", () => {

    

    //el resultado del prompt se guarda en la variable 
    const subredditName = prompt("ingrese un numero del 1 al 10:");

    if (!subredditName || subredditName.trim() === "") {
        return; // Si el usuario cancela o ingresa un valor vacío, no hacemos nada


    }
    const cleanName = subredditName.trim();

    // Solo se aceptan los IDs 1 al 10; así no se guarda un carril que no existe
    if (!/^([1-9]|10)$/.test(cleanName)) {
        alert("Ingresa un número del 1 al 10.");
        return;
    }

if (carrilesGuardados.includes(cleanName)) {
    alert("Ese carril ya existe en el tablero.");
    return;
}

crearCarril(cleanName);


});
function crearCarril(nombre, guardar = true) {
    if (guardar) {
        carrilesGuardados.push(nombre);
        localStorage.setItem("carriles", JSON.stringify(carrilesGuardados));
    }

    const carril = document.createElement("div");
    carril.classList.add("lane");

    carril.innerHTML = `
        <div class="lane-header">
            <h2>/r/${nombre}</h2>
            <button class="btn-refresh">Actualizar</button>
            <button class="btn-delete">Eliminar</button>
        </div>
        <div class="lane-content">
            <p>Cargando publicaciones...</p>
        </div>
    `;

    board.appendChild(carril);

    const laneContent = carril.querySelector(".lane-content");
    const btnRefresh = carril.querySelector(".btn-refresh");
    const btnDelete = carril.querySelector(".btn-delete");

    btnRefresh.addEventListener("click", () => {
        laneContent.innerHTML = "<p>Cargando publicaciones...</p>";
        cargarPublicaciones(nombre, laneContent);
    });

    btnDelete.addEventListener("click", () => {
        carril.remove();
        carrilesGuardados = carrilesGuardados.filter(item => item !== nombre);
        localStorage.setItem("carriles", JSON.stringify(carrilesGuardados));
    });

    cargarPublicaciones(nombre, laneContent);
}

// Escapa el texto antes de usarlo dentro de innerHTML
function escaparHTML(texto) {
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

async function cargarPublicaciones(nombre, contenedorContenido) {
    try {
        const urlUsuario = `https://jsonplaceholder.typicode.com/users/${nombre}`;
        const urlPosts = `https://jsonplaceholder.typicode.com/users/${nombre}/posts`;

        // Se piden el usuario (autor) y sus publicaciones al mismo tiempo
        const [respuesta, respuestaPosts] = await Promise.all([fetch(urlUsuario), fetch(urlPosts)]);
        
        if (!respuesta.ok || !respuestaPosts.ok) {
            throw new Error("Registro no encontrado (ingresa un ID del 1 al 10)");
        }
        
        const datos = await respuesta.json();
        const posts = await respuestaPosts.json();
        
        contenedorContenido.innerHTML = `
            <div class="post-card" style="margin-bottom: 8px;">
                <h3>${escaparHTML(datos.name)} (@${escaparHTML(datos.username)})</h3>
                <p>email: ${escaparHTML(datos.email)}</p>
                <p>website: ${escaparHTML(datos.website)}</p>
            </div>
        ` + posts.map(post => `
            <div class="post-card" style="margin-bottom: 8px;">
                <h3>${escaparHTML(post.title)}</h3>
                <p>👤 ${escaparHTML(datos.name)}</p>
            </div>
        `).join("");
    } catch (error) {
        console.error("Error en carril:", error);
        contenedorContenido.innerHTML = `<p class="error">${escaparHTML(error.message)}</p>`;
    }
}

carrilesGuardados.forEach(nombre => crearCarril(nombre, false));