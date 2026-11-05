(function () {
  'use strict';

  const LAYOUT_CLAVE_TEMA = 'sazon-tema';
  const LAYOUT_TEMAS_VALIDOS = ['dia', 'noche'];
  const LAYOUT_TEMA_POR_DEFECTO = 'dia';
  const LAYOUT_TECLA_CERRAR = 'Escape';
  const LAYOUT_MODULOS = [
    { clave: 'inicio', nombre: 'Inicio', icono: 'bi-house', ruta: 'index.html', codigo: '' },
    { clave: 'catalogo', nombre: 'Catálogo', icono: 'bi-tag', ruta: 'catalogo/', codigo: 'G1' },
    { clave: 'recetario', nombre: 'Recetario', icono: 'bi-journal-bookmark', ruta: 'recetario/', codigo: 'G2' },
    { clave: 'despensa', nombre: 'Mi despensa', icono: 'bi-box-seam', ruta: 'despensa/', codigo: 'G3' },
    { clave: 'nutricion', nombre: 'Nutrición', icono: 'bi-heart-pulse', ruta: 'nutricion/nutricion.html', codigo: 'G4' },
    { clave: 'planificador', nombre: 'Planificador', icono: 'bi-calendar-week', ruta: 'planificador/', codigo: 'G5' },
    { clave: 'comunidad', nombre: 'Comunidad', icono: 'bi-chat-dots', ruta: 'comunidad/', codigo: 'G6' },
    { clave: 'mercadeo', nombre: 'Mercadeo', icono: 'bi-gift', ruta: 'mercadeo/', codigo: 'G7' }
  ];

  // ---------- Tema día/noche ----------

  function leerTemaGuardado() {
    try {
      const tema = localStorage.getItem(LAYOUT_CLAVE_TEMA);
      return LAYOUT_TEMAS_VALIDOS.includes(tema) ? tema : LAYOUT_TEMA_POR_DEFECTO;
    } catch (error) {
      console.error('No se pudo leer el tema guardado:', error);
      return LAYOUT_TEMA_POR_DEFECTO;
    }
  }

  function guardarTema(tema) {
    try {
      localStorage.setItem(LAYOUT_CLAVE_TEMA, tema);
    } catch (error) {
      console.error('No se pudo guardar el tema:', error);
    }
  }

  function aplicarTema(tema, interruptor) {
    document.documentElement.dataset.tema = tema;
    if (interruptor) interruptor.setAttribute('aria-checked', String(tema === 'noche'));
  }

  // ---------- Construcción del marco (solo textos fijos, nunca datos del usuario) ----------

  function crearDesdePlantilla(html) {
    const plantilla = document.createElement('template');
    plantilla.innerHTML = html.trim();
    return plantilla.content;
  }

  function crearHeader(raiz) {
    return crearDesdePlantilla(`
      <header class="sazon-header">
        <button type="button" class="sazon-boton-icono" id="sazon-boton-menu" aria-label="Abrir menú de módulos" aria-expanded="false" aria-controls="sazon-menu">
          <i class="bi bi-list" aria-hidden="true"></i>
        </button>
        <a class="sazon-marca" href="${raiz}index.html" aria-label="Sazón, ir al inicio">
          <img src="${raiz}assets/img/logo-sazon.svg" width="36" height="36" alt="">
          <span class="sazon-marca-texto">
            <span class="sazon-marca-nombre">Sazón</span>
            <span class="sazon-marca-lema">NUTRESA DIGITAL</span>
          </span>
        </a>
        <form class="sazon-buscador" role="search">
          <i class="bi bi-search" aria-hidden="true"></i>
          <label for="sazon-buscar-global" class="sazon-solo-lector">Buscar en Sazón</label>
          <input id="sazon-buscar-global" name="q" type="search" placeholder="Buscar recetas, productos o ingredientes…">
        </form>
        <div class="sazon-header-acciones">
          <button type="button" class="sazon-boton-icono" id="sazon-boton-notificaciones" aria-label="Notificaciones" aria-expanded="false" aria-controls="sazon-panel-notificaciones">
            <i class="bi bi-bell" aria-hidden="true"></i>
          </button>
          <button type="button" class="sazon-boton sazon-boton-secundario" aria-label="Perfil de usuario">
            <span class="sazon-perfil-avatar"><i class="bi bi-person-circle" aria-hidden="true"></i></span>
            <span class="sazon-texto-boton">[Nombre de usuario] <i class="bi bi-chevron-down" aria-hidden="true"></i></span>
          </button>
        </div>
        <section class="sazon-panel-notificaciones" id="sazon-panel-notificaciones" aria-label="Notificaciones" hidden>
          <h2>Notificaciones</h2>
          <div class="sazon-alerta sazon-alerta-info" role="status">
            <i class="bi bi-info-circle-fill" aria-hidden="true"></i>
            <p class="sazon-alerta-cuerpo">No tienes notificaciones nuevas.</p>
          </div>
        </section>
      </header>`);
  }

  function crearEnlaceModulo(modulo, raiz, moduloActivo) {
    const actual = modulo.clave === moduloActivo ? ' aria-current="page"' : '';
    const codigo = modulo.codigo
      ? `<span class="sazon-codigo-celula sazon-celula-${modulo.codigo.toLowerCase()}">${modulo.codigo}</span>`
      : '';
    return `
      <li>
        <a class="sazon-menu-enlace" href="${raiz}${modulo.ruta}"${actual}>
          <i class="bi ${modulo.icono}" aria-hidden="true"></i>
          <span class="sazon-menu-nombre">${modulo.nombre}</span>
          ${codigo}
        </a>
      </li>`;
  }

  function crearMenu(raiz, moduloActivo) {
    const enlaces = LAYOUT_MODULOS.map((modulo) => crearEnlaceModulo(modulo, raiz, moduloActivo)).join('');
    return crearDesdePlantilla(`
      <button type="button" class="sazon-menu-fondo" id="sazon-menu-fondo" aria-label="Cerrar menú" tabindex="-1" hidden></button>
      <aside class="sazon-menu" id="sazon-menu" aria-label="Navegación por módulos" hidden>
        <div class="sazon-menu-cabecera">
          <span class="sazon-menu-titulo">Módulos</span>
          <button type="button" class="sazon-boton-icono" id="sazon-boton-cerrar-menu" aria-label="Cerrar menú">
            <i class="bi bi-x-lg" aria-hidden="true"></i>
          </button>
        </div>
        <nav aria-label="Módulos por célula">
          <ul class="sazon-menu-lista">${enlaces}</ul>
        </nav>
      </aside>`);
  }

  function crearFooter(raiz) {
    const enlaces = LAYOUT_MODULOS.filter((modulo) => modulo.codigo)
      .map((modulo) => `<a href="${raiz}${modulo.ruta}">${modulo.codigo} · ${modulo.nombre}</a>`);
    return crearDesdePlantilla(`
      <footer class="sazon-footer">
        <div class="sazon-footer-columnas">
          <div class="sazon-footer-columna">
            <span class="sazon-footer-marca"><img src="${raiz}assets/img/logo-sazon.svg" width="36" height="36" alt="">Sazón</span>
            <p>[Mensaje del proyecto] · Recetario digital Grupo Nutresa.</p>
          </div>
          <nav class="sazon-footer-columna" aria-label="Módulos del pie">
            <span class="sazon-etiqueta">Módulos</span>
            ${enlaces.slice(0, 4).join('')}
          </nav>
          <nav class="sazon-footer-columna" aria-label="Más módulos del pie">
            <span class="sazon-etiqueta" aria-hidden="true">&#160;</span>
            ${enlaces.slice(4).join('')}
          </nav>
          <nav class="sazon-footer-columna" aria-label="Ayuda y legal">
            <span class="sazon-etiqueta">Ayuda</span>
            <a href="#">[Preguntas frecuentes]</a>
            <a href="#">[Contacto]</a>
            <a href="#">[Términos de uso]</a>
            <a href="#">[Política de privacidad]</a>
          </nav>
        </div>
        <div class="sazon-footer-franja">
          <span>© [Año] Sazón · Grupo Nutresa</span>
          <span>Front I · 7 células</span>
        </div>
      </footer>`);
  }

  function crearInterruptor() {
    return crearDesdePlantilla(`
      <button type="button" class="sazon-interruptor-tema" id="sazon-interruptor-tema" role="switch" aria-checked="false" aria-label="Modo noche">
        <span class="sazon-interruptor-perilla" aria-hidden="true"></span>
        <span class="sazon-interruptor-iconos" aria-hidden="true">
          <i class="bi bi-sun"></i>
          <i class="bi bi-moon-stars"></i>
        </span>
      </button>`);
  }

  // ---------- Comportamiento ----------

  function conectarMenu() {
    const botonMenu = document.getElementById('sazon-boton-menu');
    const menu = document.getElementById('sazon-menu');
    const fondo = document.getElementById('sazon-menu-fondo');
    const botonCerrar = document.getElementById('sazon-boton-cerrar-menu');

    const abrir = () => {
      menu.hidden = false;
      fondo.hidden = false;
      botonMenu.setAttribute('aria-expanded', 'true');
      botonCerrar.focus();
    };
    const cerrar = () => {
      if (menu.hidden) return;
      menu.hidden = true;
      fondo.hidden = true;
      botonMenu.setAttribute('aria-expanded', 'false');
      botonMenu.focus();
    };

    botonMenu.addEventListener('click', abrir);
    botonCerrar.addEventListener('click', cerrar);
    fondo.addEventListener('click', cerrar);
    document.addEventListener('keydown', (evento) => {
      if (evento.key === LAYOUT_TECLA_CERRAR) cerrar();
    });
  }

  function conectarNotificaciones() {
    const boton = document.getElementById('sazon-boton-notificaciones');
    const panel = document.getElementById('sazon-panel-notificaciones');
    const alternar = (estaAbierto) => {
      panel.hidden = !estaAbierto;
      boton.setAttribute('aria-expanded', String(estaAbierto));
    };
    boton.addEventListener('click', () => alternar(panel.hidden));
    document.addEventListener('keydown', (evento) => {
      if (evento.key === LAYOUT_TECLA_CERRAR && !panel.hidden) alternar(false);
    });
  }

  function conectarInterruptor() {
    const interruptor = document.getElementById('sazon-interruptor-tema');
    aplicarTema(leerTemaGuardado(), interruptor);
    interruptor.addEventListener('click', () => {
      const temaNuevo = document.documentElement.dataset.tema === 'noche' ? 'dia' : 'noche';
      aplicarTema(temaNuevo, interruptor);
      guardarTema(temaNuevo);
    });
  }

  // La raíz solo puede subir carpetas ("", "../", "../../"…)
  function leerRaiz() {
    const raiz = document.body.dataset.raiz || '';
    return /^(\.\.\/)*$/.test(raiz) ? raiz : '';
  }

  function iniciarLayout() {
    const raiz = leerRaiz();
    const moduloActivo = document.body.dataset.modulo || '';
    document.body.prepend(crearMenu(raiz, moduloActivo));
    document.body.prepend(crearHeader(raiz));
    document.body.append(crearFooter(raiz));
    document.body.append(crearInterruptor());
    conectarMenu();
    conectarNotificaciones();
    conectarInterruptor();
  }

  aplicarTema(leerTemaGuardado(), null);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarLayout);
  } else {
    iniciarLayout();
  }
})();
