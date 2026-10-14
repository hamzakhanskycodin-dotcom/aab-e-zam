import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './Login';

export default function App() {
    // Session handling
    const [user, setUser] = useState(() => sessionStorage.getItem('loggedInUser'));

    // 1. Monthly Summary Table Rows State
    const [tableRows, setTableRows] = useState(() => {
        const savedData = localStorage.getItem('permanent_logs_db');
        if (savedData) return JSON.parse(savedData);
        return Array.from({ length: 31 }, (_, i) => ({
            date: `Day ${i + 1}`,
            counterSale: '',
            hamzaSupplier: '',
            arsalanBhai: '',
            makkahPlant: '',
            juttPlant: '',
            totalSupplyField: '',
            borrowBottles: '',
            fuelExp: '',
            otherExp: ''
        }));
    });

    // 2. Customers Table State (31-day horizontal matrix layout)
    const [customers, setCustomers] = useState(() => {
        const savedCustomers = localStorage.getItem('customers_attendance_db');
        if (savedCustomers) {
            try {
                const parsed = JSON.parse(savedCustomers);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            } catch (e) { console.error(e); }
        }
        const initialDays = Array.from({ length: 31 }, (_, i) => ({ day: i + 1, value: '' }));
        return [
            { id: 1, name: 'Ali Ahmed', phone: '0300-1234567', days: [...initialDays] },
            { id: 2, name: 'Kashif Khan', phone: '0321-7654321', days: [...initialDays] }
        ];
    });

    // Controls & Dynamic forms states
    const [newCustName, setNewCustName] = useState('');
    const [newCustPhone, setNewCustPhone] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');

    // Core Calculator for the 9 original dashboard elements
    const summary = tableRows.reduce(
        (acc, r) => {
            acc.counterSales += Number(r.counterSale) || 0;
            acc.hamzaSupplier += Number(r.hamzaSupplier) || 0;
            acc.arsalanBhai += Number(r.arsalanBhai) || 0;
            acc.makkahPlant += Number(r.makkahPlant) || 0;
            acc.juttPlant += Number(r.juttPlant) || 0;
            acc.totalSupply += Number(r.totalSupplyField) || 0;
            acc.borrowedBottles += Number(r.borrowBottles) || 0;
            acc.fuelExp += Number(r.fuelExp) || 0;
            acc.otherExp += Number(r.otherExp) || 0;
            return acc;
        },
        { counterSales: 0, totalSupply: 0, borrowedBottles: 0, hamzaSupplier: 0, arsalanBhai: 0, makkahPlant: 0, juttPlant: 0, fuelExp: 0, otherExp: 0 }
    );

    // Table row data updater
    const handleCellChange = (idx, field, val) => {
        const updated = tableRows.map((row, i) => i === idx ? { ...row, [field]: val } : row);
        setTableRows(updated);
        localStorage.setItem('permanent_logs_db', JSON.stringify(updated));
    };

    // Day logs update handler for customers
    const handleCustomerDayChange = (custId, dayNum, val) => {
        const updated = customers.map(c => {
            if (c.id === custId) {
                const updatedDays = c.days.map(d => d.day === dayNum ? { ...d, value: val } : d);
                return { ...c, days: updatedDays };
            }
            return c;
        });
        setCustomers(updated);
        localStorage.setItem('customers_attendance_db', JSON.stringify(updated));
    };

    // Add Customer routine
    const handleAddCustomer = (e) => {
        e.preventDefault();
        if (!newCustName.trim()) return;
        const newCustomer = {
            id: Date.now(),
            name: newCustName,
            phone: newCustPhone || 'N/A',
            days: Array.from({ length: 31 }, (_, i) => ({ day: i + 1, value: '' }))
        };
        const updated = [...customers, newCustomer];
        setCustomers(updated);
        localStorage.setItem('customers_attendance_db', JSON.stringify(updated));
        setNewCustName('');
        setNewCustPhone('');
    };

    // Controls triggers
    const startEdit = (c) => {
        setEditingId(c.id);
        setEditName(c.name);
        setEditPhone(c.phone);
    };

    const saveEdit = (id) => {
        const updated = customers.map(c => c.id === id ? { ...c, name: editName, phone: editPhone } : c);
        setCustomers(updated);
        localStorage.setItem('customers_attendance_db', JSON.stringify(updated));
        setEditingId(null);
    };

    const handleDeleteCustomer = (id) => {
        if (window.confirm("Delete this customer?")) {
            const updated = customers.filter(c => c.id !== id);
            setCustomers(updated);
            localStorage.setItem('customers_attendance_db', JSON.stringify(updated));
        }
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

            {/* KPI Cards Layer 1 (3 Cards) */}
            <div className="row g-3 mb-3">
                <div className="col-md-4"><div className="p-3 rounded text-white bg-success"><div>Total Counter Sales</div><div className="fs-2 fw-bold">Rs. {summary.counterSales}</div></div></div>
                <div className="col-md-4"><div className="p-3 rounded text-white bg-primary"><div>Supply bottles</div><div className="fs-2 fw-bold">{summary.totalSupply}</div></div></div>
                <div className="col-md-4"><div className="p-3 rounded text-white bg-danger"><div>Total Borrowed</div><div className="fs-2 fw-bold">{summary.borrowedBottles}</div></div></div>
            </div>

            {/* KPI Cards Layer 2 (4 Cards) */}
            <div className="row g-3 mb-3">
                <div className="col-md-3"><div className="p-3 rounded text-white" style={{ backgroundColor: '#5c6bc0' }}><div>Hamza Total</div><div className="fs-3 fw-bold">{summary.hamzaSupplier}</div></div></div>
                <div className="col-md-3"><div className="p-3 rounded text-white" style={{ backgroundColor: '#4fc3f7' }}><div>Arsalan Total</div><div className="fs-3 fw-bold">{summary.arsalanBhai}</div></div></div>
                <div className="col-md-3"><div className="p-3 rounded text-white" style={{ backgroundColor: '#ff5252' }}><div>Makkah Total</div><div className="fs-3 fw-bold">{summary.makkahPlant}</div></div></div>
                <div className="col-md-3"><div className="p-3 rounded text-white" style={{ backgroundColor: '#ffb300' }}><div>Jutt Total</div><div className="fs-3 fw-bold">{summary.juttPlant}</div></div></div>
            </div>

            {/* KPI Cards Layer 3 (2 Cards) -> TOTAL 9 CARDS CARDS MAINTAINED */}
            <div className="row g-3 mb-4">
                <div className="col-md-6"><div className="p-3 rounded text-white bg-secondary"><div>Fuel Exp. Total</div><div className="fs-3 fw-bold">Rs. {summary.fuelExp}</div></div></div>
                <div className="col-md-6"><div className="p-3 rounded text-white bg-dark"><div>Other Exp. Total</div><div className="fs-3 fw-bold">Rs. {summary.otherExp}</div></div></div>
            </div>

            {/* TABLE 1: 31-Day Chart */}
            <div className="bg-white p-3 rounded border shadow-sm mb-5">
                <h5 className="fw-bold mb-3 text-dark">📅 31-Day Full Monthly Log Chart</h5>
                <div className="table-responsive">
                    <table className="table table-bordered text-center align-middle m-0 table-sm">
                        <thead className="table-dark" style={{ fontSize: '0.8rem' }}>
                            <tr>
                                <th>DATE</th><th style={{ color: '#2ea44f' }}>COUNTER SALE</th><th>HAMZA</th><th>ARSALAN</th><th>MAKKAH</th><th>JUTT</th><th style={{ color: '#0d6efd' }}>SUPPLY BOTTLES</th><th style={{ color: '#dc3545' }}>BORROW</th><th>FUEL</th><th>OTHER</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableRows.map((r, i) => (
                                <tr key={r.date}>
                                    <td className="fw-bold bg-light" style={{ fontSize: '0.85rem' }}>{r.date}</td>
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

              {/* TABLE 2: Customer 31-Day Delivery Matrix Layout (Perfect Mobile Scroll Integration) */}
      <div className="bg-white p-3 rounded border shadow-sm mb-4">
        <div className="d-flex flex-column gap-3 mb-3">
          <h5 className="fw-bold mb-0 text-dark">👥 Customer 31-Day Delivery Log Ledger</h5>
          
          {/* Mobile responsive input forms layout */}
          <form onSubmit={handleAddCustomer} className="row g-2 align-items-center">
            <div className="col-12 col-sm-auto">
              <input type="text" className="form-control form-control-sm" style={{ minWidth: '180px' }} placeholder="Customer Name" value={newCustName} onChange={e => setNewCustName(e.target.value)} required />
            </div>
            <div className="col-12 col-sm-auto">
              <input type="text" className="form-control form-control-sm" style={{ minWidth: '150px' }} placeholder="Phone Details" value={newCustPhone} onChange={e => setNewCustPhone(e.target.value)} />
            </div>
            <div className="col-12 col-sm-auto">
              <button type="submit" className="btn btn-success btn-sm fw-bold w-100 px-3">+ Add Customer</button>
            </div>
          </form>
        </div>

        {/* Forced Mobile Scroll Container Layer */}
        <div className="w-100 overflow-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          <table className="table table-bordered text-center align-middle m-0 table-sm" style={{ minWidth: '1150px', tableLayout: 'fixed' }}>
            <thead className="table-primary text-dark" style={{ fontSize: '0.78rem' }}>
              <tr>
                <th style={{ width: '220px' }} className="position-sticky start-0 bg-primary text-white shadow-sm">CUSTOMER DETAILS</th>
                {Array.from({ length: 31 }, (_, i) => (
                  <th key={i} style={{ width: '42px', fontSize: '0.75rem' }}>D{i + 1}</th>
                ))}
                <th style={{ width: '65px' }} className="bg-dark text-white">TOTAL</th>
                <th style={{ width: '130px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => {
                const totalDelivered = c.days ? c.days.reduce((sum, d) => sum + (Number(d.value) || 0), 0) : 0;
                const isEditing = editingId === c.id;

                return (
                  <tr key={c.id}>
                    {/* Locked column that stays visible during touch scroll */}
                    <td className="text-start ps-3 fw-bold bg-light position-sticky start-0 shadow-sm" style={{ zIndex: 1, left: 0 }}>
                      {isEditing ? (
                        <div className="d-flex flex-column gap-1 p-1">
                          <input type="text" className="form-control form-control-sm p-1" value={editName} onChange={e => setEditName(e.target.value)} />
                          <input type="text" className="form-control form-control-sm p-1" style={{fontSize: '0.7rem'}} value={editPhone} onChange={e => setEditPhone(e.target.value)} />
                        </div>
                      ) : (
                        <>
                          <div className="text-truncate" style={{ maxWidth: '190px' }}>{c.name}</div>
                          <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>{c.phone}</small>
                        </>
                      )}
                    </td>
                    
                    {c.days && c.days.map((d) => (
                      <td key={d.day} className="p-0" style={{ width: '42px' }}>
                        <input 
                          type="number" min="0" className="form-control form-control-sm text-center border-0 bg-transparent p-1" 
                          style={{ fontSize: '0.8rem', height: '35px' }} placeholder="-" value={d.value} 
                          onChange={(e) => handleCustomerDayChange(c.id, d.day, e.target.value)} 
                        />
                      </td>
                    ))}

                    <td className="fw-bold bg-warning-subtle text-dark">{totalDelivered}</td>
                    
                    <td>
                      {isEditing ? (
                        <div className="d-flex gap-1 justify-content-center">
                          <button type="button" className="btn btn-success btn-xs px-2 py-0" style={{ fontSize: '0.7rem' }} onClick={() => saveEdit(c.id)}>Save</button>
                          <button type="button" className="btn btn-secondary btn-xs px-2 py-0" style={{ fontSize: '0.7rem' }} onClick={() => setEditingId(null)}>X</button>
                        </div>
                      ) : (
                        <div className="d-flex gap-1 justify-content-center">
                          <button type="button" className="btn btn-outline-primary btn-xs px-2 py-0" style={{ fontSize: '0.7rem' }} onClick={() => startEdit(c)}>Edit</button>
                          <button type="button" className="btn btn-outline-danger btn-xs px-2 py-0" style={{ fontSize: '0.7rem' }} onClick={() => handleDeleteCustomer(c.id)}>Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {/* VERTICAL COLUMN TOTALS ROW */}
              <tr className="bg-dark text-white fw-bold table-dark border-top border-dark">
                <td className="position-sticky start-0 bg-dark text-white text-end pe-3 text-uppercase shadow-sm" style={{ fontSize: '0.75rem', zIndex: 1, left: 0 }}>Total Bottles (Day wise)</td>
                {Array.from({ length: 31 }, (_, i) => {
                  const dayNum = i + 1;
                  const dayColumnTotal = customers.reduce((sum, c) => {
                    const foundDay = c.days ? c.days.find(d => d.day === dayNum) : null;
                    return sum + (Number(foundDay?.value) || 0);
                  }, 0);
                  return (
                    <td key={i} className="bg-secondary-subtle text-dark fw-bold" style={{ fontSize: '0.8rem' }}>
                      {dayColumnTotal > 0 ? dayColumnTotal : '-'}
                    </td>
                  );
                })}
                <td className="bg-warning text-dark fw-bold">
                  {customers.reduce((grandSum, c) => grandSum + (c.days ? c.days.reduce((s, d) => s + (Number(d.value) || 0), 0) : 0), 0)}
                </td>
                <td className="bg-dark"></td>
              </tr>
            </tbody>
          </table>
        </div>
        <small className="text-muted d-block mt-2">💡 Mobile Touch View: Table ko ungli se right swipe kar ke poore 31 din easily control karein.</small>
      </div>
    </div>
  );
}
