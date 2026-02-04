
/**
 * TRACKR. Enterprise Cloud Sync & Notification Engine v3.2
 * PRIORITY: Atomic Status Persistence
 */

function doGet(e) {
  const action = e.parameter.action;
  const companyId = e.parameter.companyId;
  const scriptProp = PropertiesService.getScriptProperties();
  
  if (action === 'SYNC_PULL') {
    let globalStore = { transactions: [], accounts: [], products: [], entities: [], users: [], companies: [] };
    const keys = scriptProp.getKeys();
    
    if (companyId === 'GLOBAL') {
      keys.forEach(key => {
        if (key === 'SYSTEM_SETTINGS' || key === 'MASTER_REGISTRY') return;
        try {
          const val = JSON.parse(scriptProp.getProperty(key));
          if (val) {
            ['transactions', 'accounts', 'products', 'entities', 'users', 'companies'].forEach(k => {
              if (val[k] && Array.isArray(val[k])) {
                globalStore[k] = globalStore[k].concat(val[k]);
              }
            });
          }
        } catch(err) {}
      });
      
      // Filter out duplicate users/companies by ID (Priority to the latest)
      globalStore.users = Array.from(new Map(globalStore.users.map(u => [u.id, u])).values());
      globalStore.companies = Array.from(new Map(globalStore.companies.map(c => [c.id, c])).values());
      
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: globalStore })).setMimeType(ContentService.MimeType.JSON);
    } else {
      const data = scriptProp.getProperty(companyId);
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: data ? JSON.parse(data) : {} })).setMimeType(ContentService.MimeType.JSON);
    }
  }
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const action = body.action;
  const scriptProp = PropertiesService.getScriptProperties();

  if (action === 'SYNC_PUSH') {
    const companyId = body.companyId;
    const data = body.data;

    if (companyId === 'GLOBAL') {
      if (data.settings) scriptProp.setProperty('SYSTEM_SETTINGS', JSON.stringify(data.settings));
      
      // Update individual slots based on the master payload
      if (data.companies && Array.isArray(data.companies)) {
        data.companies.forEach(comp => {
          if (comp.id === 'SYSTEM') return;
          
          let existingData = JSON.parse(scriptProp.getProperty(comp.id) || "{}");
          
          // Overwrite with the master authority's view
          existingData.companies = [comp];
          existingData.users = (data.users || []).filter(u => u.companyId === comp.id);
          
          // For global push, we only update status-related fields to avoid wiping transactions
          // unless the global push contains them. If the global push is a full state push,
          // then it's fine to overwrite.
          if (data.transactions) existingData.transactions = data.transactions.filter(t => t.companyId === comp.id);
          if (data.accounts) existingData.accounts = data.accounts.filter(a => a.companyId === comp.id);
          if (data.products) existingData.products = data.products.filter(p => p.companyId === comp.id);
          if (data.entities) existingData.entities = data.entities.filter(e => e.companyId === comp.id);

          scriptProp.setProperty(comp.id, JSON.stringify(existingData));
        });
      }
    } else {
      scriptProp.setProperty(companyId, JSON.stringify(data));
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'NOTIFY') {
    const { to, subject, message, type, adminEmail } = body.payload;
    try {
      GmailApp.sendEmail(to, subject, "", {
        htmlBody: `<div style="font-family:sans-serif; padding:40px; background:#f9fafb;"><div style="background:white; padding:40px; border-radius:20px;"><h2>${subject}</h2><p>${message}</p></div></div>`
      });
    } catch(err) {}
    return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(ContentService.MimeType.JSON);
  }
}
