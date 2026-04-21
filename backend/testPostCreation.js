async function test() {
  try {
    // 1. Register 
    const registerRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testbuguser' + Date.now().toString().slice(-4),
        email: 'testbug' + Date.now().toString().slice(-4) + '@test.com',
        password: 'password123'
      })
    });
    const registerData = await registerRes.json();
    const token = registerData.token;
    console.log('Got token:', token);

    // 2. Upload Post
    const fd = new FormData();
    fd.append('title', 'Test title');
    fd.append('content', 'Test content');
    
    console.log('Sending post...');
    const response = await fetch('http://localhost:5000/api/posts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: fd
    });
    const data = await response.json();
    console.log('Success:', response.status, data);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
