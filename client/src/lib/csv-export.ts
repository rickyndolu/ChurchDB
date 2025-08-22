export const downloadCSV = async () => {
  try {
    const response = await fetch('/api/members/export/csv', {
      headers: {
        'Authorization': localStorage.getItem('auth_token') ? 
          `Bearer ${localStorage.getItem('auth_token')}` : ''
      }
    });

    if (!response.ok) {
      throw new Error('Failed to export CSV');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data_jemaat.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('CSV export failed:', error);
    throw error;
  }
};
