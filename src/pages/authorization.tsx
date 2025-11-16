import { Logo } from "../components";
import { useEffect, useState, type ReactNode } from "react";

async function checkLicense(): Promise<boolean> {
  try {
    const cache = await chrome.storage.session.get('unauthorized');
    if (cache && cache['unauthorized']) return cache['unauthorized'];
    const request = await fetch("https://mahindr.appwrite.network/license.json");
    const response:Array<string> = await request.json();
    await chrome.storage.session.set({
      unauthorized: !response.includes(import.meta.env.VITE_LICENSE_KEY)
    });
    return (!response.includes(import.meta.env.VITE_LICENSE_KEY));
  } catch (e) {
    if (e instanceof Error) console.error("License check failed:", e.message);
    return true;
  }
}

export default function App({ children }: { children: ReactNode }) {
  const [unauthorized, setUnauthorized] = useState(false);
  useEffect(() => {
    checkLicense().then((response) => {
      setUnauthorized(response);
    })
  }, [])
  if (!unauthorized) return children;
  return (
    <div className="py-16 px-16">
      <Logo/>
      <h1 className="font-mono font-bold text-center text-white w-full text-lg bg-red-600">
        You don't have access to use this extension.
      </h1>
    </div>
  )
}
