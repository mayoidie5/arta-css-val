import { SurveyResponse, SurveyQuestion } from '../App';

/**
 * Export survey responses to CSV format
 */
export const exportToCSV = (responses: SurveyResponse[], questions: SurveyQuestion[], filename: string = 'survey_responses.csv') => {
  try {
    // Create headers
    const headers = [
      'Reference ID',
      'Date',
      'Timestamp',
      'Service',
      'Client Type',
      'Sex',
      'Age',
      'Region',
      'Email',
      ...questions.map(q => q.text),
      'SQD Average',
      'Suggestions'
    ];

    // Create rows
    const rows = responses.map(response => {
      const row = [
        response.refId,
        response.date,
        new Date(response.timestamp).toISOString(),
        response.service,
        response.clientType,
        response.sex,
        response.age,
        response.region,
        response.email,
      ];

      // Add question responses
      questions.forEach(question => {
        const answer = response[question.id as keyof SurveyResponse] || '';
        row.push(String(answer));
      });

      // Add SQD average and suggestions
      row.push(String(response.sqdAvg.toFixed(2)));
      row.push(response.suggestions);

      return row;
    });

    // Convert to CSV format with proper escaping
    const csvContent = [
      headers.map(escapeCSVField).join(','),
      ...rows.map(row => row.map(escapeCSVField).join(','))
    ].join('\n');

    // Create blob and download
    downloadFile(csvContent, filename, 'text/csv');
  } catch (error) {
    console.error('Error exporting CSV:', error);
    throw error;
  }
};

/**
 * Generate PDF report with summary statistics
 */
export const generatePDFReport = (responses: SurveyResponse[], questions: SurveyQuestion[], filename: string = 'survey_report.pdf') => {
  try {
    // Calculate statistics
    const totalResponses = responses.length;
    const avgSatisfaction = totalResponses > 0
      ? (responses.reduce((sum, r) => sum + r.sqdAvg, 0) / totalResponses).toFixed(2)
      : '0.00';

    // Calculate service breakdown
    const serviceStats: Record<string, { count: number; avgRating: number }> = {};
    responses.forEach(response => {
      if (!serviceStats[response.service]) {
        serviceStats[response.service] = { count: 0, avgRating: 0 };
      }
      serviceStats[response.service].count++;
      serviceStats[response.service].avgRating += response.sqdAvg;
    });

    // Average the ratings
    Object.keys(serviceStats).forEach(service => {
      if (serviceStats[service].count > 0) {
        serviceStats[service].avgRating = serviceStats[service].avgRating / serviceStats[service].count;
      }
    });

    // Calculate client type breakdown
    const clientTypeStats: Record<string, number> = {};
    responses.forEach(response => {
      clientTypeStats[response.clientType] = (clientTypeStats[response.clientType] || 0) + 1;
    });

    // Calculate region breakdown
    const regionStats: Record<string, number> = {};
    responses.forEach(response => {
      regionStats[response.region] = (regionStats[response.region] || 0) + 1;
    });

    // Calculate SQD question averages
    const sqdStats: Record<string, number> = {};
    questions.filter(q => q.category === 'SQD').forEach(question => {
      let total = 0;
      let count = 0;
      responses.forEach(response => {
        const value = response[question.id as keyof SurveyResponse];
        if (value && value !== 'na' && !isNaN(Number(value))) {
          total += Number(value);
          count++;
        }
      });
      sqdStats[question.id] = count > 0 ? total / count : 0;
    });

    // Create HTML content for PDF
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Survey Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #3FA7D6;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0;
            color: #3FA7D6;
            font-size: 28px;
        }
        .header p {
            margin: 5px 0;
            color: #666;
        }
        .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        .section-title {
            background-color: #3FA7D6;
            color: white;
            padding: 10px 15px;
            margin: 0 0 15px 0;
            font-size: 16px;
            font-weight: bold;
            border-radius: 4px;
        }
        .stat-box {
            display: inline-block;
            background-color: #f0f5f9;
            border-left: 4px solid #3FA7D6;
            padding: 15px;
            margin: 10px 15px 10px 0;
            min-width: 200px;
            border-radius: 4px;
        }
        .stat-box-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
        }
        .stat-box-value {
            font-size: 24px;
            font-weight: bold;
            color: #3FA7D6;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #3FA7D6;
            color: white;
            font-weight: bold;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
        }
        .rating-good { color: #22c55e; font-weight: bold; }
        .rating-fair { color: #f59e0b; font-weight: bold; }
        .rating-poor { color: #ef4444; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Survey Report</h1>
        <p>ARTA CSS - City Government of Valenzuela</p>
        <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
    </div>

    <div class="section">
        <h2 class="section-title">Executive Summary</h2>
        <div class="stat-box">
            <div class="stat-box-label">Total Responses</div>
            <div class="stat-box-value">${totalResponses}</div>
        </div>
        <div class="stat-box">
            <div class="stat-box-label">Average Satisfaction</div>
            <div class="stat-box-value ${parseFloat(avgSatisfaction) >= 4 ? 'rating-good' : parseFloat(avgSatisfaction) >= 3 ? 'rating-fair' : 'rating-poor'}">${avgSatisfaction}/5.0</div>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Service Breakdown</h2>
        <table>
            <thead>
                <tr>
                    <th>Service</th>
                    <th>Number of Responses</th>
                    <th>Average Rating</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(serviceStats)
                  .sort((a, b) => b[1].count - a[1].count)
                  .map(([service, stats]) => `
                    <tr>
                        <td>${service}</td>
                        <td>${stats.count}</td>
                        <td class="${stats.avgRating >= 4 ? 'rating-good' : stats.avgRating >= 3 ? 'rating-fair' : 'rating-poor'}">
                            ${stats.avgRating.toFixed(2)}/5.0
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2 class="section-title">Client Type Distribution</h2>
        <table>
            <thead>
                <tr>
                    <th>Client Type</th>
                    <th>Count</th>
                    <th>Percentage</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(clientTypeStats)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count]) => `
                    <tr>
                        <td>${type}</td>
                        <td>${count}</td>
                        <td>${((count / totalResponses) * 100).toFixed(1)}%</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2 class="section-title">Region Distribution</h2>
        <table>
            <thead>
                <tr>
                    <th>Region</th>
                    <th>Count</th>
                    <th>Percentage</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(regionStats)
                  .sort((a, b) => b[1] - a[1])
                  .map(([region, count]) => `
                    <tr>
                        <td>${region}</td>
                        <td>${count}</td>
                        <td>${((count / totalResponses) * 100).toFixed(1)}%</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2 class="section-title">Service Quality Dimensions (SQD) Analysis</h2>
        <table>
            <thead>
                <tr>
                    <th>Dimension</th>
                    <th>Average Rating</th>
                </tr>
            </thead>
            <tbody>
                ${questions
                  .filter(q => q.category === 'SQD')
                  .map(q => {
                    const avg = sqdStats[q.id];
                    return `
                    <tr>
                        <td>${q.text.substring(0, 80)}...</td>
                        <td class="${avg >= 4 ? 'rating-good' : avg >= 3 ? 'rating-fair' : 'rating-poor'}">
                            ${avg.toFixed(2)}/5.0
                        </td>
                    </tr>
                    `;
                  }).join('')}
            </tbody>
        </table>
    </div>

    <div class="footer">
        <p>This report was automatically generated by the ARTA CSS Survey System.</p>
        <p>For more information, contact the City Government of Valenzuela.</p>
    </div>
</body>
</html>
    `;

    // Convert HTML to PDF using html2pdf-like approach with Canvas
    downloadHTMLAsPDF(htmlContent, filename);
  } catch (error) {
    console.error('Error generating PDF report:', error);
    throw error;
  }
};

/**
 * Escape CSV fields to handle special characters
 */
function escapeCSVField(field: any): string {
  if (field === null || field === undefined) {
    return '';
  }

  const str = String(field);
  // If the field contains comma, quote, or newline, wrap it in quotes and escape quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Download file as blob
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Convert HTML to PDF and download
 */
function downloadHTMLAsPDF(htmlContent: string, filename: string) {
  // Create an iframe to render the HTML
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  (iframe as any).srcdoc = htmlContent;
  
  document.body.appendChild(iframe);

  iframe.onload = function () {
    try {
      // Use browser's print-to-PDF functionality
      if (iframe.contentWindow) {
        iframe.contentWindow.print();
        
        // For browsers that support it, we can trigger save
        // This will open the print dialog where user can save as PDF
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }
    } catch (error) {
      console.error('Error printing PDF:', error);
      document.body.removeChild(iframe);
      
      // Fallback: download as HTML file that can be opened in browser and printed
      const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(htmlBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename.replace('.pdf', '.html');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // Trigger print after a short delay to ensure content is loaded
  setTimeout(() => {
    if (iframe.contentWindow) {
      iframe.contentWindow.print();
    }
  }, 500);
}
