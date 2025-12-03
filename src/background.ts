const onMessage = (message: any) => {
  if (message.type == 'HIBISCUS-AUTHORIZATION') {
    const data: Record<string, string> = {}
    const onBeforeSendHeaders = (details: chrome.webRequest.OnBeforeSendHeadersDetails) => {
      if (!details.requestHeaders) return details;
      const { url } = details;
      const subdomain = url.split('.')[0].split('//')[1];
      data['subdomain'] = subdomain;
      for (const header of details.requestHeaders) {
        const name = header.name.toLowerCase();
        if (['authorization'].includes(name)) {
          data[name] = header.value || "";
        }
      }
      chrome.webRequest.onBeforeSendHeaders.removeListener(onBeforeSendHeaders);
      if (Object.keys(data).length == 2) {
        chrome.storage.session.set({ "hibiscus-authorization": JSON.stringify(data) })
      }
      return details;
    }
    chrome.webRequest.onBeforeSendHeaders.addListener(
      onBeforeSendHeaders, {
        urls: [
          "http://localhost:5000/api/*",
          "https://*.mahindramobilitysolution.com/iTraMS-webservices/kyc/getAllKyc"
        ]
      }, ["requestHeaders"]
    );
  }
  return true;
}

chrome.runtime.onMessage.addListener(onMessage)
