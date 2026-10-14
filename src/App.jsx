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

    // 2. Customers Table State (Protected 31-day data structure)
    const [customers, setCustomers] = useState(() => {
        const savedCustomers = localStorage.getItem('customers_attendance_db');
        if (savedCustomers) {
            try {
                const parsed = JSON.parse(savedCustomers);
                if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].days) {
                    return parsed;
                }
            } catch (e) {
                console.error("Local data parse error:", e);
            }
        }

        const initialDays = Array.from({ length: 31 }, (_, i) => ({ day: i + 1, value: '' }));
        return [
            { id: 1, name: 'Ali Ahmed', phone: '0300-1234567', days: [...initialDays] },
            { id: 2, name: 'Kashif Khan', phone: '0321-7654321', days: [...initialDays] }
        ];
    });

    // New Customer Form State
    const [newCustName, setNewCustName] = useState('');
    const [newCustPhone, setNewCustPhone] = useState('');

    // Live total calculations for top summary cards
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

    // Summary Table Handler
    const handleCellChange = (idx, field, val) => {
        const updated = tableRows.map((row, i) =>
            i === idx ? { ...row, [field]: val } : row
        );
        setTableRows(updated);
        localStorage.setItem('permanent_logs_db', JSON.stringify(updated));

        fetch('/api/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated[idx])
        }).catch(() => console.log("Offline backup safe"));
    };

    // Customer 31-Day Attendance Cell Input Handler
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

    // Add New Customer Function
    const handleAddCustomer = (e) => {
        e.preventDefault();
        if (!newCustName.trim()) return;

        const newCustomer = {
            id: Date.now(),
            name: newCustName,
            phone: newCustPhone || 'N/A',
            days: Array.from({ length: 31 }, (_, i) => ({ day: i + 1, value: '' }))
        };

        const updatedCustomers = [...customers, newCustomer];
        setCustomers(updatedCustomers);
        localStorage.setItem('customers_attendance_db', JSON.stringify(updatedCustomers));

        setNewCustName('');
        setNewCustPhone('');
    };

    // Delete Customer
    const handleDeleteCustomer = (id) => {
        if (window.confirm("Kya aap waqai is customer ko delete karna chahte hain?")) {
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

            {/* Top Cards Section */}
            <div className="row g-3 mb-3">
                <div className="col-md-4"><div className="p-3 rounded text-white bg-success"><div>Total Counter Sales</div><div className="fs-2 fw-bold">Rs. {summary.counterSales}</div></div></div>
                <div className="col-md-4"><div className="p-3 rounded text-white bg-primary"><div>Supply bottles</div><div className="fs-2 fw-bold">{summary.totalSupply}</div></div></div>
                <div className="col-md-4"><div className="p-3 rounded text-white bg-danger"><div>Total Borrowed</div><div className="fs-2 fw-bold">{summary.borrowedBottles}</div></div></div>
            </div>

            <div className="row g-3 mb-3">
                <div className="col-md-3"><div className="p-3 rounded text-white" style={{ backgroundColor: '#5c6bc0' }}><div>Hamza Total</div><div className="fs-3 fw-bold">{summary.hamzaSupplier}</div></div></div>
                <div className="col-md-3"><div className="p-3 rounded text-white" style={{ backgroundColor: '#4fc3f7' }}><div>Arsalan Total</div><div className="fs-3 fw-bold">{summary.arsalanBhai}</div></div></div>
                <div className="col-md-3"><div className="p-3 rounded text-white" style={{ backgroundColor: '#ff5252' }}><div>Makkah Total</div><div className="fs-3 fw-bold">{summary.makkahPlant}</div></div></div>
                <div className="col-md-3"><div className="p-3 rounded text-white" style={{ backgroundColor: '#ffb300' }}><div>Jutt Total</div><div className="fs-3 fw-bold">{summary.juttPlant}</div></div></div>
            </div>

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
                                <th>DATE</th>
                                <th style={{ color: '#2ea44f' }}>COUNTER SALE</th>
                                <th>HAMZA</th>
                                <th>ARSALAN</th>
                                <th>MAKKAH</th>
                                <th>JUTT</th>
                                <th style={{ color: '#0d6efd' }}>SUPPLY BOTTLES</th>
                                <th style={{ color: '#dc3545' }}>BORROW</th>
                                <th>FUEL</th>
                                <th>OTHER</th>
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

            {/* TABLE 2: Customer Ledger with 31 Dynamic Columns */}
            <div className="bg-white p-3 rounded border shadow-sm mb-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
                    <h5 className="fw-bold mb-0 text-dark">👥 Customer 31-Day Delivery Log Ledger</h5>
                    <form onSubmit={handleAddCustomer} className="d-flex align-items-center gap-2 flex-wrap">
                        <input type="text" className="form-control form-control-sm" style={{ width: '180px' }} placeholder="Customer Name" value={newCustName} onChange={e => setNewCustName(e.target.value)} required />
                        <input type="text" className="form-control form-control-sm" style={{ width: '150px' }} placeholder="Phone / Route Details" value={newCustPhone} onChange={e => setNewCustPhone(e.target.value)} />
                        <button type="submit" className="btn btn-success btn-sm fw-bold px-3">+ Add Customer</button>
                    </form>
                </div>

                <div className="table-responsive">
                    <table className="table table-bordered text-center align-middle m-0 table-sm" style={{ minWidth: '1600px' }}>
                        <thead className="table-primary text-dark" style={{ fontSize: '0.78rem' }}>
                            <tr>
                                <th style={{ width: '220px' }} className="position-sticky start-0 bg-primary text-white shadow-sm">CUSTOMER DETAILS</th>
                                {Array.from({ length: 31 }, (_, i) => (
                                    <th key={i} style={{ minWidth: '42px', fontSize: '0.75rem' }}>D{i + 1}</th>
                                ))}
                                <th style={{ minWidth: '65px' }} className="bg-dark text-white">TOTAL</th>
                                <th>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.length === 0 ? (
                                <tr>
                                    <td colSpan="34" className="text-muted p-3">Koi customer nahi mila. Upar se add karein.</td>
                                </tr>
                            ) : (
                                customers.map((c) => {
                                    const totalDelivered = c.days ? c.days.reduce((sum, d) => sum + (Number(d.value) || 0), 0) : 0;

                                    return (
                                        <tr key={c.id}>
                                            <td className="text-start ps-3 fw-bold bg-light position-sticky start-0 shadow-sm">
                                                <div className="text-truncate" style={{ maxWidth: '190px' }}>{c.name}</div>
                                                <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>{c.phone}</small>
                                            </td>

                                            {c.days && c.days.map((d) => (
                                                <td key={d.day} className="p-0">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        className="form-control form-control-sm text-center border-0 bg-transparent p-1"
                                                        style={{ fontSize: '0.8rem', height: '35px' }}
                                                        placeholder="-"
                                                        value={d.value}
                                                        onChange={(e) => handleCustomerDayChange(c.id, d.day, e.target.value)}
                                                    />
                                                </td>
                                            ))}

                                            <td className="fw-bold bg-warning-subtle text-dark">{totalDelivered}</td>
                                            <td>
                                                <button type="button" className="btn btn-outline-danger btn-xs py-0 px-2" style={{ fontSize: '0.7rem' }} onClick={() => handleDeleteCustomer(c.id)}>Delete</button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                <small className="text-muted d-block mt-2">💡 Tip: Customer columns locked hain, aage scroll karke pure 31 din manage karein.</small>
            </div>
        </div>
    );
}
