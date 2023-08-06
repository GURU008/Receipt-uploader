import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = () => {
    if (!selectedFile) {
      setMessage('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('receipt', selectedFile);

    axios
      .post('http://localhost:5000/api/scan', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((response) => {
        setMessage('Receipt uploaded successfully');
        console.log(response.data.message);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div>
      <h1>Receipt Scanner</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleFileUpload}>Upload and Scan Receipt</button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default App;
