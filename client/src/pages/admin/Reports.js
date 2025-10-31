import React, { useState, useEffect } from 'react';
import { DocumentArrowDownIcon, TableCellsIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('volunteers');
  const [format, setFormat] = useState('pdf');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [generatedReports, setGeneratedReports] = useState([]);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Fetch existing reports on load
  useEffect(() => {
    fetchReportsList();
  }, []);

  const fetchReportsList = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_BASE_URL}/reports/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setGeneratedReports(response.data.reports);
      }
    } catch (error) {
      console.error('Error fetching reports list:', error);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const endpoint = reportType === 'volunteers' 
        ? `${API_BASE_URL}/reports/volunteers`
        : `${API_BASE_URL}/reports/events`;

      const response = await axios.post(
        endpoint,
        {
          format,
          startDate: dateRange.start || undefined,
          endDate: dateRange.end || undefined
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        showNotification('Report generated successfully!', 'success');
        
        // Download it immediately
        const downloadUrl = `${API_BASE_URL}${response.data.downloadUrl}`;
        window.open(downloadUrl, '_blank');
        
        // Refresh the reports list
        fetchReportsList();
      }
    } catch (error) {
      console.error('Error generating report:', error);
      showNotification('Failed to generate report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = (filename) => {
    const token = localStorage.getItem('authToken');
    const url = `${API_BASE_URL}/reports/download/${filename}?token=${token}`;
    window.open(url, '_blank');
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="mt-2 text-gray-600">
            Generate and download volunteer and event reports
          </p>
        </div>

        {/* Notification */}
        {notification.show && (
          <div className={`mb-6 p-4 rounded-lg ${
            notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {notification.message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Report Generator */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-lg rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Generate New Report
              </h2>

              {/* Report Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Report Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setReportType('volunteers')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      reportType === 'volunteers'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <DocumentTextIcon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <div className="font-medium">Volunteer Report</div>
                    <div className="text-sm text-gray-500">
                      Participation history
                    </div>
                  </button>

                  <button
                    onClick={() => setReportType('events')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      reportType === 'events'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <TableCellsIcon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <div className="font-medium">Event Report</div>
                    <div className="text-sm text-gray-500">
                      Event assignments
                    </div>
                  </button>
                </div>
              </div>

              {/* Format Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Export Format
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="pdf"
                      checked={format === 'pdf'}
                      onChange={(e) => setFormat(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium">PDF</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="csv"
                      checked={format === 'csv'}
                      onChange={(e) => setFormat(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium">CSV</span>
                  </label>
                </div>
              </div>

              {/* Date Range*/}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Date Range (Optional)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">End Date</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateReport}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                    Generate Report
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Previously generated reports */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-lg rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Recent Reports
              </h2>

              {generatedReports.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <DocumentTextIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No reports generated yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {generatedReports.slice(0, 10).map((report, index) => (
                    <div
                      key={index}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => downloadReport(report.filename)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            {report.type === 'pdf' ? (
                              <DocumentTextIcon className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                            ) : (
                              <TableCellsIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                            )}
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {report.filename}
                            </p>
                          </div>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <span>{formatFileSize(report.size)}</span>
                            <span className="mx-2">•</span>
                            <span>{new Date(report.created).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <DocumentArrowDownIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Report cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Volunteer Reports Include:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Volunteer participation history</li>
              <li>• Total events attended per volunteer</li>
              <li>• Total hours contributed</li>
              <li>• Contact information</li>
            </ul>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Event Reports Include:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Event details and dates</li>
              <li>• Volunteer assignments per event</li>
              <li>• Location and urgency levels</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;