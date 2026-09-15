import fetch from 'node-fetch';

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4ODAyMTI4NCwiZXhwIjoxNzg4MDI4NDg0fQ.vN1mId4W8k35-51Uu-Z7W9fI9E_06X3rS-u6X9X_2_8";

async function test() {
  const res = await fetch('http://localhost:8080/api/tests/start', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ mode: 'timed' })
  });

  if (res.ok) {
    const data = await res.json();
    console.log('Session created with', data.questions.length, 'questions');
  } else {
    console.error('Failed to start test:', await res.text());
  }
}

test();
