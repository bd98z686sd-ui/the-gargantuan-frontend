import {useCallback,useState} from 'react'
export function useSnackbar(){
  const[open,setOpen]=useState(false),[message,setMessage]=useState(''),[kind,setKind]=useState('ok')
  const show=useCallback((m,k='ok',ttl=2400)=>{setMessage(m);setKind(k);setOpen(true); if(ttl)setTimeout(()=>setOpen(false),ttl)},[])
  const close=()=>setOpen(false); return {open,message,kind,show,close}
}