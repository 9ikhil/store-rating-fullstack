import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';

export default function StoresPage() {
  const [stores, setStores] = useState([]);
  const [nameFilter, setNameFilter] = useState('');
  const [addressFilter, setAddressFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [ratingDrafts, setRatingDrafts] = useState({}); // storeId -> selected rating value

  const fetchStores = useCallback(async () => {
    try {
      const res = await api.get('/stores', {
        params: { name: nameFilter, address: addressFilter, sortBy, sortOrder },
      });
      setStores(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load stores');
    }
  }, [nameFilter, addressFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  function toggleSort(field) {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  }

  async function submitRating(store) {
    const rating = ratingDrafts[store.id];
    if (!rating) return;
    setError('');
    setMessage('');
    try {
      if (store.myRatingId) {
        await api.put(`/ratings/${store.myRatingId}`, { rating: Number(rating) });
        setMessage(`Updated your rating for ${store.name}`);
      } else {
        await api.post('/ratings', { storeId: store.id, rating: Number(rating) });
        setMessage(`Submitted your rating for ${store.name}`);
      }
      fetchStores();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save rating');
    }
  }

  return (
    <div className="page-container">
      <h2>Stores</h2>
      {error && <div className="error-box">{error}</div>}
      {message && <div className="success-box">{message}</div>}

      <div className="filters">
        <input
          placeholder="Search by name"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
        />
        <input
          placeholder="Search by address"
          value={addressFilter}
          onChange={(e) => setAddressFilter(e.target.value)}
        />
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th onClick={() => toggleSort('name')} className="sortable">Store Name</th>
            <th onClick={() => toggleSort('address')} className="sortable">Address</th>
            <th>Overall Rating</th>
            <th>My Rating</th>
            <th>Rate this Store</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((store) => (
            <tr key={store.id}>
              <td>{store.name}</td>
              <td>{store.address}</td>
              <td>{store.averageRating ?? 'No ratings yet'}</td>
              <td>{store.myRating ?? 'Not rated'}</td>
              <td>
                <select
                  value={ratingDrafts[store.id] || ''}
                  onChange={(e) => setRatingDrafts({ ...ratingDrafts, [store.id]: e.target.value })}
                >
                  <option value="">Select</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <button onClick={() => submitRating(store)}>
                  {store.myRatingId ? 'Update' : 'Submit'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
