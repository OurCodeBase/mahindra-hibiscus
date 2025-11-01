import authGen from "../authgen"
import { Info } from "lucide-react";
import { Logo } from "../components";
import { useEffect, useRef, useState, type ReactNode } from "react";

export default function App({ children }: {children: ReactNode}) {
  const [rounds, setRounds] = useState<number>(0)
  const iRef = useRef<(HTMLInputElement | null)>(null)
  const [auth, setAuth] = useState<string | null>(null)
  const handleInput = (code: string) => {
    if (code.length == 6) {
      if (code == authGen()) {
        chrome.storage.session.set({ "shadow-code": code });
        setAuth(code);
      }
      else setRounds(rounds + 1);
    }
  }
  useEffect(() => {
    chrome.storage.session.get("shadow-code").then((response) => {
      if (response && response["shadow-code"]) setAuth(response["shadow-code"]);
    })
  }, [auth])
  useEffect(() => {
    if (rounds >= 3 && iRef.current) {
      const { current } = iRef;
      current.value = "";
      current.disabled = true;
      current.placeholder = "You are locked!";
    }
  }, [rounds])
  return auth ? children : (
    <div>
      <Logo/>
      <div className="w-full flex justify-center pb-15">
        <input
          ref={iRef}
          type="text"
          maxLength={6}
          inputMode="numeric"
          onChange={e => {handleInput(e.currentTarget.value)}}
          placeholder="Enter OTP to continue"
          className="px-4 bg-green-50 text-green-600 placeholder-stone-400 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all cursor-pointer"
        />
      </div>
      {(rounds > 0) && <div className="text-sm mt-3 p-3 flex flex-row text-red-500 font-bold bg-red-100 border-1">
        <Info className="mr-2 size-5"/>
        You have {3 - rounds} chance left.
      </div>}
    </div>
  )
}
