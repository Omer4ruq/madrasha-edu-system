import React, { useState, useMemo } from 'react';
import { FaEdit, FaSpinner, FaTrash } from 'react-icons/fa';

const LiabilityTable = ({ 
  liabilityEntries = [], 
  liabilityHeads = [],
  funds = [], 
  parties = [],
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
    head_id: '',
    fund_id: '',
    party_id: '',
    movement: ''
  });
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'

  // Available movement types
  const movementTypes = [
    { value: 'INCREASE', label: 'Increase' },
    { value: 'DECREASE', label: 'Decrease' }
  ];

  // Filter liability entries based on active tab and filter selections
  const filteredEntries = useMemo(() => {
    return liabilityEntries.filter((entry) => {
      if (activeTab === 'all') return true;
      
      if (activeTab === 'head' && dateFilter.head_id) {
        return entry.head === parseInt(dateFilter.head_id);
      }
      
      if (activeTab === 'fund' && dateFilter.fund_id) {
        return entry.fund === parseInt(dateFilter.fund_id);
      }
      
      if (activeTab === 'party' && dateFilter.party_id) {
        return entry.party === parseInt(dateFilter.party_id);
      }
      
      if (activeTab === 'movement' && dateFilter.movement) {
        return entry.movement === dateFilter.movement;
      }
      
      if (activeTab === 'date' && dateFilter.start_date && dateFilter.end_date) {
        const entryDate = new Date(entry.date);
        const startDate = new Date(dateFilter.start_date);
        const endDate = new Date(dateFilter.end_date);
        return entryDate >= startDate && entryDate <= endDate;
      }
      
      return true;
    });
  }, [liabilityEntries, activeTab, dateFilter]);

  // Calculate total amount for filtered entries (considering movement)
  const totalAmount = useMemo(() => {
    return filteredEntries.reduce((sum, entry) => {
      const amount = parseFloat(entry.amount) || 0;
      return entry.movement === 'INCREASE' ? sum + amount : sum - amount;
    }, 0).toFixed(2);
  }, [filteredEntries]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setDateFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Get entity names by ID
  const getHeadName = (headId) => {
    const head = liabilityHeads.find(h => h.id === headId);
    return head ? head.name : `Head ${headId}`;
  };

  const getFundName = (fundId) => {
    const fund = funds.find(f => f.id === fundId);
    return fund ? fund.name : `Fund ${fundId}`;
  };

  const getPartyName = (partyId) => {
    const party = parties.find(p => p.id === partyId);
    return party ? party.name : `Party ${partyId}`;
  };

  // Handle delete confirmation
  const handleDeleteConfirm = (entry) => {
    if (!hasDeletePermission) return;
    setShowDeleteConfirm(entry);
  };

  // Execute delete
  const handleDelete = async () => {
    if (!hasDeletePermission || !showDeleteConfirm) return;
    try {
      await onDelete(showDeleteConfirm.id);
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete liability entry:', err);
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
    
    if (activeTab === 'head' && !dateFilter.head_id) {
      alert('Please select a liability head for head filter');
      return;
    }
    
    if (activeTab === 'fund' && !dateFilter.fund_id) {
      alert('Please select a fund for fund filter');
      return;
    }
    
    if (activeTab === 'party' && !dateFilter.party_id) {
      alert('Please select a party for party filter');
      return;
    }
    
    if (activeTab === 'movement' && !dateFilter.movement) {
      alert('Please select a movement type for movement filter');
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
    
    if (!filteredEntries.length) {
      alert('No liability entries found for the selected filter');
      return;
    }

    const printWindow = window.open('', '_blank');
    const rowsPerPage = 20;
    const entryPages = [];
    
    for (let i = 0; i < filteredEntries.length; i += rowsPerPage) {
      entryPages.push(filteredEntries.slice(i, i + rowsPerPage));
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Liability Entries Report</title>
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
          }
          .increase {
            color: #d32f2f;
          }
          .decrease {
            color: #2e7d32;
          }
          .movement-badge {
            padding: 2px 6px;
            border-radius: 12px;
            font-size: 8px;
            font-weight: bold;
          }
          .movement-increase {
            background-color: #ffebee;
            color: #c62828;
          }
          .movement-decrease {
            background-color: #e8f5e8;
            color: #2e7d32;
          }
        </style>
      </head>
      <body>
        ${entryPages.map((pageItems, pageIndex) => `
          <div class="page-container">
            <div class="header">
              <h1>Liability Entries Report</h1>
              <h2 class="title">Financial Liability Summary</h2>
              <div class="meta-container">
                <span>Date Range: ${activeTab === "date" ? (dateFilter.start_date ? new Date(dateFilter.start_date).toLocaleDateString() : 'Start') + ' to ' + (dateFilter.end_date ? new Date(dateFilter.end_date).toLocaleDateString() : 'End') : 'All'}</span>
                <span>Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</span>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th style="width: 150px;">Liability Head</th>
                  <th style="width: 100px;">Fund</th>
                  <th style="width: 100px;">Party</th>
                  <th style="width: 100px;">Date</th>
                  <th style="width: 120px;">Amount (BDT)</th>
                  <th style="width: 100px;">Movement</th>
                  <th style="width: 200px;">Note</th>
                </tr>
              </thead>
              <tbody>
                ${pageItems.map((entry, index) => `
                  <tr style="${index % 2 === 1 ? 'background-color: #f9f9f9;' : ''}">
                    <td>${getHeadName(entry.head)}</td>
                    <td>${getFundName(entry.fund)}</td>
                    <td>${getPartyName(entry.party)}</td>
                    <td>${entry.date || 'N/A'}</td>
                    <td class="amount-cell ${entry.movement === 'INCREASE' ? 'increase' : 'decrease'}">${(entry.amount || 0).toLocaleString()}</td>
                    <td>
                      <span class="movement-badge movement-${entry.movement.toLowerCase()}">
                        ${entry.movement}
                      </span>
                    </td>
                    <td style="text-align: left;">${entry.note || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
              ${pageIndex === entryPages.length - 1 ? `
                <tfoot>
                  <tr>
                    <td colspan="4"><strong>Net Liability Amount</strong></td>
                    <td class="amount-cell ${parseFloat(totalAmount) >= 0 ? 'increase' : 'decrease'}"><strong>${totalAmount}</strong></td>
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
              <span>Page ${pageIndex + 1} of ${entryPages.length}</span>
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
        You do not have permission to view liability entries.
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
        <h2 className="text-2xl font-bold text-gray-800">Liability Entries List</h2>
        
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
              onClick={() => setActiveTab('head')}
              className={`tab ${activeTab === 'head' ? 'tab-active' : 'tab-inactive'}`}
            >
              Head
            </button>
            <button
              onClick={() => setActiveTab('fund')}
              className={`tab ${activeTab === 'fund' ? 'tab-active' : 'tab-inactive'}`}
            >
              Fund
            </button>
            <button
              onClick={() => setActiveTab('party')}
              className={`tab ${activeTab === 'party' ? 'tab-active' : 'tab-inactive'}`}
            >
              Party
            </button>
            <button
              onClick={() => setActiveTab('movement')}
              className={`tab ${activeTab === 'movement' ? 'tab-active' : 'tab-inactive'}`}
            >
              Movement
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
            {activeTab === 'head' && (
              <select
                name="head_id"
                value={dateFilter.head_id}
                onChange={handleFilterChange}
                className="bg-white min-w-[150px] text-gray-700 pl-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Liability Head</option>
                {liabilityHeads.map((head) => (
                  <option key={head.id} value={head.id}>
                    {head.name}
                  </option>
                ))}
              </select>
            )}
            
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
            
            {activeTab === 'party' && (
              <select
                name="party_id"
                value={dateFilter.party_id}
                onChange={handleFilterChange}
                className="bg-white min-w-[150px] text-gray-700 pl-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Party</option>
                {parties.map((party) => (
                  <option key={party.id} value={party.id}>
                    {party.name}
                  </option>
                ))}
              </select>
            )}
            
            {activeTab === 'movement' && (
              <select
                name="movement"
                value={dateFilter.movement}
                onChange={handleFilterChange}
                className="bg-white min-w-[150px] text-gray-700 pl-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Movement</option>
                {movementTypes.map((movement) => (
                  <option key={movement.value} value={movement.value}>
                    {movement.label}
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
            title="Generate Liability Report"
          >
            Report
          </button>
        </div>
      </div>

      {/* Results Count */}
      {!isLoading && !error && liabilityEntries.length > 0 && (
        <div className="text-sm text-gray-600 mb-4">
          Showing {filteredEntries.length} of {liabilityEntries.length} entries
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading liability entries...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <p>Error loading entries: {error?.data?.message || error?.message || 'Unknown error'}</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredEntries.length === 0 && liabilityEntries.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg">No liability entries found</p>
          <p className="text-sm">Create your first liability entry using the form above</p>
        </div>
      )}

      {/* No Filter Results */}
      {!isLoading && !error && filteredEntries.length === 0 && liabilityEntries.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg">No entries match your filter</p>
          <p className="text-sm">Try adjusting your search criteria</p>
          <button
            onClick={() => setDateFilter({ start_date: '', end_date: '', head_id: '', fund_id: '', party_id: '', movement: '' })}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* Table View */}
      {!isLoading && !error && filteredEntries.length > 0 && viewMode === 'table' && (
        <div className="table-container">
          <div className="inline-block min-w-full py-2 align-middle">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Liability Head
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fund
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Party
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Movement
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Note
                    </th>
                    {(hasEditPermission || hasDeletePermission) && (
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEntries.map((entry, index) => (
                    <tr
                      key={entry.id}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getHeadName(entry.head)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getFundName(entry.fund)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getPartyName(entry.party)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.date}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                        {parseInt(entry.amount).toLocaleString()} BDT
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          entry.movement === 'INCREASE' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {entry.movement}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {entry.note || '-'}
                      </td>
                      {(hasEditPermission || hasDeletePermission) && (
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2 justify-center">
                            {hasEditPermission && (
                              <button
                                onClick={() => onEdit(entry)}
                                className="text-blue-600 hover:text-blue-500 transition-colors"
                                title="Edit entry"
                              >
                                <FaEdit className="w-4 h-4" />
                              </button>
                            )}
                            {hasDeletePermission && (
                              <button
                                onClick={() => handleDeleteConfirm(entry)}
                                className="text-red-600 hover:text-red-500 transition-colors"
                                title="Delete entry"
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
                    <td colSpan={hasEditPermission || hasDeletePermission ? "4" : "4"} className="px-4 py-4 text-sm font-bold text-gray-900">
                      Net Liability Amount:
                    </td>
                    <td className="px-4 py-4 text-sm font-bold text-gray-900 text-right">
                      {totalAmount} BDT
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
      {!isLoading && !error && filteredEntries.length > 0 && viewMode === 'card' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {filteredEntries.map((entry) => (
              <div key={entry.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow h-full flex flex-col">
                <div className="flex-grow space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg text-gray-800 line-clamp-1">{getHeadName(entry.head)}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      entry.movement === 'INCREASE' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {entry.movement}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xl font-bold text-gray-900">
                      {parseInt(entry.amount).toLocaleString()} BDT
                    </p>
                    <p className="text-gray-600 flex items-center text-sm">
                      <span className="inline-block w-4 h-4 mr-2">💰</span>
                      <span className="truncate">{getFundName(entry.fund)}</span>
                    </p>
                    <p className="text-gray-600 flex items-center text-sm">
                      <span className="inline-block w-4 h-4 mr-2">👤</span>
                      <span className="truncate">{getPartyName(entry.party)}</span>
                    </p>
                    <p className="text-gray-600 flex items-center text-sm">
                      <span className="inline-block w-4 h-4 mr-2">📅</span>
                      <span>{entry.date}</span>
                    </p>
                    {entry.note && (
                      <p className="text-gray-600 text-sm">
                        <span className="inline-block w-4 h-4 mr-2">📝</span>
                        <span className="break-words line-clamp-2">{entry.note}</span>
                      </p>
                    )}
                  </div>
                </div>
                
                {(hasEditPermission || hasDeletePermission) && (
                  <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200">
                    {hasEditPermission && (
                      <button
                        onClick={() => onEdit(entry)}
                        className="flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition duration-200"
                      >
                        Edit
                      </button>
                    )}
                    {hasDeletePermission && (
                      <button
                        onClick={() => handleDeleteConfirm(entry)}
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
            Net Liability Amount: {totalAmount} BDT
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && hasDeletePermission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this liability entry of {parseInt(showDeleteConfirm.amount).toLocaleString()} BDT for {getHeadName(showDeleteConfirm.head)}? This action cannot be undone.
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

export default LiabilityTable;