
/**
 * TRACKR. Enterprise Cloud Sync & Notification Engine v3.0
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
        if (key === 'SYSTEM_SETTINGS') return;
        try {
          const val = JSON.parse(scriptProp.getProperty(key));
          if (val) {
            ['transactions', 'accounts', 'products', 'entities', 'users', 'companies'].forEach(k => {
              if (val[k]) globalStore[k] = globalStore[k].concat(val[k]);
            });
          }
        } catch(err) {}
      });
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: globalStore })).setMimeType(ContentService.MimeType.JSON);
    } else {
      const data = scriptProp.getProperty(companyId);
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: data ? JSON.parse(data) : {} })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  if (action === 'FIND_USER') {
    const email = e.parameter.email.toLowerCase().trim();
    const keys = scriptProp.getKeys();
    for (let key of keys) {
      try {
        const companyData = JSON.parse(scriptProp.getProperty(key));
        if (companyData.users) {
          const found = companyData.users.find(u => u.email.toLowerCase() === email);
          if (found) return ContentService.createTextOutput(JSON.stringify({ status: 'success', user: found })).setMimeType(ContentService.MimeType.JSON);
        }
      } catch(e) {}
    }
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'User not found' })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const action = body.action;
  const scriptProp = PropertiesService.getScriptProperties();

  if (action === 'NOTIFY') {
    const { to, subject, message, type, adminEmail } = body.payload;
    const settings = JSON.parse(scriptProp.getProperty('SYSTEM_SETTINGS') || '{}');
    
    // User Email
    try {
      GmailApp.sendEmail(to, subject, "", {
        htmlBody: `
          <div style="font-family:sans-serif; padding:40px; background:#f9fafb; border-radius:30px;">
            <div style="background:white; padding:40px; border-radius:20px; box-shadow:0 10px 20px rgba(0,0,0,0.05);">
              <h1 style="color:#10b981; margin-top:0;">TRACKR.</h1>
              <h2 style="color:#111827; margin-top:0;">System Notification</h2>
              <p style="color:#4b5563; line-height:1.6; font-size:14px;">${message}</p>
              <div style="margin-top:40px; padding-top:20px; border-top:1px solid #eee;">
                <p style="font-size:10px; color:#9ca3af; text-transform:uppercase; letter-spacing:1px;">Category: ${type}</p>
              </div>
            </div>
          </div>`
      });
      
      // Admin Alert
      if (adminEmail) {
        GmailApp.sendEmail(adminEmail, `[TRACKR ALERT] ${type}`, `Activity: ${message} | Targeted: ${to}`);
      }
    } catch(err) {
      console.error("Email Error: " + err);
    }
    return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'SYNC_PUSH') {
    const companyId = body.companyId;
    const data = body.data;
    if (companyId === 'GLOBAL') {
      if (data.settings) scriptProp.setProperty('SYSTEM_SETTINGS', JSON.stringify(data.settings));
      if (data.users) {
        data.users.forEach(u => {
          let cData = JSON.parse(scriptProp.getProperty(u.companyId) || "{}");
          if (cData.users) {
            cData.users = cData.users.map(existing => existing.id === u.id ? u : existing);
            scriptProp.setProperty(u.companyId, JSON.stringify(cData));
          }
        });
      }
    } else {
      scriptProp.setProperty(companyId, JSON.stringify(data));
    }
    return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(ContentService.MimeType.JSON);
  }
}
