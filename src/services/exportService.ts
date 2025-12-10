import { SurveyResponse, SurveyQuestion } from '../App';

interface ARTAComplianceReport {
  metadata: {
    reportName: string;
    generatedDate: string;
    organization: string;
    reportVersion: string;
  };
  summary: {
    totalResponses: number;
    averageSatisfaction: number;
    reportingPeriod: string;
  };
  sqdAnalysis: {
    sqdQuestions: Array<{
      questionId: string;
      questionText: string;
      averageRating: number;
      responseCount: number;
      ratingDistribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
        na: number;
      };
    }>;
    overallSQDAverage: number;
  };
  ccAnalysis: {
    ccQuestions: Array<{
      questionId: string;
      questionText: string;
      responses: Record<string, number>;
    }>;
  };
  demographicBreakdown: {
    byService: Record<string, { count: number; avgRating: number }>;
    byClientType: Record<string, { count: number; percentage: number }>;
    byRegion: Record<string, { count: number; percentage: number }>;
    bySex: Record<string, { count: number; percentage: number }>;
    byAge: Record<string, { count: number; percentage: number }>;
  };
  qualityMetrics: {
    complianceStatus: string;
    performanceRating: string;
    improvementAreas: string[];
    strengths: string[];
  };
  detailedResponses: Array<{
    refId: string;
    date: string;
    service: string;
    clientType: string;
    sqdAverage: number;
    ccResponses: Record<string, string>;
    suggestions: string;
  }>;
}

/**
 * Generate ARTA Compliance Report as JSON
 */
export const generateARTAComplianceJSON = (responses: SurveyResponse[], questions: SurveyQuestion[], filename: string = 'arta_compliance_report.json') => {
  try {
    if (responses.length === 0) {
      console.warn('No responses available for ARTA compliance report');
    }

    const totalResponses = responses.length;
    const avgSatisfaction = totalResponses > 0
      ? responses.reduce((sum, r) => sum + r.sqdAvg, 0) / totalResponses
      : 0;

    // SQD Analysis
    const sqdQuestions = questions.filter(q => q.category === 'SQD');
    const sqdAnalysisData = sqdQuestions.map(question => {
      const ratingDistribution: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, 'na': 0 };
      let total = 0;
      let count = 0;

      responses.forEach(response => {
        const value = response[question.id as keyof SurveyResponse];
        if (value) {
          if (String(value) === 'na' || value === 'na') {
            (ratingDistribution as any)['na']++;
          } else if (!isNaN(Number(value))) {
            const numValue = Number(value);
            (ratingDistribution as any)[String(numValue)]++;
            total += numValue;
            count++;
          }
        }
      });

      return {
        questionId: question.id,
        questionText: question.text,
        averageRating: count > 0 ? total / count : 0,
        responseCount: count,
        ratingDistribution
      };
    });

    const overallSQDAverage = sqdAnalysisData.length > 0
      ? sqdAnalysisData.reduce((sum, q) => sum + q.averageRating, 0) / sqdAnalysisData.length
      : 0;

    // CC Analysis (Citizen's Charter)
    const ccQuestions = questions.filter(q => q.category === 'CC');
    const ccAnalysisData = ccQuestions.map(question => {
      const responses_map: Record<string, number> = {};

      responses.forEach(response => {
        const value = String(response[question.id as keyof SurveyResponse] || '');
        if (value) {
          responses_map[value] = (responses_map[value] || 0) + 1;
        }
      });

      return {
        questionId: question.id,
        questionText: question.text,
        responses: responses_map
      };
    });

    // Demographic Breakdown
    const serviceStats: Record<string, { count: number; avgRating: number }> = {};
    const clientTypeStats: Record<string, number> = {};
    const regionStats: Record<string, number> = {};
    const sexStats: Record<string, number> = {};
    const ageStats: Record<string, number> = {};

    responses.forEach(response => {
      // Service stats
      if (!serviceStats[response.service]) {
        serviceStats[response.service] = { count: 0, avgRating: 0 };
      }
      serviceStats[response.service].count++;
      serviceStats[response.service].avgRating += response.sqdAvg;

      // Client type stats
      clientTypeStats[response.clientType] = (clientTypeStats[response.clientType] || 0) + 1;

      // Region stats
      regionStats[response.region] = (regionStats[response.region] || 0) + 1;

      // Sex stats
      sexStats[response.sex] = (sexStats[response.sex] || 0) + 1;

      // Age stats
      ageStats[response.age] = (ageStats[response.age] || 0) + 1;
    });

    // Average the service ratings
    Object.keys(serviceStats).forEach(service => {
      if (serviceStats[service].count > 0) {
        serviceStats[service].avgRating = serviceStats[service].avgRating / serviceStats[service].count;
      }
    });

    // Convert counts to percentages for demographics
    const clientTypePercentages: Record<string, { count: number; percentage: number }> = {};
    Object.keys(clientTypeStats).forEach(type => {
      clientTypePercentages[type] = {
        count: clientTypeStats[type],
        percentage: totalResponses > 0 ? (clientTypeStats[type] / totalResponses) * 100 : 0
      };
    });

    const regionPercentages: Record<string, { count: number; percentage: number }> = {};
    Object.keys(regionStats).forEach(region => {
      regionPercentages[region] = {
        count: regionStats[region],
        percentage: totalResponses > 0 ? (regionStats[region] / totalResponses) * 100 : 0
      };
    });

    const sexPercentages: Record<string, { count: number; percentage: number }> = {};
    Object.keys(sexStats).forEach(sex => {
      sexPercentages[sex] = {
        count: sexStats[sex],
        percentage: totalResponses > 0 ? (sexStats[sex] / totalResponses) * 100 : 0
      };
    });

    const agePercentages: Record<string, { count: number; percentage: number }> = {};
    Object.keys(ageStats).forEach(age => {
      agePercentages[age] = {
        count: ageStats[age],
        percentage: totalResponses > 0 ? (ageStats[age] / totalResponses) * 100 : 0
      };
    });

    // Quality Metrics
    const complianceStatus = avgSatisfaction >= 4 ? 'COMPLIANT' : avgSatisfaction >= 3 ? 'PARTIALLY COMPLIANT' : 'NON-COMPLIANT';
    const performanceRating = avgSatisfaction >= 4.5 ? 'EXCELLENT' : avgSatisfaction >= 4 ? 'GOOD' : avgSatisfaction >= 3 ? 'SATISFACTORY' : 'NEEDS IMPROVEMENT';

    // Identify improvement areas (SQD dimensions with lowest ratings)
    const improvementAreas = sqdAnalysisData
      .sort((a, b) => a.averageRating - b.averageRating)
      .slice(0, 3)
      .map(q => `${q.questionId}: ${q.averageRating.toFixed(2)}/5.0`);

    // Identify strengths (SQD dimensions with highest ratings)
    const strengths = sqdAnalysisData
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 3)
      .map(q => `${q.questionId}: ${q.averageRating.toFixed(2)}/5.0`);

    // Detailed responses for audit trail
    const detailedResponsesData = responses.map(response => {
      const ccResponses: Record<string, string> = {};
      ccQuestions.forEach(q => {
        ccResponses[q.id] = String(response[q.id as keyof SurveyResponse] || '');
      });

      return {
        refId: response.refId,
        date: response.date,
        service: response.service,
        clientType: response.clientType,
        sqdAverage: response.sqdAvg,
        ccResponses,
        suggestions: response.suggestions
      };
    });

    // Build final report
    const report: ARTAComplianceReport = {
      metadata: {
        reportName: 'ARTA Compliance Report',
        generatedDate: new Date().toISOString(),
        organization: 'City Government of Valenzuela',
        reportVersion: '1.0'
      },
      summary: {
        totalResponses,
        averageSatisfaction: Math.round(avgSatisfaction * 100) / 100,
        reportingPeriod: `${new Date().getFullYear()}-Q${Math.ceil((new Date().getMonth() + 1) / 3)}`
      },
      sqdAnalysis: {
        sqdQuestions: sqdAnalysisData,
        overallSQDAverage: Math.round(overallSQDAverage * 100) / 100
      },
      ccAnalysis: {
        ccQuestions: ccAnalysisData
      },
      demographicBreakdown: {
        byService: serviceStats,
        byClientType: clientTypePercentages,
        byRegion: regionPercentages,
        bySex: sexPercentages,
        byAge: agePercentages
      },
      qualityMetrics: {
        complianceStatus,
        performanceRating,
        improvementAreas,
        strengths
      },
      detailedResponses: detailedResponsesData
    };

    // Convert to JSON and download
    const jsonContent = JSON.stringify(report, null, 2);
    downloadFile(jsonContent, filename, 'application/json');
  } catch (error) {
    console.error('Error generating ARTA compliance JSON:', error);
    throw error;
  }
};

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
