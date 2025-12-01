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
    <div className="items-center bg-gradient-to-r from-[#191524] to-transparent">
      <Logo/>
      <div className="p-10 bg-gradient-to-t from-[#191524] to-transparent to-60%">
        <h1 className="text-6xl text-red-400 uppercase font-bold">
          You're blocked
        </h1>
        <p className="uppercase font-bold text-[12px] tracking-widest">
          You don't have access to use this extension.
        </p>
      </div>
    </div>
  )
}
