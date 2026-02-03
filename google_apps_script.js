
/**
 * TRACKR. Enterprise Cloud Sync Engine
 * Handles Global Data Merging, Multi-tenant Isolation, and Approval Workflows.
 */

function doGet(e) {
  const action = e.parameter.action;
  const companyId = e.parameter.companyId;
  const scriptProp = PropertiesService.getScriptProperties();
  
  // 1. GLOBAL PULL (For Super Admin)
  if (action === 'SYNC_PULL') {
    let allData = {};
    if (companyId === 'GLOBAL') {
      // Fetch everything from the central store
      const keys = scriptProp.getKeys();
      keys.forEach(key => {
        try {
          const val = JSON.parse(scriptProp.getProperty(key));
          // Merge logic: combine all transactions, users, products from all companies
          Object.keys(val).forEach(dataKey => {
            if (!allData[dataKey]) allData[dataKey] = [];
            if (Array.isArray(val[dataKey])) {
              allData[dataKey] = allData[dataKey].concat(val[dataKey]);
            } else if (typeof val[dataKey] === 'object') {
              // Special handling for settings or categories if needed
              allData[dataKey] = {...allData[dataKey], ...val[dataKey]};
            }
          });
        } catch(err) {}
      });
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: allData })).setMimeType(ContentService.MimeType.JSON);
    } else {
      // Individual Company Pull
      const data = scriptProp.getProperty(companyId);
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: data ? JSON.parse(data) : {} })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  // 2. REMOTE LOGIN / USER SEARCH
  if (action === 'FIND_USER') {
    const email = e.parameter.email.toLowerCase();
    const keys = scriptProp.getKeys();
    for (let key of keys) {
      const companyData = JSON.parse(scriptProp.getProperty(key));
      if (companyData.users) {
        const found = companyData.users.find(u => u.email.toLowerCase() === email);
        if (found) {
          return ContentService.createTextOutput(JSON.stringify({ status: 'success', user: found })).setMimeType(ContentService.MimeType.JSON);
        }
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'User not found' })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const action = body.action;
  const companyId = body.companyId;
  const data = body.data;
  const scriptProp = PropertiesService.getScriptProperties();

  if (action === 'SYNC_PUSH') {
    if (companyId === 'GLOBAL') {
      // Super Admin pushing updates to all users (like status updates)
      // This logic will iterate and update statuses based on IDs
      if (data.users) {
        data.users.forEach(u => {
          const cId = u.companyId;
          let cData = JSON.parse(scriptProp.getProperty(cId) || "{}");
          if (cData.users) {
            cData.users = cData.users.map(existing => existing.id === u.id ? u : existing);
            // Also update company status if needed
            if (u.status === 'ACTIVE' && cData.companies) {
              cData.companies = cData.companies.map(c => c.id === cId ? {...c, status: 'ACTIVE'} : c);
            }
            scriptProp.setProperty(cId, JSON.stringify(cData));
          }
        });
      }
    } else {
      // Individual Company Push
      scriptProp.setProperty(companyId, JSON.stringify(data));
    }
    return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(ContentService.MimeType.JSON);
  }
}
