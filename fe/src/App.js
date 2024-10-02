import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('number');
  const [sortOrder, setSortOrder] = useState('asc'); // Default sort order (asc or desc)
  const [formats, setFormats] = useState({
    number: 'hex',
    size: 'hex',
    gasLimit: 'hex',
    timestamp: 'hex'
  });

  // Function to fetch blocks from the API
  const fetchBlocks = async () => {
    try {
      const response = await axios.get('http://localhost:3000/blocks'); // Adjust the URL if needed
      const sortedBlocks = sortBlocks(response.data, sortField, sortOrder);
      setBlocks(sortedBlocks);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Sort blocks by the selected field and order
  const sortBlocks = (blockList, field, order) => {
    return blockList.sort((a, b) => {
      if (order === 'asc') {
        return a[field] > b[field] ? 1 : -1;
      } else {
        return a[field] < b[field] ? 1 : -1;
      }
    });
  };

  // Update sorting when sortField or sortOrder changes
  useEffect(() => {
    setBlocks((prevBlocks) => sortBlocks(prevBlocks, sortField, sortOrder));
  }, [sortField, sortOrder]);

  // Fetch blocks on initial render and set up WebSocket connection
  useEffect(() => {
    fetchBlocks();

    // Set up WebSocket connection
    const ws = new WebSocket('ws://localhost:3000');  // Adjust the WebSocket URL if needed

    // Handle WebSocket message event
    ws.onmessage = (event) => {
      const newBlock = JSON.parse(event.data);
      setBlocks((prevBlocks) => {
        const updatedBlocks = [...prevBlocks, newBlock];
        return sortBlocks(updatedBlocks, sortField, sortOrder);  // Insert new block in sorted order
      });
    };

    ws.onopen = () => {
      console.log('WebSocket connection opened');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      ws.close();  // Clean up WebSocket connection when component unmounts
    };
  }, [sortField, sortOrder, blocks]);  // Dependency to re-run when sorting changes

  // Handle field change in dropdown
  const handleSortFieldChange = (event) => {
    setSortField(event.target.value);
  };

  // Handle sort order change (asc or desc)
  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  // Function to delete a specific block (both frontend and backend)
  const handleDeleteBlock = async (blockNumber) => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:3000/blocks/${blockNumber}`);
      await fetchBlocks();
      setLoading(false);
    } catch (err) {
      console.error('Failed to delete block:', err);
    }
  };

  // Function to delete all blocks (both frontend and backend)
  const handleDeleteAll = async () => {
    try {
      await axios.delete('http://localhost:3000/blocks');
      await fetchBlocks();
    } catch (err) {
      console.error('Failed to delete all blocks:', err);
    }
  };

  const toggleFormat = (field) => {
    setFormats((prevFormats) => ({
      ...prevFormats,
      [field]: prevFormats[field] === 'hex' ? 'dec' : 'hex',
    }));
  };

  const formatValue = (field, value) => {
    if (formats[field] === 'hex') {
      return value;
    }
    return field === 'timestamp' ? new Date(value * 1000).toLocaleString() : parseInt(value.replace('0x', ''), 16);
  };


  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="App">
      <h1>Ethereum Block Tracker</h1>
      { loading && <p>Loading...</p> }

      {/* Sorting options */}
      <div className="sorting-controls">
        <label htmlFor="sortField">Sort by:</label>
        <select id="sortField" value={sortField} onChange={handleSortFieldChange}>
          <option value="number">Block Number</option>
          <option value="size">Size</option>
          <option value="timestamp">Timestamp</option>
          <option value="hash">Block Hash</option>
        </select>

        <button onClick={toggleSortOrder}>
          {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        </button>
      </div>

      {/* Button to delete all blocks */}
      <button onClick={handleDeleteAll} style={{ margin: '20px' }}>
        Delete All Blocks
      </button>

      {/* Blocks table */}
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Block Number</th>
            <th>Block Hash</th>
            <th>Size</th>
            <th>Nonce</th>
            <th>Gas Limit</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {blocks.map((block) => (
            <tr key={block._id}>
              <td><button onClick={() => handleDeleteBlock(block.number)} disabled={loading}>Delete</button></td>
              <td>
                <span onClick={() => toggleFormat('number')}>
                  {formatValue('number', block.number)}
                </span>
              </td>
              <td>{block.hash}</td>
              <td>
                <span onClick={() => toggleFormat('size')}>
                  {formatValue('size', block.size)}
                </span>
              </td>
              <td>{block.nonce}</td>
              <td>
                <span onClick={() => toggleFormat('gasLimit')}>
                  {formatValue('gasLimit', block.gasLimit)}
                </span>
              </td>
              <td>
                <span onClick={() => toggleFormat('timestamp')}>
                  {formatValue('timestamp', block.timestamp)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
