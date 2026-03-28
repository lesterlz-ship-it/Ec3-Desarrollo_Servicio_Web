const API_BASE = 'http://localhost';
const SERVICES = {
  clientes: '3001',
  reclamos: '3011',
  asignacion: '3021',
  evaluacion: '3031',
  resolucion: '3041',
  seguimiento: '3051',
  reportes: '3061'
};

// Funciones comunes
async function fetchData(service, endpoint = '') {
  try {
    const response = await fetch(`${API_BASE}:${SERVICES[service]}/api/${service}${endpoint}`);
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

// Cargar datos
async function loadData(service) {
  const data = await fetchData(service);
  displayData(service, data);
}

function displayData(service, data) {
  const content = document.getElementById('content');
  content.innerHTML = `
    <h2>${service}</h2>
    <pre>${JSON.stringify(data, null, 2)}</pre>
  `;
}

// Listeners
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const service = e.target.href.split('#')[1];
      loadData(service);
    });
  });
  loadData('clientes');
});