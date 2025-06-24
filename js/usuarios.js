document.addEventListener('DOMContentLoaded', async () => {
  const token = sessionStorage.getItem('accessToken');
  if (!token) {
    alert('Debe iniciar sesión para acceder.');
    return window.location.href = 'login.html';
  }

  try {
    const resp = await fetch('https://dummyjson.com/users');
    const { users } = await resp.json();

    const tbody = document.querySelector('#tablaUsuarios tbody');
    users.forEach(u => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${u.id}</td>
        <td>${u.username}</td>
        <td>${u.firstName} ${u.lastName}</td>
        <td>${u.email}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
    alert('Error al cargar la lista de usuarios.');
  }
});