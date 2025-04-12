const API_BASE = "/bibliotech/api/auth.php";

export async function login(email, senha) {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, senha })
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  return response.json();
}