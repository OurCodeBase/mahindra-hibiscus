import { useEffect, useState } from 'react';

type Token = {
  authorization: string;
}

type TokenHook = {
  token: Token | null;
  removeToken: () => void;
}

export default function App(): TokenHook {
  const [token, setToken] = useState<Token | null>(null);
  useEffect(() => {
    if (token != null) return;
    chrome.storage.session.get("hibiscus-authorization").then((response) => {
      if (response && response["hibiscus-authorization"]) {
        const authtokens = JSON.parse(response["hibiscus-authorization"])
        setToken(authtokens)
      } else {
        chrome.runtime.sendMessage({ type: 'HIBISCUS-AUTHORIZATION' })
      }
    })
  }, [token])
  const removeToken = () => {
    chrome.storage.session.remove("hibiscus-authorization");
    setToken(null);
  }
  return { token, removeToken };
};
