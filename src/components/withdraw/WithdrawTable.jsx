import React, { useState, useMemo } from 'react';
import { FaEdit, FaSpinner, FaTrash } from 'react-icons/fa';

const WithdrawTable = ({ 
  withdraws = [], 
  funds = [], 
  isLoading = false, 
  error = null, 
  onEdit, 
  onDelete,
  hasEditPermission = true,
  hasDeletePermission = true,
  hasViewPermission = true
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [dateFilter, setDateFilter] = useState({
    start_date: '',
    end_date: '',
    fund_id: '',
    method: ''
  });
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'

  // Available payment methods
  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'check', label: 'Check' },
    { value: 'online', label: 'Online Payment' },
    { value: 'mobile_banking', label: 'Mobile Banking' },
    { value: 'other', label: 'Other' }
  ];

  // Filter withdraws based on active tab and filter selections
  const filteredWithdraws = useMemo(() => {
    return withdraws.filter((withdraw) => {
      if (activeTab === 'all') return true;
      
      if (activeTab === 'fund' && dateFilter.fund_id) {
        return withdraw.fund === parseInt(dateFilter.fund_id);
      }
      
      if (activeTab === 'method' && dateFilter.method) {
        return withdraw.method === dateFilter.method;
      }
      
      if (activeTab === 'date' && dateFilter.start_date && dateFilter.end_date) {
        const withdrawDate = new Date(withdraw.date);
        const startDate = new Date(dateFilter.start_date);
        const endDate = new Date(dateFilter.end_date);
        return withdrawDate >= startDate && withdrawDate <= endDate;
      }
      
      return true;
    });
  }, [withdraws, activeTab, dateFilter]);

  // Calculate total amount for filtered withdraws
  const totalAmount = useMemo(() => {
    return filteredWithdraws.reduce((sum, withdraw) => {
      const amount = parseFloat(withdraw.amount) || 0;
      return sum + Math.abs(amount);
    }, 0).toFixed(2);
  }, [filteredWithdraws]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setDateFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Get fund name by ID
  const getFundName = (fundId) => {
    const fund = funds.find(f => f.id === fundId);
    return fund ? fund.name : `Fund ${fundId}`;
  };

  // Handle delete confirmation
  const handleDeleteConfirm = (withdraw) => {
    if (!hasDeletePermission) return;
    setShowDeleteConfirm(withdraw);
  };

  // Execute delete
  const handleDelete = async () => {
    if (!hasDeletePermission || !showDeleteConfirm) return;
    try {
      await onDelete(showDeleteConfirm.id);
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete withdraw:', err);
    }
  };

  // Generate report for printing
  const generateReport = () => {
    if (!hasViewPermission) {
      alert('You do not have permission to generate reports');
      return;
    }
    
    if (activeTab === 'date' && (!dateFilter.start_date || !dateFilter.end_date)) {
      alert('Please select start and end dates for date filter');
      return;
    }
    
    if (activeTab === 'fund' && !dateFilter.fund_id) {
      alert('Please select a fund for fund filter');
      return;
    }
    
    if (activeTab === 'method' && !dateFilter.method) {
      alert('Please select a method for method filter');
      return;
    }
    
    if (isLoading) {
      alert('Data is loading, please wait');
      return;
    }
    
    if (error) {
      alert(`Error loading data: ${error.status || 'Unknown error'}`);
      return;
    }
    
    if (!filteredWithdraws.length) {
      alert('No withdraw items found for the selected filter');
      return;
    }

    const printWindow = window.open('', '_blank');
    const rowsPerPage = 20;
    const withdrawPages = [];
    
    for (let i = 0; i < filteredWithdraws.length; i += rowsPerPage) {
      withdrawPages.push(filteredWithdraws.slice(i, i + rowsPerPage));
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Withdraw Items Report</title>
        <meta charset="UTF-8">
        <style>
          @page { 
            size: A4 landscape; 
            margin: 20mm;
          }
          body { 
            font-family: Arial, sans-serif;  
            font-size: 12px; 
            margin: 0;
            padding: 0;
            background-color: #ffffff;
            color: #000;
          }
          .page-container {
            width: 100%;
            min-height: 190mm;
            page-break-after: always;
          }
          .page-container:last-child {
            page-break-after: auto;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            font-size: 10px; 
            margin-top: 10px;
          }
          th, td { 
            border: 1px solid #000; 
            padding: 8px; 
            text-align: center; 
          }
          th { 
            background-color: #f5f5f5; 
            font-weight: bold; 
            color: #000;
            text-transform: uppercase;
          }
          td { 
            color: #000; 
          }
          .header { 
            text-align: center; 
            margin-bottom: 15px; 
            padding-bottom: 10px;
          }
          .title {
            font-size: 18px;
            color: #333;
            margin: 10px 0;
          }
          .meta-container {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            margin-bottom: 8px;
          }
          .date { 
            margin-top: 20px; 
            text-align: right; 
            font-size: 10px; 
            color: #000;
          }
          .footer {
            position: absolute;
            bottom: 20px;
            left: 40px;
            right: 40px;
            display: flex;
            justify-content: space-between;
            font-size: 8px;
            color: #555;
          }
          tfoot td {
            font-weight: bold;
            background-color: #f0f0f0;
          }
          .amount-cell {
            text-align: right;
            font-weight: bold;
            color: #d32f2f;
          }
        </style>
      </head>
      <body>
        ${withdrawPages.map((pageItems, pageIndex) => `
          <div class="page-container">
            <div class="header">
              <h1>Withdraw Items Report</h1>
              <h2 class="title">Financial Withdrawal Summary</h2>
              <div class="meta-container">
                <span>Date Range: ${activeTab === "date" ? (dateFilter.start_date ? new Date(dateFilter.start_date).toLocaleDateString() : 'Start') + ' to ' + (dateFilter.end_date ? new Date(dateFilter.end_date).toLocaleDateString() : 'End') : 'All'}</span>
                <span>Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</span>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th style="width: 150px;">Fund</th>
                  <th style="width: 100px;">Date</th>
                  <th style="width: 120px;">Amount (BDT)</th>
                  <th style="width: 120px;">Method</th>
                  <th style="width: 200px;">Note</th>
                </tr>
              </thead>
              <tbody>
                ${pageItems.map((withdraw, index) => `
                  <tr style="${index % 2 === 1 ? 'background-color: #f9f9f9;' : ''}">
                    <td>${getFundName(withdraw.fund)}</td>
                    <td>${withdraw.date || 'N/A'}</td>
                    <td class="amount-cell">-${Math.abs(withdraw.amount || 0).toLocaleString()}</td>
                    <td style="text-transform: capitalize;">${(withdraw.method || '').replace('_', ' ')}</td>
                    <td style="text-align: left;">${withdraw.note || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
              ${pageIndex === withdrawPages.length - 1 ? `
                <tfoot>
                  <tr>
                    <td colspan="2"><strong>Total Withdrawn</strong></td>
                    <td class="amount-cell"><strong>-${totalAmount}</strong></td>
                    <td colspan="2"></td>
                  </tr>
                </tfoot>
              ` : ''}
            </table>
            <div class="date">
              Report generated on: ${new Date().toLocaleDateString()}
            </div>
            <div class="footer">
              <span>This report was generated automatically.</span>
              <span>Page ${pageIndex + 1} of ${withdrawPages.length}</span>
            </div>
          </div>
        `).join('')}
        <script>
          let printAttempted = false;
          window.onbeforeprint = () => { printAttempted = true; };
          window.onafterprint = () => { window.close(); };
          window.addEventListener('beforeunload', (event) => {
            if (!printAttempted) { window.close(); }
          });
          window.print();
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (!hasViewPermission) {
    return (
      <div className="p-4 text-red-500 text-center">
        You do not have permission to view withdraw items.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <style>
        {`
          .table-container {
            max-height: 60vh;
            overflow-x: auto;
            overflow-y: auto;
            position: relative;
          }
          .tab {
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
            border: 1px solid #e5e7eb;
          }
          .tab-active {
            background-color: #3b82f6;
            color: white;
            font-weight: bold;
            border-color: #3b82f6;
          }
          .tab-inactive {
            background-color: white;
            color: #374151;
          }
          .tab-inactive:hover {
            background-color: #f3f4f6;
          }
          .report-button {
            background-color: #059669;
            color: white;
            padding: 8px 16px;
            border-radius: 8px;
            transition: background-color 0.3s;
            border: none;
            cursor: pointer;
          }
          .report-button:hover {
            background-color: #047857;
          }
        `}
      </style>

      {/* Header with filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Withdraws List</h2>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 w-full md:w-auto">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`tab ${activeTab === 'all' ? 'tab-active' : 'tab-inactive'}`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('fund')}
              className={`tab ${activeTab === 'fund' ? 'tab-active' : 'tab-inactive'}`}
            >
              Fund
            </button>
            <button
              onClick={() => setActiveTab('method')}
              className={`tab ${activeTab === 'method' ? 'tab-active' : 'tab-inactive'}`}
            >
              Method
            </button>
            <button
              onClick={() => setActiveTab('date')}
              className={`tab ${activeTab === 'date' ? 'tab-active' : 'tab-inactive'}`}
            >
              Date
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {activeTab === 'fund' && (
              <select
                name="fund_id"
                value={dateFilter.fund_id}
                onChange={handleFilterChange}
                className="bg-white min-w-[150px] text-gray-700 pl-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Fund</option>
                {funds.map((fund) => (
                  <option key={fund.id} value={fund.id}>
                    {fund.name}
                  </option>
                ))}
              </select>
            )}
            
            {activeTab === 'method' && (
              <select
                name="method"
                value={dateFilter.method}
                onChange={handleFilterChange}
                className="bg-white min-w-[150px] text-gray-700 pl-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Method</option>
                {paymentMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            )}
            
            {activeTab === 'date' && (
              <>
                <input
                  type="date"
                  name="start_date"
                  value={dateFilter.start_date}
                  onChange={handleFilterChange}
                  className="bg-white text-gray-700 pl-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Start Date"
                />
                <input
                  type="date"
                  name="end_date"
                  value={dateFilter.end_date}
                  onChange={handleFilterChange}
                  className="bg-white text-gray-700 pl-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="End Date"
                />
              </>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === 'card'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cards
            </button>
          </div>

          {/* Report Button */}
          <button
            onClick={generateReport}
            className="report-button w-full sm:w-auto"
            title="Generate Withdraw Report"
          >
            Report
          </button>
        </div>
      </div>

      {/* Results Count */}
      {!isLoading && !error && withdraws.length > 0 && (
        <div className="text-sm text-gray-600 mb-4">
          Showing {filteredWithdraws.length} of {withdraws.length} withdraws
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading withdraws...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <p>Error loading withdraws: {error?.data?.message || error?.message || 'Unknown error'}</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredWithdraws.length === 0 && withdraws.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg">No withdraws found</p>
          <p className="text-sm">Create your first withdraw using the form above</p>
        </div>
      )}

      {/* No Filter Results */}
      {!isLoading && !error && filteredWithdraws.length === 0 && withdraws.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg">No withdraws match your filter</p>
          <p className="text-sm">Try adjusting your search criteria</p>
          <button
            onClick={() => setDateFilter({ start_date: '', end_date: '', fund_id: '', method: '' })}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* Table View */}
      {!isLoading && !error && filteredWithdraws.length > 0 && viewMode === 'table' && (
        <div className="table-container">
          <div className="inline-block min-w-full py-2 align-middle">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fund
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Note
                    </th>
                    {(hasEditPermission || hasDeletePermission) && (
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredWithdraws.map((withdraw, index) => (
                    <tr
                      key={withdraw.id}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getFundName(withdraw.fund)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {withdraw.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600 text-right">
                        -{Math.abs(withdraw.amount).toLocaleString()} BDT
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                        {withdraw.method.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {withdraw.note || '-'}
                      </td>
                      {(hasEditPermission || hasDeletePermission) && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2 justify-center">
                            {hasEditPermission && (
                              <button
                                onClick={() => onEdit(withdraw)}
                                className="text-blue-600 hover:text-blue-500 transition-colors"
                                title="Edit withdraw"
                              >
                                <FaEdit className="w-4 h-4" />
                              </button>
                            )}
                            {hasDeletePermission && (
                              <button
                                onClick={() => handleDeleteConfirm(withdraw)}
                                className="text-red-600 hover:text-red-500 transition-colors"
                                title="Delete withdraw"
                              >
                                <FaTrash className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={hasEditPermission || hasDeletePermission ? "2" : "2"} className="px-6 py-4 text-sm font-bold text-gray-900">
                      Total Withdrawn:
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-red-600 text-right">
                      -{totalAmount} BDT
                    </td>
                    <td colSpan={hasEditPermission || hasDeletePermission ? "3" : "2"}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Card View */}
      {!isLoading && !error && filteredWithdraws.length > 0 && viewMode === 'card' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {filteredWithdraws.map((withdraw) => (
              <div key={withdraw.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow h-full flex flex-col">
                <div className="flex-grow space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg text-gray-800">{getFundName(withdraw.fund)}</h3>
                    <span className="text-sm text-gray-500">{withdraw.date}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xl font-bold text-red-600">
                      -{Math.abs(withdraw.amount).toLocaleString()} BDT
                    </p>
                    <p className="text-gray-600 flex items-center">
                      <span className="inline-block w-4 h-4 mr-2">💳</span>
                      <span className="capitalize">{withdraw.method.replace('_', ' ')}</span>
                    </p>
                    {withdraw.note && (
                      <p className="text-gray-600 text-sm">
                        <span className="inline-block w-4 h-4 mr-2">📝</span>
                        <span className="break-words line-clamp-2">{withdraw.note}</span>
                      </p>
                    )}
                  </div>
                </div>
                
                {(hasEditPermission || hasDeletePermission) && (
                  <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200">
                    {hasEditPermission && (
                      <button
                        onClick={() => onEdit(withdraw)}
                        className="flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition duration-200"
                      >
                        Edit
                      </button>
                    )}
                    {hasDeletePermission && (
                      <button
                        onClick={() => handleDeleteConfirm(withdraw)}
                        className="flex-1 px-3 py-2 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition duration-200"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Total for Card View */}
          <div className="p-4 text-right font-bold text-gray-800 bg-gray-50 rounded-lg">
            Total Withdrawn: -{totalAmount} BDT
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && hasDeletePermission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this withdraw of {Math.abs(showDeleteConfirm.amount).toLocaleString()} BDT from {getFundName(showDeleteConfirm.fund)}? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition duration-200"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md font-medium transition duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawTable;