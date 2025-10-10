// components/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer 
} from 'recharts';
import ApiService from '../api';
import "../index.css";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    appointments: [],
    revenueData: [],
    serviceData: []
  });

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [stats, appointments, services, payments] = await Promise.all([
          ApiService.getAdminStats(),
          ApiService.getAllAppointments(),
          ApiService.getServices(),
          ApiService.getMyPayments()
        ]);

        // Process data for charts
        const revenueData = processRevenueData(payments);
        const serviceData = processServiceData(appointments);

        setDashboardData({
          stats,
          appointments: appointments.slice(0, 10), // Show only recent 10
          revenueData,
          serviceData
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Process revenue data for charts
  const processRevenueData = (payments) => {
    // Group payments by day of week
    const dailyRevenue = {
      'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0
    };

    payments.forEach(payment => {
      const date = new Date(payment.createdAt);
      const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
      dailyRevenue[day] += payment.amount;
    });

    return Object.entries(dailyRevenue).map(([day, revenue]) => ({
      day,
      revenue: Math.round(revenue / 100) // Convert to dollars if in cents
    }));
  };

  // Process service data for pie chart
  const processServiceData = (appointments) => {
    const serviceCount = {};
    
    appointments.forEach(appointment => {
      const service = appointment.serviceName || 'Other';
      serviceCount[service] = (serviceCount[service] || 0) + 1;
    });

    return Object.entries(serviceCount).map(([name, value]) => ({
      name,
      value
    }));
  };

  // Handle appointment actions
  const handleAppointmentAction = async (appointmentId, action) => {
    try {
      if (action === 'approve') {
        await ApiService.updateAppointment(appointmentId, { status: 'confirmed' });
      } else if (action === 'cancel') {
        await ApiService.cancelAppointment(appointmentId);
      }
      
      // Refresh data
      const [appointments, stats] = await Promise.all([
        ApiService.getAllAppointments(),
        ApiService.getAdminStats()
      ]);
      
      setDashboardData(prev => ({
        ...prev,
        appointments: appointments.slice(0, 10),
        stats
      }));
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const COLORS = ['#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fecaca'];

  if (loading) {
    return (
      <div className="admin-dashboard loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2>My Desire Salon</h2>
          <p>Admin Dashboard</p>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={`nav-item ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            📅 Appointments
          </button>
          <button 
            className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveTab('customers')}
          >
            👥 Customers
          </button>
          <button 
            className={`nav-item ${activeTab === 'staff' ? 'active' : ''}`}
            onClick={() => setActiveTab('staff')}
          >
            👨‍💼 Staff
          </button>
          <button 
            className={`nav-item ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            💅 Services
          </button>
          <button 
            className={`nav-item ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            💰 Payments
          </button>
          <button 
            className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            📈 Reports
          </button>
          <button 
            className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            📦 Inventory
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        <header className="admin-header">
          <h1>Admin Dashboard</h1>
          <div className="header-actions">
            <button className="notification-btn">🔔 <span className="notification-count">3</span></button>
            <div className="admin-profile">
              <span>Admin User</span>
              <div className="profile-dropdown">▼</div>
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <h3>Today's Appointments</h3>
                <div className="stat-number">{dashboardData.stats.todayAppointments || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <h3>Pending Approval</h3>
                <div className="stat-number">{dashboardData.stats.pendingAppointments || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <h3>Total Revenue</h3>
                <div className="stat-number">Ksh {dashboardData.stats.totalRevenue?.toLocaleString() || '0'}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <h3>New Customers</h3>
                <div className="stat-number">{dashboardData.stats.newCustomers || 0}</div>
              </div>
            </div>

            {/* Charts */}
            <div className="charts-grid">
              <div className="chart-card">
                <h3>Weekly Revenue</h3>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dashboardData.revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="day" stroke="#ccc" />
                      <YAxis stroke="#ccc" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#000', 
                          border: '1px solid #dc2626',
                          color: '#fff'
                        }} 
                        formatter={(value) => [`Ksh ${value.toLocaleString()}`, 'Revenue']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#dc2626" 
                        strokeWidth={3}
                        dot={{ fill: '#dc2626', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="chart-card">
                <h3>Service Distribution</h3>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={dashboardData.serviceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {dashboardData.serviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#000', 
                          border: '1px solid #dc2626',
                          color: '#fff'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Appointments */}
            <div className="recent-appointments">
              <div className="section-header">
                <h3>Recent Appointments</h3>
                <button className="view-all-btn" onClick={() => setActiveTab('appointments')}>
                  View All →
                </button>
              </div>
              <div className="appointments-list">
                {dashboardData.appointments.length > 0 ? (
                  dashboardData.appointments.map(appointment => (
                    <div key={appointment.id} className="appointment-item">
                      <div className="appointment-info">
                        <div className="customer-name">{appointment.customerName}</div>
                        <div className="service-type">{appointment.serviceName}</div>
                        <div className="appointment-time">
                          {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime}
                        </div>
                        <div className="staff-assigned">{appointment.staffName}</div>
                      </div>
                      <div className={`status-badge ${appointment.status}`}>
                        {appointment.status}
                      </div>
                      <div className="appointment-actions">
                        {appointment.status === 'pending' && (
                          <>
                            <button 
                              className="action-btn approve"
                              onClick={() => handleAppointmentAction(appointment.id, 'approve')}
                            >
                              ✓
                            </button>
                            <button 
                              className="action-btn reject"
                              onClick={() => handleAppointmentAction(appointment.id, 'cancel')}
                            >
                              ✗
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-appointments">
                    No appointments found
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <AppointmentsManagement 
            appointments={dashboardData.appointments}
            onAppointmentUpdate={handleAppointmentAction}
          />
        )}
        {activeTab === 'customers' && <CustomerManagement />}
        {activeTab === 'staff' && <StaffManagement />}
        {activeTab === 'services' && <ServicesManagement />}
        {activeTab === 'payments' && <PaymentsManagement />}
        {activeTab === 'reports' && <ReportsAnalytics />}
        {activeTab === 'inventory' && <InventoryManagement />}
      </div>
    </div>
  );
};

// Enhanced Tab Components with API Integration
const AppointmentsManagement = ({ appointments, onAppointmentUpdate }) => {
  const [allAppointments, setAllAppointments] = useState([]);

  useEffect(() => {
    const fetchAllAppointments = async () => {
      try {
        const data = await ApiService.getAllAppointments();
        setAllAppointments(data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };

    fetchAllAppointments();
  }, []);

  return (
    <div className="tab-content">
      <div className="section-header">
        <h2>Appointments Management</h2>
        <button className="primary-btn">+ New Appointment</button>
      </div>
      
      <div className="appointments-table">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Service</th>
              <th>Date & Time</th>
              <th>Staff</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {allAppointments.map(appointment => (
              <tr key={appointment.id}>
                <td>{appointment.customerName}</td>
                <td>{appointment.serviceName}</td>
                <td>
                  {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime}
                </td>
                <td>{appointment.staffName}</td>
                <td>
                  <span className={`status-badge ${appointment.status}`}>
                    {appointment.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-sm btn-primary"
                      onClick={() => onAppointmentUpdate(appointment.id, 'approve')}
                    >
                      Approve
                    </button>
                    <button 
                      className="btn-sm btn-danger"
                      onClick={() => onAppointmentUpdate(appointment.id, 'cancel')}
                    >
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await ApiService.adminGetAllUsers();
        setCustomers(data.users || []);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <div className="tab-content">
      <h2>Customer Management</h2>
      <div className="search-bar">
        <input type="text" placeholder="Search customers..." className="search-input" />
        <button className="search-btn">Search</button>
      </div>
      
      <div className="customers-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Total Appointments</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer.id}>
                <td>{customer.firstName} {customer.lastName}</td>
                <td>{customer.email}</td>
                <td>{customer.phone}</td>
                <td>{customer.appointmentCount || 0}</td>
                <td>
                  <span className={`status-badge ${customer.isActive ? 'confirmed' : 'cancelled'}`}>
                    {customer.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button className="btn-sm btn-primary">View</button>
                  <button className="btn-sm btn-secondary">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Enhanced Staff Management Component
const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: 'hair-stylist',
    experience: '',
    bio: '',
    rating: 0,
    image: '/api/placeholder/300/300'
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const data = await ApiService.adminGetAllStaff();
      setStaff(data.staff || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const handleAddStaff = async () => {
    try {
      await ApiService.adminCreateStaff(newStaff);
      setShowAddModal(false);
      setNewStaff({
        name: '',
        email: '',
        phone: '',
        specialty: 'hair-stylist',
        experience: '',
        bio: '',
        rating: 0,
        image: '/api/placeholder/300/300'
      });
      fetchStaff();
    } catch (error) {
      console.error('Error adding staff:', error);
    }
  };

  const handleUpdateStaff = async (staffId, updates) => {
    try {
      await ApiService.adminUpdateStaff(staffId, updates);
      setEditingStaff(null);
      fetchStaff();
    } catch (error) {
      console.error('Error updating staff:', error);
    }
  };

  const handleDeleteStaff = async (staffId) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await ApiService.adminDeleteStaff(staffId);
        fetchStaff();
      } catch (error) {
        console.error('Error deleting staff:', error);
      }
    }
  };

  return (
    <div className="tab-content">
      <div className="section-header">
        <h2>Staff Management</h2>
        <button 
          className="primary-btn"
          onClick={() => setShowAddModal(true)}
        >
          + Add Staff
        </button>
      </div>
      
      <div className="staff-grid">
        {staff.map(member => (
          <div key={member.id} className="staff-card">
            <div className="staff-avatar">
              {member.name.charAt(0)}
            </div>
            <div className="staff-info">
              <h3>{member.name}</h3>
              <p>{member.specialty}</p>
              <p>Experience: {member.experience}</p>
              <p>⭐ {member.rating}</p>
              <p className={member.isActive ? 'status-active' : 'status-inactive'}>
                {member.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div className="staff-actions">
              <button 
                className="btn-sm btn-primary"
                onClick={() => setEditingStaff(member)}
              >
                Edit
              </button>
              <button 
                className="btn-sm btn-danger"
                onClick={() => handleDeleteStaff(member.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Add New Staff Member</h3>
            <div className="modal-form">
              <input
                type="text"
                placeholder="Full Name"
                value={newStaff.name}
                onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
              />
              <input
                type="email"
                placeholder="Email"
                value={newStaff.email}
                onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
              />
              <input
                type="text"
                placeholder="Phone"
                value={newStaff.phone}
                onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
              />
              <select
                value={newStaff.specialty}
                onChange={(e) => setNewStaff({...newStaff, specialty: e.target.value})}
              >
                <option value="hair-stylist">Hair Stylist</option>
                <option value="color-specialist">Color Specialist</option>
                <option value="barber">Barber</option>
                <option value="esthetician">Esthetician</option>
                <option value="nail-technician">Nail Technician</option>
                <option value="makeup-artist">Makeup Artist</option>
                <option value="massage-therapist">Massage Therapist</option>
              </select>
              <input
                type="text"
                placeholder="Experience (e.g., 5 years)"
                value={newStaff.experience}
                onChange={(e) => setNewStaff({...newStaff, experience: e.target.value})}
              />
              <textarea
                placeholder="Bio"
                value={newStaff.bio}
                onChange={(e) => setNewStaff({...newStaff, bio: e.target.value})}
              />
              <div className="modal-actions">
                <button onClick={handleAddStaff} className="btn-primary">Add Staff</button>
                <button onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Services Management Component
const ServicesManagement = () => {
  const [services, setServices] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price: '',
    duration: 60,
    category: 'hair'
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await ApiService.adminGetAllServices();
      setServices(data.services || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleAddService = async () => {
    try {
      await ApiService.adminCreateService(newService);
      setShowAddModal(false);
      setNewService({ name: '', description: '', price: '', duration: 60, category: 'hair' });
      fetchServices(); // Refresh the list
    } catch (error) {
      console.error('Error adding service:', error);
    }
  };

  const handleUpdateService = async (serviceId, updates) => {
    try {
      await ApiService.adminUpdateService(serviceId, updates);
      setEditingService(null);
      fetchServices();
    } catch (error) {
      console.error('Error updating service:', error);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await ApiService.adminDeleteService(serviceId);
        fetchServices(); // Refresh the list
      } catch (error) {
        console.error('Error deleting service:', error);
      }
    }
  };

  return (
    <div className="tab-content">
      <div className="section-header">
        <h2>Services & Pricing</h2>
        <button 
          className="primary-btn"
          onClick={() => setShowAddModal(true)}
        >
          + Add Service
        </button>
      </div>
      
      <div className="services-table">
        <table>
          <thead>
            <tr>
              <th>Service Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Duration</th>
              <th>Category</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map(service => (
              <tr key={service.id}>
                <td>{service.name}</td>
                <td>{service.description}</td>
                <td>Ksh {service.price?.toLocaleString()}</td>
                <td>{service.duration} mins</td>
                <td>{service.category}</td>
                <td>
                  <span className={`status-badge ${service.isActive ? 'confirmed' : 'cancelled'}`}>
                    {service.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-sm btn-primary"
                      onClick={() => setEditingService(service)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-sm btn-danger"
                      onClick={() => handleDeleteService(service.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Service Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Add New Service</h3>
            <div className="modal-form">
              <input
                type="text"
                placeholder="Service Name"
                value={newService.name}
                onChange={(e) => setNewService({...newService, name: e.target.value})}
              />
              <textarea
                placeholder="Description"
                value={newService.description}
                onChange={(e) => setNewService({...newService, description: e.target.value})}
              />
              <input
                type="number"
                placeholder="Price"
                value={newService.price}
                onChange={(e) => setNewService({...newService, price: e.target.value})}
              />
              <input
                type="number"
                placeholder="Duration (minutes)"
                value={newService.duration}
                onChange={(e) => setNewService({...newService, duration: parseInt(e.target.value) || 60})}
              />
              <select
                value={newService.category}
                onChange={(e) => setNewService({...newService, category: e.target.value})}
              >
                <option value="hair">Hair</option>
                <option value="nails">Nails</option>
                <option value="skincare">Skincare</option>
                <option value="massage">Massage</option>
                <option value="makeup">Makeup</option>
                <option value="other">Other</option>
              </select>
              <div className="modal-actions">
                <button onClick={handleAddService} className="btn-primary">Add Service</button>
                <button onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Service Modal */}
      {editingService && (
        <div className="modal-overlay" onClick={() => setEditingService(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Edit Service</h3>
            <div className="modal-form">
              <input
                type="text"
                placeholder="Service Name"
                value={editingService.name}
                onChange={(e) => setEditingService({...editingService, name: e.target.value})}
              />
              <textarea
                placeholder="Description"
                value={editingService.description}
                onChange={(e) => setEditingService({...editingService, description: e.target.value})}
              />
              <input
                type="number"
                placeholder="Price"
                value={editingService.price}
                onChange={(e) => setEditingService({...editingService, price: e.target.value})}
              />
              <input
                type="number"
                placeholder="Duration (minutes)"
                value={editingService.duration}
                onChange={(e) => setEditingService({...editingService, duration: parseInt(e.target.value) || 60})}
              />
              <select
                value={editingService.category}
                onChange={(e) => setEditingService({...editingService, category: e.target.value})}
              >
                <option value="hair">Hair</option>
                <option value="nails">Nails</option>
                <option value="skincare">Skincare</option>
                <option value="massage">Massage</option>
                <option value="makeup">Makeup</option>
                <option value="other">Other</option>
              </select>
              <div className="modal-actions">
                <button 
                  onClick={() => handleUpdateService(editingService.id, editingService)} 
                  className="btn-primary"
                >
                  Update Service
                </button>
                <button onClick={() => setEditingService(null)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PaymentsManagement = () => {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const data = await ApiService.getMyPayments();
        setPayments(data.payments || []);
      } catch (error) {
        console.error('Error fetching payments:', error);
      }
    };

    fetchPayments();
  }, []);

  return (
    <div className="tab-content">
      <h2>Payments & Invoices</h2>
      
      <div className="payments-table">
        <table>
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Customer</th>
              <th>Service</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(payment => (
              <tr key={payment.id}>
                <td>INV-{payment.id}</td>
                <td>{payment.customerName}</td>
                <td>{payment.serviceName}</td>
                <td>Ksh {payment.amount?.toLocaleString()}</td>
                <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${payment.status}`}>
                    {payment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ReportsAnalytics = () => (
  <div className="tab-content">
    <h2>Reports & Analytics</h2>
    <div className="reports-grid">
      <div className="report-card">
        <h3>Monthly Revenue Report</h3>
        <button className="btn-primary">Generate Report</button>
      </div>
      <div className="report-card">
        <h3>Customer Analytics</h3>
        <button className="btn-primary">View Analytics</button>
      </div>
      <div className="report-card">
        <h3>Staff Performance</h3>
        <button className="btn-primary">View Performance</button>
      </div>
    </div>
  </div>
);

const InventoryManagement = () => (
  <div className="tab-content">
    <h2>Inventory Management</h2>
    <div className="inventory-alerts">
      <div className="alert alert-warning">
        ⚠️ Shampoo stock running low (15 units remaining)
      </div>
      <div className="alert alert-info">
        ℹ️ Hair color restock arriving tomorrow
      </div>
    </div>
    {/* Inventory management interface */}
  </div>
);

export default AdminDashboard;