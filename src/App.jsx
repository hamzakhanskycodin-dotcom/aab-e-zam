import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function App() {
  // Application State for Dashboard Summary
  const [summary, setSummary] = useState({
    counterSales: 0, totalSupply: 0, borrowedBottles: 0,
    hamzaSupplier: 0, arsalanBhai: 0, makkahPlant: 0, juttPlant: 0,
    fuelExp: 0, otherExp: 0
  });

  // Table Data State
  const [logs, setLogs] = useState([]);

  // Form Entry State
  const [formData, setFormData] = useState({
    date: '', counterSale: '', hamzaSupplier: '', arsalanBhai: '',
    makkahPlant: '', juttPlant: '', borrowBottles: '', fuelExp: '', otherExp: ''
  });

  // Fetch Existing Data from Node.js Backend on load
  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/logs');
      const data = await response.json();
      setLogs(data.logs || []);
      setSummary(data.summary || summary);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  // Form input handler
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Form Submit handler to save entry in database
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        alert("Entry Successfully Saved to Cloud Database!");
        fetchLogs(); // Reload latest entries and summaries
        setFormData({ date: '', counterSale: '', hamzaSupplier: '', arsalanBhai: '', makkahPlant: '', juttPlant: '', borrowBottles: '', fuelExp: '', otherExp: '' });
      }
    } catch (err) {
      console.error("Error saving entry:", err);
    }
  };

  return (
    <div className="container-fluid px-4 py-3 bg-light min-vh-100">
      
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-secondary mb-0">Analytics & Progress Summary <span className="fs-6 fw-normal text-muted">(Live Cloud Sync)</span></h4>
        </div>
        <button className="btn btn-warning fw-bold text-dark px-4 shadow-sm">📊 Customer 30-Day Sheet</button>
      </div>

      {/* Row 1: Primary 3 Cards */}
      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <div className="p-3 rounded text-white shadow-sm" style={{backgroundColor: '#198754'}}>
            <div className="small opacity-75 fw-semibold">Total Counter Sales</div>
            <div className="fs-2 fw-bold">Rs. {summary.counterSales}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-3 rounded text-white shadow-sm" style={{backgroundColor: '#0d6efd'}}>
            <div className="small opacity-75 fw-semibold">Total Supply (Grand Total)</div>
            <div className="fs-2 fw-bold">{summary.totalSupply}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-3 rounded text-white shadow-sm" style={{backgroundColor: '#dc3545'}}>
            <div className="small opacity-75 fw-semibold">Total Borrowed Bottles</div>
            <div className="fs-2 fw-bold">{summary.borrowedBottles}</div>
          </div>
        </div>
      </div>

      {/* Row 2: Secondary 4 Plant Cards */}
      <div className="row g-3 mb-3">
        <div className="col-md-3">
          <div className="p-3 rounded text-white shadow-sm" style={{backgroundColor: '#5c6bc0'}}>
            <div className="small opacity-75 fw-semibold">Hamza Supplier Total</div>
            <div className="fs-3 fw-bold">{summary.hamzaSupplier}</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="p-3 rounded text-white shadow-sm" style={{backgroundColor: '#4fc3f7'}}>
            <div className="small opacity-75 fw-semibold">Arsalan Bhai Total</div>
            <div className="fs-3 fw-bold">{summary.arsalanBhai}</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="p-3 rounded text-white shadow-sm" style={{backgroundColor: '#ff5252'}}>
            <div className="small opacity-75 fw-semibold">Makkah Plant Total</div>
            <div className="fs-3 fw-bold">{summary.makkahPlant}</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="p-3 rounded text-white shadow-sm" style={{backgroundColor: '#ffb300'}}>
            <div className="small opacity-75 fw-semibold">Jutt Plant Total</div>
            <div className="fs-3 fw-bold">{summary.juttPlant}</div>
          </div>
        </div>
      </div>

      {/* Row 3: Expense 2 Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="p-3 rounded text-white shadow-sm" style={{backgroundColor: '#6c757d'}}>
            <div className="small opacity-75 fw-semibold">Fuel Exp. Total</div>
            <div className="fs-3 fw-bold">Rs. {summary.fuelExp}</div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="p-3 rounded text-white shadow-sm" style={{backgroundColor: '#212529'}}>
            <div className="small opacity-75 fw-semibold">Other Exp. Total</div>
            <div className="fs-3 fw-bold">Rs. {summary.otherExp}</div>
          </div>
        </div>
      </div>

      {/* Data Entry Form Section */}
      <div className="bg-white p-4 rounded shadow-sm mb-4 border">
        <h5 className="fw-bold mb-3 text-primary">📥 New Entry Form</h5>
        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-2"><input type="text" name="date" placeholder="e.g. Day 1" className="form-control" value={formData.date} onChange={handleChange} required /></div>
          <div className="col-md-2"><input type="number" name="counterSale" placeholder="Counter Sale" className="form-control" value={formData.counterSale} onChange={handleChange} /></div>
          <div className="col-md-2"><input type="number" name="hamzaSupplier" placeholder="Hamza Qty" className="form-control" value={formData.hamzaSupplier} onChange={handleChange} /></div>
          <div className="col-md-2"><input type="number" name="arsalanBhai" placeholder="Arsalan Qty" className="form-control" value={formData.arsalanBhai} onChange={handleChange} /></div>
          <div className="col-md-2"><input type="number" name="makkahPlant" placeholder="Makkah Qty" className="form-control" value={formData.makkahPlant} onChange={handleChange} /></div>
          <div className="col-md-2"><input type="number" name="juttPlant" placeholder="Jutt Qty" className="form-control" value={formData.juttPlant} onChange={handleChange} /></div>
          <div className="col-md-3"><input type="number" name="borrowBottles" placeholder="Borrow Bottles" className="form-control" value={formData.borrowBottles} onChange={handleChange} /></div>
          <div className="col-md-3"><input type="number" name="fuelExp" placeholder="Fuel Expenses" className="form-control" value={formData.fuelExp} onChange={handleChange} /></div>
          <div className="col-md-3"><input type="number" name="otherExp" placeholder="Other Expenses" className="form-control" value={formData.otherExp} onChange={handleChange} /></div>
          <div className="col-md-3"><button type="submit" className="btn btn-primary w-100 fw-bold">Save To Cloud Database</button></div>
        </form>
      </div>

      {/* 9-Column Live Data Table */}
      <div className="bg-white p-3 rounded shadow-sm border">
        <h5 className="fw-bold mb-3 text-dark">📅 Monthly Log Chart <span className="fs-6 fw-normal text-muted">(Auto-Saves to Cloud)</span></h5>
        <div className="table-responsive">
          <table className="table table-bordered text-center align-middle m-0">
            <thead className="table-dark" style={{fontSize: '0.85rem'}}>
              <tr>
                <th>DATE</th>
                <th style={{color: '#2ea44f'}}>COUNTER SALE</th>
                <th>HAMZA SUPPLIER</th>
                <th>ARSALAN BHAI</th>
                <th>MAKKAH PLANT</th>
                <th>JUTT PLANT</th>
                <th style={{color: '#0d6efd'}}>TOTAL SUPPLY</th>
                <th style={{color: '#dc3545'}}>BORROW BOTTLES</th>
                <th>FUEL EXP.</th>
                <th>OTHER EXP.</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan="10" className="text-muted p-4">No data entries recorded yet. Use the form above to add log.</td></tr>
              ) : (
                logs.map((log, index) => (
                  <tr key={index}>
                    <td className="fw-bold text-dark text-start ps-3">{log.date}</td>
                    <td>{log.counterSale || 0}</td>
                    <td>{log.hamzaSupplier || 0}</td>
                    <td>{log.arsalanBhai || 0}</td>
                    <td>{log.makkahPlant || 0}</td>
                    <td>{log.juttPlant || 0}</td>
                    <td className="text-primary fw-bold">{(Number(log.hamzaSupplier)||0)+(Number(log.arsalanBhai)||0)+(Number(log.makkahPlant)||0)+(Number(log.juttPlant)||0)}</td>
                    <td className="text-danger fw-bold">{log.borrowBottles || 0}</td>
                    <td>{log.fuelExp || 0}</td>
                    <td>{log.otherExp || 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
