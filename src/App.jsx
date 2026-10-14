import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './Login';

export default function App() {
  // FIXED: sessionStorage se real-time dynamic secure session token read karna
  const [user, setUser] = useState(() => sessionStorage.getItem('loggedInUser'));
  
  // Reload aur tab security enforce karne ke liye window unload check listener
  useEffect(() => {
    const handleReloadLock = () => {
      sessionStorage.removeItem('loggedInUser');
    };
    window.addEventListener('beforeunload', handleReloadLock);
    return () => window.removeEventListener('beforeunload', handleReloadLock);
  }, []);

  const [tableRows, setTableRows] = useState(() => {
    const savedData = localStorage.getItem('permanent_logs_db');
    if (savedData) return JSON.parse(savedData);
    return Array.from({ length: 31 }, (_, i) => ({
      date: `Day ${i + 1}`, counterSale: '', hamzaSupplier: '', arsalanBhai: '', makkahPlant: '', juttPlant: '', totalSupplyField: '', borrowBottles: '', fuelExp: '', otherExp: ''
    }));
  });

  const [summary, setSummary] = useState({ counterSales: 0, totalSupply: 0, borrowedBottles: 0, hamzaSupplier: 0, arsalanBhai: 0, makkahPlant: 0, juttPlant: 0, fuelExp: 0, otherExp: 0 });

  useEffect(() => {
    calcSummary(tableRows);
  }, [tableRows]);

  const calcSummary = (rows) => {
    let t = { counterSales: 0, totalSupply: 0, borrowedBottles: 0, hamzaSupplier: 0, arsalanBhai: 0, makkahPlant: 0, juttPlant: 0, fuelExp: 0, otherExp: 0 };
    rows.forEach(r => {
      t.counterSales += Number(r.counterSale) || 0;
      t.hamzaSupplier += Number(r.hamzaSupplier) || 0;
      t.arsalanBhai += Number(r.arsalanBhai) || 0;
      t.makkahPlant += Number(r.makkahPlant) || 0;
      t.juttPlant += Number(r.juttPlant) || 0;
      t.totalSupply += Number(r.totalSupplyField) || 0;
      t.borrowedBottles += Number(r.borrowBottles) || 0;
      t.fuelExp += Number(r.fuelExp) || 0;
      t.otherExp += Number(r.otherExp) || 0;
    });
    setSummary(t);
  };

  const handleCellChange = (idx, field, val) => {
    const updated = [...tableRows];
    updated[idx][field] = val;
    setTableRows(updated);
    localStorage.setItem('permanent_logs_db', JSON.stringify(updated));

    fetch('/api/logs', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(updated[idx]) 
    }).catch(() => console.log("Offline backup safe"));
  };

  if (!user) return <Login onLoginSuccess={(u) => setUser(u)} />;

  return (
    <div className="container-fluid px-4 py-3 bg-light min-vh-100">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-secondary mb-0">Analytics & Progress Summary <span className="fs-6 text-danger">● Secure Session</span></h4>
          <small className="text-muted">Welcome, {user}</small>
        </div>
        <div>
          <button className="btn btn-danger btn-sm fw-bold px-3 shadow-sm" onClick={() => { sessionStorage.clear(); setUser(null); }}>Logout</button>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-4"><div className="p-3 rounded text-white bg-success"><div>Total Counter Sales</div><div className="fs-2 fw-bold">Rs. {summary.counterSales}</div></div></div>
        <div className="col-md-4"><div className="p-3 rounded text-white bg-primary"><div>Supply bottles</div><div className="fs-2 fw-bold">{summary.totalSupply}</div></div></div>
        <div className="col-md-4"><div className="p-3 rounded text-white bg-danger"><div>Total Borrowed</div><div className="fs-2 fw-bold">{summary.borrowedBottles}</div></div></div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-3"><div className="p-3 rounded text-white" style={{backgroundColor:'#5c6bc0'}}><div>Hamza Total</div><div className="fs-3 fw-bold">{summary.hamzaSupplier}</div></div></div>
        <div className="col-md-3"><div className="p-3 rounded text-white" style={{backgroundColor:'#4fc3f7'}}><div>Arsalan Total</div><div className="fs-3 fw-bold">{summary.arsalanBhai}</div></div></div>
        <div className="col-md-3"><div className="p-3 rounded text-white" style={{backgroundColor:'#ff5252'}}><div>Makkah Total</div><div className="fs-3 fw-bold">{summary.makkahPlant}</div></div></div>
        <div className="col-md-3"><div className="p-3 rounded text-white" style={{backgroundColor:'#ffb300'}}><div>Jutt Total</div><div className="fs-3 fw-bold">{summary.juttPlant}</div></div></div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-6"><div className="p-3 rounded text-white bg-secondary"><div>Fuel Exp. Total</div><div className="fs-3 fw-bold">Rs. {summary.fuelExp}</div></div></div>
        <div className="col-md-6"><div className="p-3 rounded text-white bg-dark"><div>Other Exp. Total</div><div className="fs-3 fw-bold">Rs. {summary.otherExp}</div></div></div>
      </div>

      <div className="bg-white p-3 rounded border shadow-sm mb-4">
        <h5 className="fw-bold mb-3 text-dark">📅 31-Day Full Monthly Log Chart</h5>
        <div className="table-responsive">
          <table className="table table-bordered text-center align-middle m-0 table-sm">
            <thead className="table-dark" style={{fontSize: '0.8rem'}}>
              <tr>
                <th>DATE</th><th style={{color:'#2ea44f'}}>COUNTER SALE</th><th>HAMZA</th><th>ARSALAN</th><th>MAKKAH</th><th>JUTT</th><th style={{color:'#0d6efd'}}>SUPPLY BOTTLES</th><th style={{color:'#dc3545'}}>BORROW</th><th>FUEL</th><th>OTHER</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((r, i) => (
                <tr key={i}>
                  <td className="fw-bold bg-light" style={{fontSize:'0.85rem'}}>{r.date}</td>
                  <td><input type="number" className="form-control form-control-sm text-center border-0 bg-transparent" value={r.counterSale} onChange={(e) => handleCellChange(i, 'counterSale', e.target.value)} placeholder="0" /></td>
                  <td><input type="number" className="form-control form-control-sm text-center border-0 bg-transparent" value={r.hamzaSupplier} onChange={(e) => handleCellChange(i, 'hamzaSupplier', e.target.value)} placeholder="0" /></td>
                  <td><input type="number" className="form-control form-control-sm text-center border-0 bg-transparent" value={r.arsalanBhai} onChange={(e) => handleCellChange(i, 'arsalanBhai', e.target.value)} placeholder="0" /></td>
                  <td><input type="number" className="form-control form-control-sm text-center border-0 bg-transparent" value={r.makkahPlant} onChange={(e) => handleCellChange(i, 'makkahPlant', e.target.value)} placeholder="0" /></td>
                  <td><input type="number" className="form-control form-control-sm text-center border-0 bg-transparent" value={r.juttPlant} onChange={(e) => handleCellChange(i, 'juttPlant', e.target.value)} placeholder="0" /></td>
                  <td><input type="number" className="form-control form-control-sm text-center border-0 bg-light text-primary fw-bold" value={r.totalSupplyField} onChange={(e) => handleCellChange(i, 'totalSupplyField', e.target.value)} placeholder="0" /></td>
                  <td><input type="number" className="form-control form-control-sm text-center border-0 bg-transparent text-danger fw-bold" value={r.borrowBottles} onChange={(e) => handleCellChange(i, 'borrowBottles', e.target.value)} placeholder="0" /></td>
                  <td><input type="number" className="form-control form-control-sm text-center border-0 bg-transparent" value={r.fuelExp} onChange={(e) => handleCellChange(i, 'fuelExp', e.target.value)} placeholder="0" /></td>
                  <td><input type="number" className="form-control form-control-sm text-center border-0 bg-transparent" value={r.otherExp} onChange={(e) => handleCellChange(i, 'otherExp', e.target.value)} placeholder="0" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
