import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Fib() {
  const [seenIndexes, setSeenIndexes] = useState([]);
  const [values, setValues] = useState({});
  const [index, setIndex] = useState('');

  useEffect(() => {
    fetchValues();
    fetchIndexes();
  }, []);

  async function fetchValues() {
    try {
      const response = await axios.get('/api/values/current');
      setValues(response.data);
    } catch (error) {
      console.error('Error fetching values:', error);
    }
  }

  async function fetchIndexes() {
    try {
      const response = await axios.get('/api/values/all');
      setSeenIndexes(response.data);
    } catch (error) {
      console.error('Error fetching indexes:', error);
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await axios.post('/api/values', {
        index: index
      });
      setIndex('');
      // Refresh the data after submission
      fetchValues();
      fetchIndexes();
    } catch (error) {
      console.error('Error submitting index:', error);
    }
  };

  const renderSeenIndexes = () => {
    return seenIndexes.map(({ number }) => number).join(', ');
  };

  const renderValues = () => {
    const entries = [];

    for (let key in values) {
      entries.push(
        <div key={key}>
          For index {key} I calculated {values[key]}
        </div>
      );
    }

    return entries;
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>Enter your index:</label>
        <input
          value={index}
          onChange={(event) => setIndex(event.target.value)}
        />
        <button>Submit</button>
      </form>

      <h3>Indexes I have seen:</h3>
      {renderSeenIndexes()}

      <h3>Calculated Values:</h3>
      {renderValues()}
    </div>
  );
}

export default Fib;
