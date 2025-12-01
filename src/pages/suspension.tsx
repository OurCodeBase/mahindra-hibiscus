import { Logo } from "@/components";

export default function App() {
  return (
    <div className="items-center bg-gradient-to-r from-[#191524] to-transparent">
      <Logo/>
      <div className="p-10 bg-gradient-to-t from-[#191524] to-transparent to-60%">
        <h1 className="text-6xl uppercase font-bold">
          Looking for source
        </h1>
        <p className="uppercase font-bold text-[12px] tracking-widest">
          Visit KYC portal and search a vin number
        </p>
      </div>
    </div>
  )
}
